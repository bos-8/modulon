// @file: src/app/[locale]/register/registerForm.schema.ts

import { z } from 'zod'

export const signupSchema = (t: (key: string) => string) =>
  z
    .object({
      email: z
        .string()
        .min(1, { message: t('Signup.errors.email.required') })
        .email({ message: t('Signup.errors.email.invalid') }),
      password: z
        .string()
        .min(6, { message: t('Signup.errors.password.min') }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('Signup.errors.confirmPassword.match'),
      path: ['confirmPassword'],
    })

export type SignupFormValues = z.infer<ReturnType<typeof signupSchema>>
// EOF
