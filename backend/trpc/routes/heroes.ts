import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const heroesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    try {
      console.log("[Heroes] Fetching all heroes...");
      
      const { data, error } = await Promise.race([
        supabase
          .from("heroes")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(100),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 8000)
        )
      ]);

      if (error) {
        console.error("[Heroes] Error fetching heroes:", error.message);
        return [];
      }

      console.log("[Heroes] Successfully fetched", data?.length ?? 0, "heroes");
      return (data ?? []).map((hero: any) => ({
        id: hero.id,
        name: hero.name,
        position: hero.position,
        number: hero.number,
        image: hero.image,
      }));
    } catch (error) {
      console.error("[Heroes] Query failed:", error);
      return [];
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        position: z.string(),
        number: z.string(),
        image: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { data, error } = await supabase
          .from("heroes")
          .insert({
            name: input.name,
            position: input.position,
            number: input.number,
            image: input.image,
          })
          .select()
          .single();

        if (error) {
          console.error("[Heroes] Error creating hero:", error);
          throw new Error(error.message);
        }

        return {
          id: data.id,
          name: data.name,
          position: data.position,
          number: data.number,
          image: data.image,
        };
      } catch (error: any) {
        console.error("[Heroes] Create mutation failed:", error);
        throw new Error(error.message || 'Failed to create hero');
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        position: z.string().optional(),
        number: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[Heroes] Updating hero:", input.id);
      const { id, ...updates } = input;
      
      const result = await supabase
        .from("heroes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      console.log("[Heroes] Update result:", JSON.stringify(result));

      if (result.error) {
        console.error("[Heroes] Error updating hero:", result.error.message);
        throw new Error(result.error.message);
      }

      return { success: true, data: result.data };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabase.from("heroes").delete().eq("id", input.id);

        if (error) {
          console.error("[Heroes] Error deleting hero:", error);
          throw new Error(error.message);
        }

        return { success: true };
      } catch (error: any) {
        console.error("[Heroes] Delete mutation failed:", error);
        throw new Error(error.message || 'Failed to delete hero');
      }
    }),
});
