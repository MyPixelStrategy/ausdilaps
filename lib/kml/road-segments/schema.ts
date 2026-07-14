import { z } from "zod";

export const roadSegmentSchema = z.object({
  id: z.string().optional(),
  zone: z.string().optional(),
  location: z.string().trim().min(1, "Location/suburb is required"),
  roadNo: z.string().optional(),
  roadName: z.string().trim().min(1, "Road name is required"),
  fromDesc: z.string().trim().min(1, "From description is required"),
  toDesc: z.string().trim().min(1, "To description is required"),
  footpathLengthKm: z.number().nullable().optional(),
});

export const roadSegmentTraceRequestSchema = z.object({
  segments: z.array(roadSegmentSchema).min(1, "Add at least one road segment").max(200),
});

export const imageExtractRequestSchema = z.object({
  image: z.object({
    data: z.string().min(1, "Missing image data"),
    mediaType: z.string().trim().min(1).default("image/png"),
  }),
});
