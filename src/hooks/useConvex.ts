// Mock Convex hooks for development
// These will be replaced with actual Convex hooks once the backend is deployed

import { useState, useEffect } from "react";

// Mock data
interface MockProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  is_available: boolean;
  tags: string[];
  created_at: number;
  updated_at: number;
}

const mockProducts: MockProduct[] = [
  {
    _id: "1",
    name: "Fresh Bananas",
    description: "Organic ripe bananas (1kg)",
    price: 89,
    category: "Fruits",
    image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    stock_quantity: 50,
    is_available: true,
    tags: ["organic", "fresh", "tropical", "healthy"],
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  {
    _id: "2",
    name: "Organic Apples",
    description: "Red delicious apples (1kg)",
    price: 180,
    category: "Fruits",
    image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    stock_quantity: 30,
    is_available: true,
    tags: ["organic", "red", "crisp", "healthy"],
    created_at: Date.now(),
    updated_at: Date.now(),
  },
  {
    _id: "3",
    name: "Fresh Milk",
    description: "Full cream milk (1L)",
    price: 65,
    category: "Dairy",
    image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    stock_quantity: 100,
    is_available: true,
    tags: ["fresh", "dairy", "full-cream", "daily"],
    created_at: Date.now(),
    updated_at: Date.now(),
  },
];

// Mock hook implementations
const useMockQuery = <T>(data: T): T | undefined => {
  const [result, setResult] = useState<T | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(data);
    }, 500);

    return () => clearTimeout(timer);
  }, [data]);

  return result;
};

const useMockMutation = (mockFn: () => Promise<unknown>) => {
  const mutate = async () => {
    try {
      const result = await mockFn();
      console.log("Mock mutation result:", result);
      return result;
    } catch (error) {
      console.error("Mock mutation error:", error);
      throw error;
    }
  };

  return mutate;
};

// User hooks
export const useUser = (userId: string) => {
  return useMockQuery({ id: userId, name: "Test User", email: "test@example.com" });
};

export const useCreateUser = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useDeleteUser = () => {
  return useMockMutation(async () => ({ success: true }));
};

// Product hooks
export const useProducts = (category?: string, isAvailable?: boolean, limit?: number) => {
  let filteredProducts = mockProducts;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (isAvailable !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.is_available === isAvailable);
  }
  
  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }
  
  return useMockQuery(filteredProducts);
};

export const useProduct = (productId: string) => {
  const product = mockProducts.find(p => p._id === productId);
  return useMockQuery(product);
};

export const useSearchProducts = (query: string, category?: string, limit?: number) => {
  let filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }
  
  return useMockQuery(filteredProducts);
};

export const useCreateProduct = () => {
  return useMockMutation(async () => ({ 
    _id: Date.now().toString(), 
    success: true 
  }));
};

export const useUpdateProduct = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useDeleteProduct = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useProductsByCategory = (category: string) => {
  const products = mockProducts.filter(p => p.category === category);
  return useMockQuery(products);
};

export const useAvailableProducts = (limit?: number) => {
  const products = mockProducts.filter(p => p.is_available);
  return useMockQuery(limit ? products.slice(0, limit) : products);
};

// Cart hooks
export const useCart = () => {
  return useMockQuery([]);
};

export const useAddToCart = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useUpdateCartItem = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useRemoveFromCart = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useClearCart = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useCartTotal = () => {
  return useMockQuery({ totalItems: 0, totalPrice: 0 });
};

// Order hooks
export const useUserOrders = () => {
  return useMockQuery([]);
};

export const useOrder = () => {
  return useMockQuery(null);
};

export const useCreateOrder = () => {
  return useMockMutation(async () => ({ _id: Date.now().toString() }));
};

export const useAddOrderItem = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useUpdateOrderStatus = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useUpdatePaymentStatus = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useCancelOrder = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useOrdersByStatus = () => {
  return useMockQuery([]);
};

// Location hooks
export const useUserLocations = () => {
  return useMockQuery([]);
};

export const useDefaultLocation = () => {
  return useMockQuery(null);
};

export const useAddLocation = () => {
  return useMockMutation(async () => ({ _id: Date.now().toString() }));
};

export const useUpdateLocation = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useDeleteLocation = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useSetDefaultLocation = () => {
  return useMockMutation(async () => ({ success: true }));
};

// Notification hooks
export const useUserNotifications = () => {
  return useMockQuery([]);
};

export const useUnreadCount = () => {
  return useMockQuery(0);
};

export const useCreateNotification = () => {
  return useMockMutation(async () => ({ _id: Date.now().toString() }));
};

export const useMarkAsRead = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useMarkAllAsRead = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useDeleteNotification = () => {
  return useMockMutation(async () => ({ success: true }));
};

export const useCreateOrderNotification = () => {
  return useMockMutation(async () => ({ _id: Date.now().toString() }));
};
