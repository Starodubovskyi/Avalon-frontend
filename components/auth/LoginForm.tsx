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
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

interface LoginFormProps {
  onSwitchTab: () => void;
  onCloseModal: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchTab, onCloseModal }) => {
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
    // Уменьшим mb-8 до mb-4 для экономии места, если нужно. Можно убрать полностью, если CardContent прокручивается.
    <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg p-4 shadow-[rgba(0,0,0,0.35)_0px_5px_15px] flex flex-col justify-between mx-auto md:p-[15px] mb-4 dark:bg-gray-800 dark:text-white dark:shadow-[rgba(0,0,0,0.7)_0px_5px_15px]">
      <CardHeader className="text-center pb-3">
        <CardTitle className="font-sans text-2xl font-extrabold mt-1.5 mb-2.5 text-gray-900 dark:text-white">
          Welcome Back!
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm font-sans dark:text-gray-300">
          Sign in your account
        </CardDescription>
      </CardHeader>
      {/* Добавим max-h-full и overflow-y-auto для прокрутки содержимого CardContent */}
      <CardContent className="p-0 flex flex-col flex-grow max-h-full overflow-y-auto">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-2.5 flex-grow"
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
                        className="w-full rounded-full border border-gray-300 py-2 px-3.5 bg-white text-gray-900 outline-none transition-all duration-200 ease-in-out focus:border-blue-500 focus:shadow-[0_0_0_1px_#3b82f6] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400"
                        placeholder="info.your@email.com"
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
                        className="w-full rounded-full border border-gray-300 py-2 px-3.5 bg-white text-gray-900 outline-none transition-all duration-200 ease-in-out focus:border-blue-500 focus:shadow-[0_0_0_1px_#3b82f6] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-0.5" />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center text-xs mt-2">
                <label className="flex items-center text-gray-700 cursor-pointer dark:text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-1 accent-blue-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>
                <Link href="/forgot-password" passHref legacyBehavior>
                  <a className="text-blue-600 text-xs font-bold text-right no-underline hover:text-black dark:hover:text-white">
                    Forgot Password?
                  </a>
                </Link>
              </div>

              <Button
                className="w-full py-2.5 px-4 font-semibold rounded-full bg-black text-white transition-all duration-250 ease-in-out cursor-pointer shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] hover:scale-[1.02] dark:bg-teal-600 dark:hover:bg-teal-700 dark:shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.5)]"
                type="submit"
              >
                Login
              </Button>
            </form>
          </Form>

          <div className="flex items-center pt-2.5 mt-auto">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />{" "}
            <span className="mx-2.5 text-sm text-gray-600 font-sans dark:text-gray-300">
              or
            </span>{" "}
            <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />{" "}
          </div>

          <SocialAuthButtons />

          <div className="text-center text-sm text-gray-600 mt-2.5 dark:text-gray-300">
            Don't have an account?
            <a
              className="text-blue-600 font-bold no-underline hover:underline dark:hover:text-blue-400"
              onClick={onSwitchTab}
            >
              Sign Up
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
