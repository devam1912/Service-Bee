import { z } from "zod";

export const createRequestSchema = z.object({
  companyId: z.string().min(10, "companyId is required"),
  serviceName: z.string().min(2, "serviceName is required"),
  userNote: z.string().max(500).optional(),
  bookingDate: z.string().min(4, "bookingDate is required"),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "completed"]),
});
