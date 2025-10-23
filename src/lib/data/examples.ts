/**
 * Practical Examples of Data Management with Inngest Integration
 * 
 * This file demonstrates how to use the data synchronization system
 * for common MohallaMart operations.
 */

import { DataSyncManager } from './sync';
import { workflows, userEvents, orderEvents, productEvents } from '@/lib/inngest/events';

// Example 1: Complete User Registration Flow
export async function registerNewUser() {
  try {
    const userData = {
      id: "user_" + Date.now(),
      email: "john.doe@example.com",
      phone: "+91-9876543210",
      name: "John Doe",
      profileData: {
        address: "123 Main Street, Mumbai",
        preferences: {
          notifications: true,
          newsletter: true
        }
      }
    };

    // This single call handles everything:
    // 1. Creates user in Supabase
    // 2. Syncs to Convex for real-time updates
    // 3. Triggers Inngest events for background processing
    // 4. Updates search index
    const user = await DataSyncManager.createUser(userData);

    console.log("User registered successfully:", user);
    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Example 2: Product Creation and Inventory Management
export async function createProductWithInventory() {
  try {
    const productData = {
      id: "product_" + Date.now(),
      name: "Organic Apples",
      price: 150,
      category: "fruits",
      shopId: "shop_123",
      description: "Fresh organic apples from local farms",
      images: ["https://example.com/apple1.jpg", "https://example.com/apple2.jpg"],
      stock: 100
    };

    // Create product - automatically syncs across all services
    const product = await DataSyncManager.createProduct(productData);

    // Simulate inventory updates
    await DataSyncManager.updateProductStock(product.id, -10); // Sold 10 units
    await DataSyncManager.updateProductStock(product.id, -5);  // Sold 5 more units

    console.log("Product created and inventory updated:", product);
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

// Example 3: Order Processing Workflow
export async function processOrderWorkflow() {
  try {
    const orderData = {
      id: "order_" + Date.now(),
      userId: "user_123",
      items: [
        {
          productId: "product_123",
          quantity: 2,
          price: 150
        },
        {
          productId: "product_456",
          quantity: 1,
          price: 200
        }
      ],
      totalAmount: 500,
      deliveryAddress: {
        street: "456 Oak Avenue",
        city: "Mumbai",
        pincode: "400001",
        state: "Maharashtra"
      },
      paymentMethod: "razorpay"
    };

    // Create order - automatically triggers:
    // 1. Order creation in all services
    // 2. Inventory updates
    // 3. Confirmation email
    // 4. Analytics tracking
    const order = await DataSyncManager.createOrder(orderData);

    // Update order status
    await DataSyncManager.updateOrderStatus(order.id, "confirmed", "shop_123");
    await DataSyncManager.updateOrderStatus(order.id, "preparing", "shop_123");
    await DataSyncManager.updateOrderStatus(order.id, "out_for_delivery", "shop_123");

    console.log("Order processed successfully:", order);
    return order;
  } catch (error) {
    console.error("Error processing order:", error);
    throw error;
  }
}

// Example 4: Using Event-Driven Workflows
export async function eventDrivenWorkflows() {
  try {
    // User registration workflow
    await workflows.userRegistration({
      userId: "user_456",
      email: "jane.doe@example.com",
      name: "Jane Doe"
    });

    // Product indexing workflow
    await workflows.productIndexing({
      type: "product",
      id: "product_789",
      data: {
        name: "Fresh Bananas",
        price: 80,
        category: "fruits",
        shopId: "shop_456"
      }
    });

    console.log("Event-driven workflows completed successfully");
  } catch (error) {
    console.error("Error in event-driven workflows:", error);
    throw error;
  }
}

// Example 5: Direct Event Sending
export async function directEventSending() {
  try {
    // Send individual events
    await userEvents.created({
      userId: "user_789",
      email: "bob.smith@example.com",
      name: "Bob Smith"
    });

    await productEvents.created({
      productId: "product_999",
      name: "Fresh Mangoes",
      price: 120,
      category: "fruits",
      shopId: "shop_789"
    });

    await orderEvents.created({
      orderId: "order_999",
      userId: "user_789",
      items: [
        {
          productId: "product_999",
          quantity: 3,
          price: 120
        }
      ],
      totalAmount: 360,
      deliveryAddress: {
        street: "789 Pine Street",
        city: "Delhi",
        pincode: "110001",
        state: "Delhi"
      }
    });

    console.log("Direct events sent successfully");
  } catch (error) {
    console.error("Error sending direct events:", error);
    throw error;
  }
}

// Example 6: Search and Data Retrieval
export async function searchAndRetrieveData() {
  try {
    // Search products
    const searchResults = await DataSyncManager.searchProducts("apples");
    console.log("Search results:", searchResults);

    // Get specific product
    const product = await DataSyncManager.getProduct("product_123");
    console.log("Product details:", product);

    return { searchResults, product };
  } catch (error) {
    console.error("Error searching and retrieving data:", error);
    throw error;
  }
}

// Example 7: Error Handling and Retry Logic
export async function errorHandlingExample() {
  try {
    // This will automatically handle errors and retries via Inngest
    const userData = {
      id: "user_error_test",
      email: "error.test@example.com",
      name: "Error Test User"
    };

    const user = await DataSyncManager.createUser(userData);
    console.log("User created with error handling:", user);
    return user;
  } catch (error) {
    // Inngest will automatically retry failed operations
    console.error("Error handled by Inngest retry logic:", error);
    throw error;
  }
}

// Example 8: Batch Operations
export async function batchOperations() {
  try {
    const products = [
      {
        id: "batch_product_1",
        name: "Product 1",
        price: 100,
        category: "category1",
        shopId: "shop_123"
      },
      {
        id: "batch_product_2",
        name: "Product 2",
        price: 200,
        category: "category2",
        shopId: "shop_123"
      }
    ];

    // Create multiple products
    const createdProducts = await Promise.all(
      products.map(product => DataSyncManager.createProduct(product))
    );

    console.log("Batch operations completed:", createdProducts);
    return createdProducts;
  } catch (error) {
    console.error("Error in batch operations:", error);
    throw error;
  }
}

// Example 9: Real-time Updates
export async function realTimeUpdates() {
  try {
    // Create a product
    const product = await DataSyncManager.createProduct({
      id: "realtime_product",
      name: "Real-time Product",
      price: 150,
      category: "test",
      shopId: "shop_123"
    });

    // Update stock - this will trigger real-time updates via Convex
    await DataSyncManager.updateProductStock(product.id, -5);

    console.log("Real-time updates triggered");
    return product;
  } catch (error) {
    console.error("Error in real-time updates:", error);
    throw error;
  }
}

// Example 10: Monitoring and Analytics
export async function monitoringExample() {
  try {
    // Create some test data
    const user = await DataSyncManager.createUser({
      id: "monitor_user",
      email: "monitor@example.com",
      name: "Monitor User"
    });

    const product = await DataSyncManager.createProduct({
      id: "monitor_product",
      name: "Monitor Product",
      price: 100,
      category: "monitoring",
      shopId: "shop_123"
    });

    // This will trigger analytics tracking via Inngest
    await workflows.userRegistration({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    console.log("Monitoring and analytics triggered");
    return { user, product };
  } catch (error) {
    console.error("Error in monitoring example:", error);
    throw error;
  }
}

// Export all examples for easy testing
export const examples = {
  registerNewUser,
  createProductWithInventory,
  processOrderWorkflow,
  eventDrivenWorkflows,
  directEventSending,
  searchAndRetrieveData,
  errorHandlingExample,
  batchOperations,
  realTimeUpdates,
  monitoringExample
};
