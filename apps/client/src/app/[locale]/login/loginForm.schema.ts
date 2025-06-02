// @file: client/src/app/[locale]/login/loginForm.schema.ts

import { z } from 'zod'

export const loginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().min(1, { message: t('errors.email.required') }).email({ message: t('errors.email.invalid') }),
    password: z.string().min(6, { message: t('errors.password.min') }),
  })

export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>
// EOF
