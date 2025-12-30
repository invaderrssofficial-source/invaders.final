import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const merchRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("merch_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Error fetching merch items:", error);
      throw new Error(error.message);
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    }));
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.string(),
        image: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("merch_items")
        .insert({
          name: input.name,
          price: input.price,
          image: input.image,
        })
        .select()
        .single();

      if (error) {
        console.log("Error creating merch item:", error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        name: data.name,
        price: data.price,
        image: data.image,
      };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        price: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const { error } = await supabase.from("merch_items").update(updates).eq("id", id);

      if (error) {
        console.log("Error updating merch item:", error);
        throw new Error(error.message);
      }

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase.from("merch_items").delete().eq("id", input.id);

      if (error) {
        console.log("Error deleting merch item:", error);
        throw new Error(error.message);
      }

      return { success: true };
    }),
});
