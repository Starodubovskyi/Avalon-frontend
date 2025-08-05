"use client";

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

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u: any) => u.email === data.email && u.password === data.password
    );

    if (user) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("rememberMe", String(rememberMe));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      onCloseModal();
      router.push("/dashboard");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
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
            className="flex flex-col gap-2.5"
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
                    <Input
                      className="w-full rounded-full border border-gray-300 py-2 px-3 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    <Input
                      type="password"
                      className="w-full rounded-full border border-gray-300 py-2 px-3 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center text-xs mt-2">
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="mr-1 accent-blue-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <Link href="/forgot-password">
                <span className="text-blue-600 font-bold hover:text-black dark:hover:text-white cursor-pointer">
                  Forgot Password?
                </span>
              </Link>
            </div>

            <Button
              className="w-full py-2 px-3 sm:py-2.5 sm:px-4 text-sm sm:text-base font-semibold rounded-full bg-black text-white hover:bg-gray-900 dark:bg-teal-600 dark:hover:bg-teal-700"
              type="submit"
            >
              Login
            </Button>
          </form>
        </Form>

        <div className="flex items-center pt-3">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
          <span className="mx-2.5 text-sm text-gray-600 dark:text-gray-300">
            Instan Login
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
        </div>

        <SocialAuthButtons />
      </CardContent>
    </Card>
  );
};

export default LoginForm;
