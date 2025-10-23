/**
 * Data Synchronization Layer
 * 
 * This module handles data synchronization between:
 * - Supabase (Primary Database)
 * - Convex (Real-time Layer)
 * - Inngest (Background Jobs)
 * - Redis (Cache)
 * - Typesense (Search)
 */

import { createClient } from '@supabase/supabase-js';
// import { inngest } from '@/lib/inngest';
import { userEvents, orderEvents, productEvents, searchEvents } from '@/lib/inngest/events';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Convex client will be initialized when Convex is set up
// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Data Synchronization Manager
 * Handles all data operations across different services
 */
export class DataSyncManager {
  /**
   * Create a new user and sync across all services
   */
  static async createUser(userData: {
    id: string;
    email?: string;
    phone?: string;
    name?: string;
    profileData?: Record<string, unknown>;
  }) {
    try {
      // 1. Create user in Supabase (primary database)
      const { data: supabaseUser, error: supabaseError } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          phone: userData.phone,
          name: userData.name,
          profile_data: userData.profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // 2. Sync to Convex for real-time updates (when Convex is set up)
      // await convex.mutation(api.users.create, {
      //   id: userData.id,
      //   email: userData.email,
      //   phone: userData.phone,
      //   name: userData.name,
      //   profileData: userData.profileData,
      // });

      // 3. Trigger Inngest events for background processing
      await userEvents.created({
        userId: userData.id,
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
      });

      // 4. Update search index
      await searchEvents.index({
        type: 'user',
        id: userData.id,
        data: {
          name: userData.name,
          email: userData.email,
        },
      });

      return supabaseUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Create a new product and sync across all services
   */
  static async createProduct(productData: {
    id: string;
    name: string;
    price: number;
    category: string;
    shopId: string;
    description?: string;
    images?: string[];
    stock?: number;
  }) {
    try {
      // 1. Create product in Supabase
      const { data: supabaseProduct, error: supabaseError } = await supabase
        .from('products')
        .insert({
          id: productData.id,
          name: productData.name,
          price: productData.price,
          category: productData.category,
          shop_id: productData.shopId,
          description: productData.description,
          images: productData.images,
          stock: productData.stock || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // 2. Sync to Convex (when Convex is set up)
      // await convex.mutation(api.products.create, {
      //   id: productData.id,
      //   name: productData.name,
      //   price: productData.price,
      //   category: productData.category,
      //   shopId: productData.shopId,
      //   description: productData.description,
      //   images: productData.images,
      //   stock: productData.stock,
      // });

      // 3. Trigger Inngest events
      await productEvents.created({
        productId: productData.id,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        shopId: productData.shopId,
      });

      // 4. Update search index
      await searchEvents.index({
        type: 'product',
        id: productData.id,
        data: {
          name: productData.name,
          price: productData.price,
          category: productData.category,
          shopId: productData.shopId,
          description: productData.description,
        },
      });

      return supabaseProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Create a new order and sync across all services
   */
  static async createOrder(orderData: {
    id: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    deliveryAddress: {
      street: string;
      city: string;
      pincode: string;
      state: string;
    };
    paymentMethod?: string;
  }) {
    try {
      // 1. Create order in Supabase
      const { data: supabaseOrder, error: supabaseError } = await supabase
        .from('orders')
        .insert({
          id: orderData.id,
          user_id: orderData.userId,
          items: orderData.items,
          total_amount: orderData.totalAmount,
          delivery_address: orderData.deliveryAddress,
          payment_method: orderData.paymentMethod,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // 2. Sync to Convex (when Convex is set up)
      // await convex.mutation(api.orders.create, {
      //   id: orderData.id,
      //   userId: orderData.userId,
      //   items: orderData.items,
      //   totalAmount: orderData.totalAmount,
      //   deliveryAddress: orderData.deliveryAddress,
      //   paymentMethod: orderData.paymentMethod,
      // });

      // 3. Trigger Inngest events
      await orderEvents.created({
        orderId: orderData.id,
        userId: orderData.userId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        deliveryAddress: orderData.deliveryAddress,
      });

      // 4. Update inventory
      for (const item of orderData.items) {
        await this.updateProductStock(item.productId, -item.quantity);
      }

      return supabaseOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update product stock and sync across services
   */
  static async updateProductStock(productId: string, stockChange: number) {
    try {
      // 1. Update stock in Supabase
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock, name, shop_id')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const newStock = Math.max(0, (product.stock || 0) + stockChange);
      const isOutOfStock = newStock === 0;

      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // 2. Sync to Convex (when Convex is set up)
      // await convex.mutation(api.products.updateStock, {
      //   productId,
      //   stock: newStock,
      // });

      // 3. Trigger Inngest events
      await productEvents.updated({
        productId,
        stock: newStock,
      });

      // 4. Handle out of stock alert
      if (isOutOfStock && product.stock > 0) {
        await productEvents.outOfStock({
          productId,
          name: product.name,
          shopId: product.shop_id,
        });
      }

      return { productId, newStock, isOutOfStock };
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  /**
   * Update order status and sync across services
   */
  static async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled',
    updatedBy: string
  ) {
    try {
      // 1. Update status in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 2. Sync to Convex (when Convex is set up)
      // await convex.mutation(api.orders.updateStatus, {
      //   orderId,
      //   status,
      //   updatedBy,
      // });

      // 3. Trigger Inngest events
      await orderEvents.updated({
        orderId,
        status,
        updatedBy,
      });

      return { orderId, status, updatedBy };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get data with caching strategy
   */
  static async getProduct(productId: string, useCache: boolean = true) {
    try {
      // 1. Try Redis cache first (if enabled and useCache is true)
      // TODO: Implement Redis caching
      
      // 2. Get from Supabase
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      // 3. Cache the result (if caching is enabled)
      // TODO: Implement Redis caching

      return product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  /**
   * Search products with Typesense integration
   */
  static async searchProducts(query: string, filters?: Record<string, unknown>) {
    try {
      // 1. Try Redis cache first
      // TODO: Implement Redis caching for search results
      
      // 2. Search in Typesense
      // TODO: Implement Typesense search
      
      // 3. Fallback to Supabase search if Typesense is unavailable
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

/**
 * Event-driven data synchronization
 * These functions are called by Inngest when events are triggered
 */
export const dataSyncEvents = {
  /**
   * Handle user creation event
   */
  async handleUserCreated(eventData: Record<string, unknown>) {
    console.log('Handling user created event:', eventData);
    // Additional processing logic here
  },

  /**
   * Handle order creation event
   */
  async handleOrderCreated(eventData: Record<string, unknown>) {
    console.log('Handling order created event:', eventData);
    // Additional processing logic here
  },

  /**
   * Handle product update event
   */
  async handleProductUpdated(eventData: Record<string, unknown>) {
    console.log('Handling product updated event:', eventData);
    // Additional processing logic here
  },
};

export default DataSyncManager;
