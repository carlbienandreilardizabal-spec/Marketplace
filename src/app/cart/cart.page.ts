import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Product } from '../services/api';
import { addIcons } from 'ionicons';
import { trashOutline, bagOutline, homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class CartPage implements OnInit {

  cart: Product[] = [];
  showCheckout = false;

  // Form fields
  checkoutName = '';
  checkoutContact = '';
  checkoutAddress = '';
  formError = '';

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController
  ) {
    addIcons({ trashOutline, bagOutline, homeOutline });
  }

  ngOnInit() { this.loadCart(); }
  ionViewWillEnter() { this.loadCart(); }

  loadCart() {
    this.api.getCart().subscribe(data => { this.cart = data; });
  }

  get isCartEmpty(): boolean { return this.cart.length === 0; }

  getTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price, 0);
  }

  removeItem(item: Product) {
    if (item.id == null) return;
    this.api.removeFromCart(item.id).subscribe(() => this.loadCart());
  }

  async clearAll() {
    this.api.clearCart().subscribe(() => this.loadCart());
  }

  checkout() {
    this.showCheckout = true;
    this.formError = '';
  }

  cancelCheckout() {
    this.showCheckout = false;
    this.checkoutName = '';
    this.checkoutContact = '';
    this.checkoutAddress = '';
    this.formError = '';
  }

  placeOrder() {
    if (!this.checkoutName.trim()) {
      this.formError = 'Please enter your full name.'; return;
    }
    if (!this.checkoutContact.trim()) {
      this.formError = 'Please enter your contact number.'; return;
    }
    if (!this.checkoutAddress.trim()) {
      this.formError = 'Please enter your delivery address.'; return;
    }

    this.formError = '';

    const orderRequests = this.cart.map(item =>
      this.api.placeOrder({
        product: item,
        customerName: this.checkoutName,
        contact: this.checkoutContact,
        address: this.checkoutAddress,
        deliveryService: item.deliveryOptions?.[0]?.name || 'Standard'
      })
    );

    let completed = 0;
    orderRequests.forEach(req => {
      req.subscribe(() => {
        completed++;
        if (completed === orderRequests.length) {
          this.api.clearCart().subscribe(() => {
            this.loadCart();
            this.cancelCheckout();
            this.showSuccessToast();
          });
        }
      });
    });
  }

  private async showSuccessToast() {
    const toast = await this.toastCtrl.create({
      message: '🎉 Order placed successfully!',
      duration: 2500,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }
}
