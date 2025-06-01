// @file: src/app/[locale]/signup/signupForm.schema.ts
import { z } from 'zod';

export const signupSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z
        .string()
        .min(1, t('Signup.errors.email.required'))
        .email(t('Signup.errors.email.invalid')),
      password: z
        .string()
        .min(6, t('Signup.errors.password.min')),
      confirmPassword: z
        .string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('Signup.errors.confirmPassword.match'),
      path: ['confirmPassword'],
    });

export type SignupFormValues = z.infer<ReturnType<typeof signupSchema>>;
//EOF
