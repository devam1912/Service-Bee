import { z } from "zod";

export const reportMessageSchema = z.object({
  messageId: z.string().min(10, "messageId required"),
  reason: z.string().max(200).optional(),
});
