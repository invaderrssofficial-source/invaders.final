import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const merchRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    try {
      console.log("[Merch] Fetching all merch items...");
      
      const { data, error } = await Promise.race([
        supabase
          .from("merch_items")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(100),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 8000)
        )
      ]);

      if (error) {
        console.error("[Merch] Error fetching items:", error.message);
        return [];
      }

      console.log("[Merch] Successfully fetched", data?.length ?? 0, "items");
      return (data ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      }));
    } catch (error) {
      console.error("[Merch] Query failed:", error);
      return [];
    }
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
      try {
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
          console.error("[Merch] Error creating merch item:", error);
          throw new Error(error.message);
        }

        return {
          id: data.id,
          name: data.name,
          price: data.price,
          image: data.image,
        };
      } catch (error: any) {
        console.error("[Merch] Create mutation failed:", error);
        throw new Error(error.message || 'Failed to create merchandise');
      }
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
      console.log("[Merch] Updating merch item:", input.id);
      const { id, ...updates } = input;
      
      const result = await supabase
        .from("merch_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      console.log("[Merch] Update result:", JSON.stringify(result));

      if (result.error) {
        console.error("[Merch] Error updating merch item:", result.error.message);
        throw new Error(result.error.message);
      }

      return { success: true, data: result.data };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabase.from("merch_items").delete().eq("id", input.id);

        if (error) {
          console.error("[Merch] Error deleting merch item:", error);
          throw new Error(error.message);
        }

        return { success: true };
      } catch (error: any) {
        console.error("[Merch] Delete mutation failed:", error);
        throw new Error(error.message || 'Failed to delete merchandise');
      }
    }),
});
