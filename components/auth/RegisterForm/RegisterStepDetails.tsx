'use client';

import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import SocialAuthButtons from '../SocialAuthButtons';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

countries.registerLocale(enLocale);

const schema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Confirm your password' }),
    country: z.string().min(1, { message: 'Country is required' }),
    accountType: z.enum(['private', 'business'], {
      required_error: 'Account type is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  email: string;
  onEditEmail: () => void;
}

const RegisterStepDetails: React.FC<Props> = ({ email, onEditEmail }) => {
  const router = useRouter();

  const countryOptions = useMemo(() => {
    const names = countries.getNames('en', { select: 'official' });
    return Object.entries(names).map(([code, name]) => ({
      value: code,
      label: name,
    }));
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      country: '',
      accountType: 'private',
    },
  });

  const handleSubmit = (data: FormData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const emailExists = users.some((user: any) => user.email === email);

    if (emailExists) {
      toast({
        title: 'Registration Error',
        description: 'An account with this email already exists.',
        variant: 'destructive',
      });
      return;
    }

    const newUser = {
      name: data.name,
      lastName: data.lastName,
      email,
      country: data.country,
      accountType: data.accountType,
      password: data.password,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('isAuthenticated', 'true');

    toast({
      title: 'Registration Successful',
      description: 'Your account has been created.',
    });

    router.push('/profile');
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Complete Registration
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm dark:text-gray-300">
          Fill out the rest of your information
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-y-auto max-h-[calc(80vh-100px)] pr-3">
        <div className="flex justify-between items-center text-sm px-1">
          <span className="text-gray-700 dark:text-gray-200 font-semibold">
            {email}
          </span>
          <button
            onClick={onEditEmail}
            className="text-xs text-teal-600 hover:underline font-medium"
          >
            Edit
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-2.5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      className="w-full rounded-full border border-gray-300 py-2 px-3 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your last name"
                      className="w-full rounded-full border border-gray-300 py-2 px-3 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Country
                  </FormLabel>
                  <FormControl>
                    <Select
                      options={countryOptions}
                      className="text-sm"
                      classNamePrefix="react-select"
                      onChange={(val) => field.onChange(val?.value)}
                      value={countryOptions.find((opt) => opt.value === field.value)}
                      placeholder="Select your country"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Account Type
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-3 mt-1">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input
                          type="radio"
                          value="private"
                          checked={field.value === 'private'}
                          onChange={() => field.onChange('private')}
                        />
                        Private
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <input
                          type="radio"
                          value="business"
                          checked={field.value === 'business'}
                          onChange={() => field.onChange('business')}
                        />
                        Business
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-full border border-gray-300 py-2 px-3 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-full border border-gray-300 py-2 px-3 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-2 px-3 text-sm sm:text-base font-semibold rounded-full bg-black text-white hover:bg-gray-900 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
              Register
            </Button>
          </form>
        </Form>

        <div className="flex items-center pt-3">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
          <span className="mx-2.5 text-sm text-gray-600 dark:text-gray-300">
            Or Register With
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
        </div>

        <SocialAuthButtons />
      </CardContent>
    </Card>
  );
};

export default RegisterStepDetails;
