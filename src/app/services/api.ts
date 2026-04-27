import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, switchMap } from 'rxjs';

export interface DeliveryOption {
  name: string;
  priceAdjustment: number;
  estimatedTime: string;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  tag: string;
  category: string;
  rating: number;
  description: string;
  img: string;
  quantity?: number;
  deliveryOptions?: DeliveryOption[];
}

export interface Order {
  id?: number;
  product: Product;
  customerName: string;
  contact: string;
  address: string;
  deliveryService: string;
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered';
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = 'https://server-g2y6.onrender.com';

  constructor(private http: HttpClient) {}

  // ── Products ──────────────────────────────────────────
  getProducts() {
    return this.http.get<Product[]>(this.baseUrl + '/products');
  }

  addProduct(product: Product) {
    return this.http.post<Product>(this.baseUrl + '/products', product);
  }

  updateProduct(product: Product) {
    return this.http.put<Product>(`${this.baseUrl}/products/${product.id}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.baseUrl}/products/${id}`);
  }

  // ── Cart ──────────────────────────────────────────────
  getCart() {
    return this.http.get<Product[]>(this.baseUrl + '/cart');
  }

  addToCart(product: Product) {
    return this.http.post<Product>(this.baseUrl + '/cart', product);
  }

  removeFromCart(id: number) {
    return this.http.delete(`${this.baseUrl}/cart/${id}`);
  }

  clearCart() {
    return this.http.get<Product[]>(this.baseUrl + '/cart').pipe(
      switchMap(items => {
        if (items.length === 0) return [[]];
        return forkJoin(items.map(item => this.http.delete(`${this.baseUrl}/cart/${item.id}`)));
      })
    );
  }

  // ── Orders ────────────────────────────────────────────
  getOrders() {
    return this.http.get<Order[]>(this.baseUrl + '/orders');
  }

  placeOrder(order: Omit<Order, 'id' | 'status'>) {
    const newOrder: Omit<Order, 'id'> = { ...order, status: 'Pending' };
    return this.http.post<Order>(this.baseUrl + '/orders', newOrder);
  }

  updateOrderStatus(id: number, status: Order['status']) {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}`, { status });
  }
}