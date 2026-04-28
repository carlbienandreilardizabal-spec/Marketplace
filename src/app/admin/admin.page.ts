import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Product, Order, DeliveryOption } from '../services/api';
import { addIcons } from 'ionicons';
import {
  addOutline, pencilOutline, trashOutline, bicycleOutline,
  personOutline, callOutline, locationOutline, receiptOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminPage {
  products: Product[] = [];
  orders: Order[] = [];

  // Modal state
  showProductModal = false;
  showDeliveryModal = false;
  editingProduct: Product | null = null;
  editingDelivery: DeliveryOption | null = null;
  selectedProductForDelivery: Product | null = null;

  productForm = {
    name: '', price: 0, tag: '', category: '', description: '', img: ''
  };

  deliveryForm = {
    name: '', priceAdjustment: 0, estimatedTime: ''
  };

  constructor(private api: ApiService) {
    addIcons({ addOutline, pencilOutline, trashOutline, bicycleOutline, personOutline, callOutline, locationOutline, receiptOutline });
  }

  ionViewWillEnter() {
    this.loadProducts();
    this.loadOrders();
  }

  loadProducts() {
    this.api.getProducts().subscribe(data => this.products = data);
  }

  loadOrders() {
    this.api.getOrders().subscribe(data => this.orders = data);
  }

  // ── PRODUCT MODAL ──────────────────────────────────────
  openAddProductModal() {
    this.editingProduct = null;
    this.productForm = { name: '', price: 0, tag: '', category: '', description: '', img: '' };
    this.showProductModal = true;
  }

  openEditProductModal(product: Product) {
    this.editingProduct = product;
    this.productForm = {
      name: product.name,
      price: product.price,
      tag: product.tag,
      category: product.category,
      description: product.description,
      img: product.img
    };
    this.showProductModal = true;
  }

  saveProduct() {
    if (!this.productForm.name || !this.productForm.price) return;

    if (this.editingProduct) {
      const updated: Product = {
        ...this.editingProduct,
        ...this.productForm,
        price: Number(this.productForm.price)
      };
      this.api.updateProduct(updated).subscribe(() => {
        this.loadProducts();
        this.closeModal();
      });
    } else {
      const newProduct: Product = {
        ...this.productForm,
        price: Number(this.productForm.price),
        rating: 0,
        quantity: 0,
        deliveryOptions: []
      };
      this.api.addProduct(newProduct).subscribe(() => {
        this.loadProducts();
        this.closeModal();
      });
    }
  }

  removeProduct(product: Product) {
    if (confirm(`Delete ${product.name}?`)) {
      this.api.deleteProduct(product.id!).subscribe(() => this.loadProducts());
    }
  }

  // ── DELIVERY MODAL ─────────────────────────────────────
  openAddDeliveryModal(product: Product) {
    this.selectedProductForDelivery = product;
    this.editingDelivery = null;
    this.deliveryForm = { name: '', priceAdjustment: 0, estimatedTime: '' };
    this.showDeliveryModal = true;
  }

  openEditDeliveryModal(product: Product, option: DeliveryOption) {
    this.selectedProductForDelivery = product;
    this.editingDelivery = option;
    this.deliveryForm = {
      name: option.name,
      priceAdjustment: option.priceAdjustment,
      estimatedTime: option.estimatedTime
    };
    this.showDeliveryModal = true;
  }

  saveDelivery() {
    if (!this.deliveryForm.name || !this.selectedProductForDelivery) return;
    const product = this.selectedProductForDelivery;

    if (this.editingDelivery) {
      this.editingDelivery.name = this.deliveryForm.name;
      this.editingDelivery.priceAdjustment = Number(this.deliveryForm.priceAdjustment);
      this.editingDelivery.estimatedTime = this.deliveryForm.estimatedTime;
    } else {
      if (!product.deliveryOptions) product.deliveryOptions = [];
      product.deliveryOptions.push({
        name: this.deliveryForm.name,
        priceAdjustment: Number(this.deliveryForm.priceAdjustment),
        estimatedTime: this.deliveryForm.estimatedTime
      });
    }

    this.api.updateProduct(product).subscribe(() => {
      this.loadProducts();
      this.closeModal();
    });
  }

  removeDeliveryOption(product: Product, option: DeliveryOption) {
    product.deliveryOptions = product.deliveryOptions?.filter(d => d.name !== option.name) || [];
    this.api.updateProduct(product).subscribe(() => this.loadProducts());
  }

  closeModal() {
    this.showProductModal = false;
    this.showDeliveryModal = false;
    this.editingProduct = null;
    this.editingDelivery = null;
    this.selectedProductForDelivery = null;
  }

  // ── ORDERS ─────────────────────────────────────────────
  updateOrderStatus(order: Order, status: Order['status']) {
    this.api.updateOrderStatus(order.id!, status).subscribe(() => {
      order.status = status;
    });
  }

  cycleStatus(order: Order) {
    const statuses: Order['status'][] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
    const nextStatus = statuses[(statuses.indexOf(order.status) + 1) % statuses.length];
    this.api.updateOrderStatus(order.id!, nextStatus).subscribe(() => {
      order.status = nextStatus;
    });
  }

  getPendingCount(): number {
    return this.orders.filter(o => o.status === 'Pending').length;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'medium';
      case 'Preparing': return 'warning';
      case 'Out for Delivery': return 'primary';
      case 'Delivered': return 'success';
      default: return 'medium';
    }
  }
}