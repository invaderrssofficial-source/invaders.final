import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

const orderItemSchema = z.object({
  productName: z.string(),
  productImage: z.string(),
  price: z.string(),
  size: z.string(),
  sizeCategory: z.enum(["adult", "kids"]),
  sleeveType: z.enum(["short", "long"]),
  jerseyName: z.string(),
  quantity: z.number(),
});

export const ordersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    try {
      console.log("[Orders] Fetching all orders...");
      
      const { data, error } = await Promise.race([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 8000)
        )
      ]);

      if (error) {
        console.error("[Orders] Error fetching orders:", error.message);
        return [];
      }

      console.log("[Orders] Successfully fetched", data?.length ?? 0, "orders");
      return (data ?? []).map((order: any) => ({
        id: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        items: order.items || [],
        totalPrice: order.total_price,
        transferSlipUri: order.transfer_slip_uri,
        status: order.status,
        createdAt: order.created_at,
      }));
    } catch (error) {
      console.error("[Orders] Query failed:", error);
      return [];
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        items: z.array(orderItemSchema),
        totalPrice: z.string(),
        transferSlipUri: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Orders] Creating order for:", input.customerName);
        
        const { data, error } = await Promise.race([
          supabase
            .from("orders")
            .insert({
              customer_name: input.customerName,
              customer_phone: input.customerPhone,
              items: input.items,
              total_price: input.totalPrice,
              transfer_slip_uri: input.transferSlipUri,
              status: "pending",
            })
            .select()
            .single(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Insert timeout')), 5000)
          )
        ]);

        if (error) {
          console.error("[Orders] Error creating order:", error.message);
          throw new Error(`Failed to create order: ${error.message}`);
        }

        console.log("[Orders] Order created successfully:", data.id);
        return {
          id: data.id,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          items: data.items,
          totalPrice: data.total_price,
          transferSlipUri: data.transfer_slip_uri,
          status: data.status,
          createdAt: data.created_at,
        };
      } catch (error: any) {
        console.error("[Orders] Mutation failed:", error);
        throw new Error(error.message || 'Failed to create order');
      }
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: input.status })
        .eq("id", input.id);

      if (error) {
        console.log("Error updating order status:", error);
        throw new Error(error.message);
      }

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase.from("orders").delete().eq("id", input.id);

      if (error) {
        console.log("Error deleting order:", error);
        throw new Error(error.message);
      }

      return { success: true };
    }),
});
