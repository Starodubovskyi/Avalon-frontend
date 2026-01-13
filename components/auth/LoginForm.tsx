"use client";

import { AuthApi } from "@/lib/api/auth";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import SocialAuthButtons from "./SocialAuthButtons";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email(),
  password: z.string().min(1, { message: "Password is required" }),
});

interface LoginFormProps {
  onCloseModal: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onCloseModal }) => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await AuthApi.login({ email: data.email, password: data.password });
      toast({ title: "Signed in", description: "You are now logged in." });
      onCloseModal();
    } catch (e: any) {
      toast({
        title: "Login failed",
        description: e?.message || "Check your credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-xl p-4 mx-auto border-none shadow-none bg-transparent">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Welcome Back to Avalon!
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm dark:text-gray-300">
          Sign in your account
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-grow max-h-full overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Your Email
                  </FormLabel>
                  <FormControl>
                    {/* Fixed: Removed focus:ring properties and added focus-visible:ring-0 to prevent overflow */}
                    <Input
                      className="w-full rounded-full border border-gray-300 py-2 px-4 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="info@example.com"
                      {...field}
                    />
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
                    {/* Fixed: Removed focus:ring properties and added focus-visible:ring-0 to prevent overflow */}
                    <Input
                      type="password"
                      className="w-full rounded-full border border-gray-300 py-2 px-4 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center text-xs mt-1">
              <label className="flex items-center text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mr-2 accent-indigo-500 w-3.5 h-3.5"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link href="/forgot-password">
                <span className="text-indigo-600 font-bold hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer transition-colors">
                  Forgot Password?
                </span>
              </Link>
            </div>

            <Button
              className="w-full mt-2 py-2.5 px-4 text-sm sm:text-base font-semibold rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
              type="submit"
            >
              Login
            </Button>
          </form>
        </Form>

        <div className="flex items-center py-4">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
          <span className="mx-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
            Instant Login
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
        </div>

        <SocialAuthButtons />
      </CardContent>
    </Card>
  );
};

export default LoginForm;
