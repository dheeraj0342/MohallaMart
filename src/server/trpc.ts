import { router, publicProcedure } from '@/lib/trpc';
import { z } from 'zod';

// Example router with some basic procedures
export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User procedures
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      // This would typically fetch from your database
      return { id: input.id, name: 'John Doe', email: 'john@example.com' };
    }),

  // Product procedures
  getProducts: publicProcedure
    .input(z.object({ 
      limit: z.number().optional(),
      category: z.string().optional(),
      search: z.string().optional()
    }))
    .query(({ input }) => {
      // This would typically fetch from your database
      console.log('Fetching products with filters:', input);
      return [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
      ];
    }),

  // Order procedures
  createOrder: publicProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
        price: z.number(),
      })),
      totalAmount: z.number(),
    }))
    .mutation(({ input }) => {
      // This would typically create an order in your database
      return { 
        orderId: 'order_' + Date.now(), 
        status: 'pending',
        totalAmount: input.totalAmount 
      };
    }),
});

export type AppRouter = typeof appRouter;
