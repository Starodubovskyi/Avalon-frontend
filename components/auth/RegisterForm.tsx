// components/auth/RegisterForm.tsx
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
// import Link from "next/link"; // <-- Link не нужен для переключения табов

// import styles from "./authForm.module.css"; // Удален импорт CSS

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface RegisterFormProps {
  onSwitchTab: () => void;
  onCloseModal: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchTab,
  onCloseModal,
}) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const emailExists = users.some((user: any) => user.email === data.email);

    if (emailExists) {
      toast({
        title: "Registration Error",
        description: "An account with this email already exists.",
        variant: "destructive",
      });
      return;
    }

    const newUser = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    toast({
      title: "Registration Successful",
      description: "Your account has been created. Please log in.",
    });

    onSwitchTab();
    // onCloseModal();
  };

  return (
    // Убрал min-h-auto и добавил mb-8 для отступа снизу
    <Card className="w-full max-w-[360px] bg-white rounded-lg p-4 shadow-[rgba(0,0,0,0.35)_0px_5px_15px] flex flex-col justify-between mx-auto md:p-[15px] mb-8">
      <CardHeader className="text-center pb-3">
        <CardTitle className="font-sans text-2xl font-extrabold mt-1.5 mb-2.5 text-gray-900">
          Create Your Account
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm font-sans">
          Register to start
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-grow">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-2.5 flex-grow"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">
                      Your Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full border border-gray-300 py-2 px-3.5 bg-white text-gray-900 outline-none transition-all duration-200 ease-in-out focus:border-blue-500 focus:shadow-[0_0_0_1px_#3b82f6]"
                        placeholder="Enter your name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-0.5" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">
                      Your Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full border border-gray-300 py-2 px-3.5 bg-white text-gray-900 outline-none transition-all duration-200 ease-in-out focus:border-blue-500 focus:shadow-[0_0_0_1px_#3b82f6]"
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
                    <FormLabel className="text-xs font-semibold text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="rounded-full border border-gray-300 py-2 px-3.5 bg-white text-gray-900 outline-none transition-all duration-200 ease-in-out focus:border-blue-500 focus:shadow-[0_0_0_1px_#3b82f6]"
                        placeholder="••••••••"
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
                    <FormLabel className="text-xs font-semibold text-gray-700">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="rounded-full border border-gray-300 py-2 px-3.5 bg-white text-gray-900 outline-none transition-all duration-200 ease-in-out focus:border-blue-500 focus:shadow-[0_0_0_1px_#3b82f6]"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-0.5" />
                  </FormItem>
                )}
              />

              <Button
                className="w-full py-2.5 px-4 font-semibold rounded-full bg-black text-white transition-all duration-250 ease-in-out cursor-pointer shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] hover:scale-[1.02]"
                type="submit"
              >
                Register
              </Button>
            </form>
          </Form>

          <div className="flex items-center pt-2.5 mt-auto">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-2.5 text-sm text-gray-600 font-sans">or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <SocialAuthButtons />

          <div className="text-center text-sm text-gray-600 mt-2.5">
            Already have an account?{" "}
            <a
              className="text-blue-600 font-bold no-underline hover:underline"
              onClick={onSwitchTab}
            >
              Log In
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
