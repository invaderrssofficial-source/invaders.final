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
      console.log("[Settings] Updating bank info:", JSON.stringify(input));
      
      const existingResult = await supabase
        .from("settings")
        .select("*")
        .eq("key", "bank_transfer_info")
        .single();

      console.log("[Settings] Existing check:", JSON.stringify(existingResult));

      if (existingResult.data) {
        const updateResult = await supabase
          .from("settings")
          .update({ value: input })
          .eq("key", "bank_transfer_info")
          .select()
          .single();

        console.log("[Settings] Update result:", JSON.stringify(updateResult));

        if (updateResult.error) {
          console.error("[Settings] Error updating settings:", updateResult.error.message);
          throw new Error(updateResult.error.message);
        }

        return { success: true, data: updateResult.data?.value || input };
      } else {
        const insertResult = await supabase
          .from("settings")
          .insert({ key: "bank_transfer_info", value: input })
          .select()
          .single();

        console.log("[Settings] Insert result:", JSON.stringify(insertResult));

        if (insertResult.error) {
          console.error("[Settings] Error creating settings:", insertResult.error.message);
          throw new Error(insertResult.error.message);
        }

        return { success: true, data: insertResult.data?.value || input };
      }
    }),
});
