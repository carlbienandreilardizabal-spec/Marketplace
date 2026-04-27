import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Product } from '../services/api';
import { addIcons } from 'ionicons';
import {
  star, starOutline, searchOutline, cartOutline,
  bagOutline, receiptOutline, addOutline, arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit {
  allItems: Product[] = [];
  items: Product[] = [];
  cart: Product[] = [];
  searchTerm: string = '';

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController
  ) {
    addIcons({ star, starOutline, searchOutline, cartOutline, bagOutline, receiptOutline, addOutline, arrowForwardOutline });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCart();
  }

  ionViewWillEnter() {
    this.loadProducts();
    this.loadCart();
  }

  loadProducts() {
    this.api.getProducts().subscribe(data => {
      this.allItems = data;
      this.applySearch();
    });
  }

  loadCart() {
    this.api.getCart().subscribe(data => {
      this.cart = data;
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.detail.value?.trim().toLowerCase() || '';
    this.applySearch();
  }

  private applySearch() {
    if (!this.searchTerm) {
      this.items = [...this.allItems];
    } else {
      this.items = this.allItems.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm) ||
        p.category.toLowerCase().includes(this.searchTerm) ||
        p.tag?.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  async addToCart(product: Product) {
    this.api.addToCart(product).subscribe(async () => {
      this.loadCart();
      const toast = await this.toastCtrl.create({
        message: `${product.name} added to cart!`,
        duration: 2000,
        color: 'success'
      });
      toast.present();
    });
  }

  onNativeSearch(event: any) {
    this.searchTerm = event.target.value?.trim().toLowerCase() || '';
    this.applySearch();
  }

  setRating(product: Product, rating: number) {
    const index = this.allItems.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.allItems[index].rating = rating;
      this.applySearch();

      this.api.updateProduct(this.allItems[index]).subscribe();
    }
  }
}