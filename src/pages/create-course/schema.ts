
import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  difficulty: z.string().min(1, "Please select a difficulty"),
  duration: z.string().min(1, "Please select a duration"),
  chapters: z.number().min(1).max(10),
  includeVideos: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;
