import { Injectable } from '@angular/core';

export interface DeliveryOption {
  name: string;
  priceAdjustment: number;
  estimatedTime: string;
}

export interface Product {
  name: string;
  price: number;
  tag: string;
  category: string;
  rating: number;
  description: string;
  img: string;
  quantity?: number; // for cart only
  deliveryOptions?: DeliveryOption[];
}

export interface Order {
  id: number;
  product: Product;
  customerName: string;
  contact: string;
  address: string;
  deliveryService: string;
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered';
}

@Injectable({ providedIn: 'root' })
export class Cart {
  private products: Product[] = []; // all marketplace products (admin)
  private cart: Product[] = [];     // customer cart
  private orders: Order[] = [];
  private nextOrderId = 1;

  constructor() {
    // Load saved products
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) this.products = JSON.parse(savedProducts);

    // Load saved orders
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
      if (this.orders.length > 0) {
        this.nextOrderId = Math.max(...this.orders.map(o => o.id)) + 1;
      }
    }

    // Load saved cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) this.cart = JSON.parse(savedCart);
  }

  /* for admin */
  getProducts(): Product[] {
    return this.products;
  }

  addProduct(product: Product) {
    this.products.push(product);
    this.saveProducts();
    console.log('Product added:', product);
  }

  removeProduct(productName: string) {
    this.products = this.products.filter(p => p.name !== productName);
    this.saveProducts();
    console.log('Product removed:', productName);
  }

  editProduct(updatedProduct: Product) {
    const index = this.products.findIndex(p => p.name === updatedProduct.name);
    if (index !== -1) {
      this.products[index] = updatedProduct;
      this.saveProducts();
      console.log('Product updated:', updatedProduct);
    }
  }

  private saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  /* ================= CART METHODS ================= */
  getCart(): Product[] {
    return this.cart;
  }

  addToCart(product: Product) {
    const existing = this.cart.find(p => p.name === product.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.saveCart();
    console.log('Cart updated:', this.cart);
  }

  removeFromCart(productName: string) {
    this.cart = this.cart.filter(p => p.name !== productName);
    this.saveCart();
    console.log('Removed from cart:', productName);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  /* ================= ORDER METHODS ================= */
  getOrders(): Order[] {
    return this.orders;
  }

  addOrder(order: Omit<Order, 'id' | 'status'>) {
    const newOrder: Order = { ...order, id: this.nextOrderId++, status: 'Pending' };
    this.orders.push(newOrder);
    this.saveOrders();
    console.log('Order added:', newOrder);
  }

  updateOrderStatus(orderId: number, status: Order['status']) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveOrders();
      console.log(`Order #${orderId} status updated to ${status}`);
    }
  }

  clearOrders() {
    this.orders = [];
    localStorage.removeItem('orders');
  }

  private saveOrders() {
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }
}
