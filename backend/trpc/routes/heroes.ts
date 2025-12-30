import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const heroesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    console.log("[Heroes] Fetching all heroes...");
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
    );
    
    try {
      const queryPromise = supabase
        .from("heroes")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1000);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error("[Heroes] Error fetching heroes:", error.message, error.code);
        throw new Error(`Failed to fetch heroes: ${error.message}`);
      }

      console.log("[Heroes] Successfully fetched", data?.length ?? 0, "heroes");
      return (data ?? []).map((hero: any) => ({
        id: hero.id,
        name: hero.name,
        position: hero.position,
        number: hero.number,
        image: hero.image,
      }));
    } catch (err) {
      console.error("[Heroes] Unexpected error:", err);
      throw err;
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
        console.log("Error creating hero:", error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        name: data.name,
        position: data.position,
        number: data.number,
        image: data.image,
      };
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
      const { id, ...updates } = input;
      const { error } = await supabase.from("heroes").update(updates).eq("id", id);

      if (error) {
        console.log("Error updating hero:", error);
        throw new Error(error.message);
      }

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase.from("heroes").delete().eq("id", input.id);

      if (error) {
        console.log("Error deleting hero:", error);
        throw new Error(error.message);
      }

      return { success: true };
    }),
});
