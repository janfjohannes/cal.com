import { z } from "zod";

export const ZOutOfOfficeInputSchema = z.object({
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  toTeamUserId: z.number().nullable(),
});

export type TOutOfOfficeInputSchema = z.infer<typeof ZOutOfOfficeInputSchema>;

export const ZOutOfOfficeDelete = z.object({
  outOfOfficeUid: z.string(),
});

export type TOutOfOfficeDelete = z.infer<typeof ZOutOfOfficeDelete>;
