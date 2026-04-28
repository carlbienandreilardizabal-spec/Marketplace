import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Product } from '../services/api';
import { addIcons } from 'ionicons';
import { star, starOutline, cartOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toastCtrl: ToastController
  ) {
    addIcons({ star, starOutline, cartOutline, arrowBackOutline });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProducts().subscribe(products => {
      this.product = products.find(p => p.id === id) || null;
    });
  }

  async addToCart() {
  if (!this.product) return;
  this.api.addToCart(this.product).subscribe({
    next: async () => {
      const toast = await this.toastCtrl.create({
        message: `${this.product!.name} added to cart! 🛒`,
        duration: 2500,
        color: 'success',
        position: 'top',
        cssClass: 'custom-toast'
      });
      await toast.present();
    },
    error: async () => {
      const toast = await this.toastCtrl.create({
        message: 'Failed to add to cart. Try again.',
        duration: 2500,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  });
}

  setRating(rating: number) {
    if (!this.product) return;
    this.product.rating = rating;
    this.api.updateProduct(this.product).subscribe();
  }
}