import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const ordersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error fetching orders:", error);
      throw new Error(error.message);
    }

    return data.map((order) => ({
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
      const { data, error } = await supabase
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

      if (error) {
        console.log("Error creating order:", error);
        throw new Error(error.message);
      }

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
