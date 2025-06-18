'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from './loginForm.schema';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Login');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t)),
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log('Login data:', data);
    // TODO: handle login
  };

  return (
    <main className="flex justify-center px-4 pt-20 pb-10 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          {t('title')}
        </h1>

        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300" htmlFor="email">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300" htmlFor="password">
            {t('password')}
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 dark:bg-green-500 text-white dark:text-gray-900 p-2 rounded hover:bg-green-700 dark:hover:bg-green-400 transition"
        >
          {t('submit')}
        </button>
      </form>
    </main>
  );
}
// EOF