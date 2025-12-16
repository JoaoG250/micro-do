import { z } from "zod";

const emailSchema = z.email({ message: "Endereço de e-mail inválido" });
const passwordSchema = z
  .string()
  .min(6, { message: "A senha deve ter pelo menos 6 caracteres" });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, { message: "O nome de usuário deve ter pelo menos 2 caracteres" }),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
