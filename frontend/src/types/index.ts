// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'guest' | 'admin' | 'kitchen_staff' | 'manager';
  phone?: string;
  roomNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  user: User;
  token: string;
}

// Menu Types
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number; // in minutes
  isAvailable: boolean;
  nutritionalInfo?: NutritionalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  _id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  guestId: string;
  guest: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: 'room_service' | 'restaurant' | 'takeaway';
  roomNumber?: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: string[];
  specialRequests?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

// Inventory Types
export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitCost: number;
  supplier?: string;
  expiryDate?: string;
  lastRestocked: string;
  isActive: boolean;
}

// Report Types
export interface SalesReport {
  _id: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: TopSellingItem[];
  ordersByCategory: CategorySales[];
  hourlyDistribution: HourlySales[];
  paymentMethods: PaymentMethodStats[];
}

export interface TopSellingItem {
  menuItem: MenuItem;
  quantitySold: number;
  revenue: number;
}

export interface CategorySales {
  category: string;
  orders: number;
  revenue: number;
}

export interface HourlySales {
  hour: number;
  orders: number;
  revenue: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  amount: number;
}

export interface WasteReport {
  _id: string;
  date: string;
  items: WasteItem[];
  totalWasteValue: number;
  wasteByCategory: CategoryWaste[];
}

export interface WasteItem {
  menuItem: MenuItem;
  quantity: number;
  reason: 'expired' | 'damaged' | 'overproduction' | 'customer_return' | 'other';
  value: number;
  notes?: string;
}

export interface CategoryWaste {
  category: string;
  quantity: number;
  value: number;
}

// Feedback Types
export interface Feedback {
  _id: string;
  orderId: string;
  guestId: string;
  rating: number; // 1-5
  comment?: string;
  foodQuality: number;
  serviceQuality: number;
  deliveryTime: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  roomNumber?: string;
}

export interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number;
  image?: File;
}

export interface OrderForm {
  items: {
    menuItemId: string;
    quantity: number;
    customizations?: string[];
    specialRequests?: string;
  }[];
  orderType: 'room_service' | 'restaurant' | 'takeaway';
  roomNumber?: string;
  specialInstructions?: string;
}
