import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Product } from '../services/api';
import { addIcons } from 'ionicons';
import {
  star, starOutline, searchOutline, cartOutline,
  bagOutline, receiptOutline, addOutline, arrowForwardOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit, AfterViewInit {
  allItems: Product[] = [];
  items: Product[] = [];
  cart: Product[] = [];
  searchTerm: string = '';
  private map: L.Map | undefined;

  constructor(
    private api: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ star, starOutline, searchOutline, cartOutline, bagOutline, receiptOutline, addOutline, arrowForwardOutline });
  }

  viewProduct(product: Product) {
    this.router.navigate(['/product-detail', product.id]);
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCart();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 300);
  }

  ionViewWillEnter() {
    this.loadProducts();
    this.loadCart();
    // reinitialize map if needed
    if (!this.map) {
      setTimeout(() => this.initMap(), 300);
    }
  }

  initMap() {
    if (this.map) return; // prevent double init

    const mapEl = document.getElementById('store-map');
    if (!mapEl) return;

    // Fix default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Baguio City coordinates — change to your store location
    this.map = L.map('store-map', { zoomControl: true }).setView([16.9344, 120.4442], 15);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([16.9344, 120.4442])
      .addTo(this.map)
      .bindPopup('<b>marketplace</b><br>Visit our store!')
      .openPopup();
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
    this.api.addToCart(product).subscribe({
      next: async () => {
        this.loadCart();
        const toast = await this.toastCtrl.create({
          message: `${product.name} added to cart! 🛒`,
          duration: 2500,
          color: 'warning',
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