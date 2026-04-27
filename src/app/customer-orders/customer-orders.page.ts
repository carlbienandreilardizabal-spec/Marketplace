import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Order } from '../services/api';
import { addIcons } from 'ionicons';
import { receiptOutline, bicycleOutline, personOutline, callOutline } from 'ionicons/icons';

@Component({
  selector: 'app-customer-orders',
  templateUrl: './customer-orders.page.html',
  styleUrls: ['./customer-orders.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class CustomerOrdersPage implements OnInit {
  orders: Order[] = [];

  constructor(private api: ApiService) {
    addIcons({ receiptOutline, bicycleOutline, personOutline, callOutline });
  }

  ngOnInit() {
    this.loadOrders();
  }

  ionViewWillEnter() {
    this.loadOrders();
  }

  loadOrders() {
    this.api.getOrders().subscribe(data => {
      this.orders = data;
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/ /g, '-');
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