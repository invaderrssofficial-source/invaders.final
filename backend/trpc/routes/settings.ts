import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { supabase } from "../supabase";

export const settingsRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    try {
      console.log("[Settings] Fetching settings...");
      
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "bank_transfer_info")
        .single();

      if (error || !data) {
        console.log("[Settings] No settings found, returning defaults");
        return {
          bankName: "Bank of Maldives (BML)",
          accountName: "Club Invaders",
          accountNumber: "7730000123456",
        };
      }

      console.log("[Settings] Successfully fetched settings");
      return data.value as {
        bankName: string;
        accountName: string;
        accountNumber: string;
      };
    } catch (error) {
      console.error("[Settings] Query failed:", error);
      return {
        bankName: "Bank of Maldives (BML)",
        accountName: "Club Invaders",
        accountNumber: "7730000123456",
      };
    }
  }),

  update: publicProcedure
    .input(
      z.object({
        bankName: z.string(),
        accountName: z.string(),
        accountNumber: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { data: existing } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "bank_transfer_info")
        .single();

      if (existing) {
        const { error } = await supabase
          .from("settings")
          .update({ value: input })
          .eq("key", "bank_transfer_info");

        if (error) {
          console.log("Error updating settings:", error);
          throw new Error(error.message);
        }
      } else {
        const { error } = await supabase
          .from("settings")
          .insert({ key: "bank_transfer_info", value: input });

        if (error) {
          console.log("Error creating settings:", error);
          throw new Error(error.message);
        }
      }

      return { success: true };
    }),
});
