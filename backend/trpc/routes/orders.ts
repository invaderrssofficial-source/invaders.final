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
  jerseyNumber: z.string(),
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
      console.log("[Orders] Creating order for:", input.customerName);
      console.log("[Orders] Items count:", input.items.length);
      
      const insertData = {
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        items: input.items,
        total_price: input.totalPrice,
        transfer_slip_uri: input.transferSlipUri,
        status: "pending",
      };
      
      console.log("[Orders] Insert data:", JSON.stringify(insertData));
      
      const result = await supabase
        .from("orders")
        .insert(insertData)
        .select()
        .single();

      console.log("[Orders] Supabase result:", JSON.stringify(result));

      if (result.error) {
        console.error("[Orders] Error creating order:", result.error.message, result.error.code, result.error.details);
        throw new Error(`Failed to create order: ${result.error.message}`);
      }

      if (!result.data) {
        console.error("[Orders] No data returned from insert");
        throw new Error('Failed to create order: No data returned');
      }

      console.log("[Orders] Order created successfully:", result.data.id);
      return {
        id: result.data.id,
        customerName: result.data.customer_name,
        customerPhone: result.data.customer_phone,
        items: result.data.items,
        totalPrice: result.data.total_price,
        transferSlipUri: result.data.transfer_slip_uri,
        status: result.data.status,
        createdAt: result.data.created_at,
      };
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: input.status })
          .eq("id", input.id);

        if (error) {
          console.error("[Orders] Error updating order status:", error);
          throw new Error(error.message);
        }

        return { success: true };
      } catch (error: any) {
        console.error("[Orders] Update status mutation failed:", error);
        throw new Error(error.message || 'Failed to update order status');
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabase.from("orders").delete().eq("id", input.id);

        if (error) {
          console.error("[Orders] Error deleting order:", error);
          throw new Error(error.message);
        }

        return { success: true };
      } catch (error: any) {
        console.error("[Orders] Delete mutation failed:", error);
        throw new Error(error.message || 'Failed to delete order');
      }
    }),
});
