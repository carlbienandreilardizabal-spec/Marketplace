import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then( m => m.AdminPage)
  },
  {
  path: 'customer-orders',
  loadComponent: () => import('./customer-orders/customer-orders.page').then(m => m.CustomerOrdersPage)
},
  {
    path: 'product-detail',
    loadComponent: () => import('./product-detail/product-detail.page').then( m => m.ProductDetailPage)
  },
  {
  path: 'product-detail/:id',
  loadComponent: () =>
    import('./product-detail/product-detail.page').then(m => m.ProductDetailPage)
   },

];
