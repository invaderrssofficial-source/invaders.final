import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const heroesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("heroes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.log("Error fetching heroes:", error);
      throw new Error(error.message);
    }

    return data.map((hero) => ({
      id: hero.id,
      name: hero.name,
      position: hero.position,
      number: hero.number,
      image: hero.image,
    }));
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
