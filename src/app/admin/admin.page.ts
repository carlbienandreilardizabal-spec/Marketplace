import { Component } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
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

  constructor(private api: ApiService, private alertCtrl: AlertController) {
    addIcons({ addOutline, pencilOutline, trashOutline, bicycleOutline, personOutline, callOutline, locationOutline, receiptOutline });
  }

  ionViewWillEnter() {
    this.loadProducts();
    this.loadOrders();
  }

  loadProducts() {
    this.api.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  loadOrders() {
    this.api.getOrders().subscribe(data => {
      this.orders = data;
    });
  }

  removeProduct(product: Product) {
    this.api.deleteProduct(product.id!).subscribe(() => {
      this.loadProducts();
    });
  }

  updateOrderStatus(order: Order, status: Order['status']) {
    this.api.updateOrderStatus(order.id!, status).subscribe(() => {
      order.status = status;
    });
  }

  // cycles through statuses on button click
  cycleStatus(order: Order) {
    const statuses: Order['status'][] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
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

  async openAddProductAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Add New Product',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Product Name' },
        { name: 'price', type: 'number', placeholder: 'Price' },
        { name: 'tag', type: 'text', placeholder: 'Tag' },
        { name: 'category', type: 'text', placeholder: 'Category' },
        { name: 'description', type: 'text', placeholder: 'Description' },
        { name: 'img', type: 'text', placeholder: 'Image URL' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.name || !data.price) return false;

            const newProduct: Product = {
              name: data.name,
              price: Number(data.price),
              tag: data.tag || '',
              category: data.category || '',
              img: data.img || '',
              description: data.description || '',
              rating: 0,
              quantity: 0,
              deliveryOptions: []
            };

            this.api.addProduct(newProduct).subscribe(() => {
              this.loadProducts();
            });
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async editProduct(product: Product) {
    const alert = await this.alertCtrl.create({
      header: `Edit Product: ${product.name}`,
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Product Name', value: product.name },
        { name: 'price', type: 'number', placeholder: 'Price', value: product.price },
        { name: 'tag', type: 'text', placeholder: 'Tag', value: product.tag },
        { name: 'category', type: 'text', placeholder: 'Category', value: product.category },
        { name: 'description', type: 'text', placeholder: 'Description', value: product.description },
        { name: 'img', type: 'text', placeholder: 'Image URL', value: product.img }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (!data.name || !data.price) return false;

            const updatedProduct: Product = {
              ...product,
              name: data.name,
              price: Number(data.price),
              tag: data.tag || '',
              category: data.category || '',
              description: data.description || '',
              img: data.img || ''
            };

            this.api.updateProduct(updatedProduct).subscribe(() => {
              this.loadProducts();
            });
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async addDeliveryOption(product: Product) {
    const alert = await this.alertCtrl.create({
      header: `Add Delivery Option for ${product.name}`,
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Delivery Name' },
        { name: 'priceAdjustment', type: 'number', placeholder: 'Price Adjustment' },
        { name: 'estimatedTime', type: 'text', placeholder: 'Estimated Delivery Time' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (!data.name) return false;

            const option: DeliveryOption = {
              name: data.name,
              priceAdjustment: Number(data.priceAdjustment) || 0,
              estimatedTime: data.estimatedTime || ''
            };

            if (!product.deliveryOptions) product.deliveryOptions = [];
            product.deliveryOptions.push(option);

            this.api.updateProduct(product).subscribe(() => {
              this.loadProducts();
            });
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  removeDeliveryOption(product: Product, option: DeliveryOption) {
    product.deliveryOptions = product.deliveryOptions?.filter(d => d.name !== option.name) || [];
    this.api.updateProduct(product).subscribe(() => {
      this.loadProducts();
    });
  }

  async editDeliveryOption(product: Product, option: DeliveryOption) {
    const alert = await this.alertCtrl.create({
      header: `Edit Delivery Option for ${product.name}`,
      inputs: [
        { name: 'name', type: 'text', value: option.name },
        { name: 'priceAdjustment', type: 'number', value: option.priceAdjustment },
        { name: 'estimatedTime', type: 'text', value: option.estimatedTime }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            option.name = data.name;
            option.priceAdjustment = Number(data.priceAdjustment) || 0;
            option.estimatedTime = data.estimatedTime || '';

            this.api.updateProduct(product).subscribe(() => {
              this.loadProducts();
            });
            return true;
          }
        }
      ]
    });

    await alert.present();
  }
}