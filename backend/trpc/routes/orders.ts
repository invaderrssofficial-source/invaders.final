import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const ordersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    console.log("[Orders] Fetching all orders...");
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
    );
    
    try {
      const queryPromise = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error("[Orders] Error fetching orders:", error.message, error.code);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      console.log("[Orders] Successfully fetched", data?.length ?? 0, "orders");
      return (data ?? []).map((order: any) => ({
        id: order.id,
        productName: order.product_name,
        productImage: order.product_image,
        price: order.price,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        size: order.size,
        sizeCategory: order.size_category,
        sleeveType: order.sleeve_type || 'short',
        transferSlipUri: order.transfer_slip_uri,
        status: order.status,
        createdAt: order.created_at,
      }));
    } catch (err) {
      console.error("[Orders] Unexpected error:", err);
      throw err;
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        productName: z.string(),
        productImage: z.string(),
        price: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        size: z.string(),
        sizeCategory: z.enum(["adult", "kids"]),
        sleeveType: z.enum(["short", "long"]),
        transferSlipUri: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[Orders] Creating order for:", input.customerName);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Mutation timeout after 5s')), 5000)
      );
      
      try {
        const mutationPromise = supabase
          .from("orders")
          .insert({
            product_name: input.productName,
            product_image: input.productImage,
            price: input.price,
            customer_name: input.customerName,
            customer_phone: input.customerPhone,
            size: input.size,
            size_category: input.sizeCategory,
            sleeve_type: input.sleeveType,
            transfer_slip_uri: input.transferSlipUri,
            status: "pending",
          })
          .select()
          .single();

        const { data, error } = await Promise.race([mutationPromise, timeoutPromise]) as any;

        if (error) {
          console.error("[Orders] Error creating order:", error.message, error.code);
          throw new Error(`Failed to create order: ${error.message}`);
        }

        console.log("[Orders] Order created successfully:", data.id);
        return {
          id: data.id,
          productName: data.product_name,
          productImage: data.product_image,
          price: data.price,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          size: data.size,
          sizeCategory: data.size_category,
          sleeveType: data.sleeve_type || 'short',
          transferSlipUri: data.transfer_slip_uri,
          status: data.status,
          createdAt: data.created_at,
        };
      } catch (err) {
        console.error("[Orders] Unexpected error creating order:", err);
        throw err;
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
