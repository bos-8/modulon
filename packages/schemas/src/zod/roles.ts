import { z } from "zod";

export const roleSchema = z.enum(["ROOT", "SYSTEM", "ADMIN", "MODERATOR", "USER"]);
export type Role = z.infer<typeof roleSchema>;
