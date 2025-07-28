// components/RegisterForm.tsx
"use client";

// УДАЛИТЬ ЭТИ ИМПОРТЫ, если они были:
// import BackButton from '@/components/BackButton';
// import AuthLayout from '@/components/AuthLayout';

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

const formSchema = z
  .object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email({
        message: "Please enter a valid email",
      }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const RegisterForm = () => {
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
        title: "Registration Failed",
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

    router.push("/login");
  };

  return (
    // <AuthLayout showBackButton={true}> // <-- УДАЛЕНА ОБЕРТКА AUTHLAYOUT
    <Card className="w-full shadow-lg transform transition-transform duration-300 hover:scale-[1.01]">
      {" "}
      {/* max-w-md убран, т.к. Tabs его уже задает */}
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Register</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign up by adding the info below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-input dark:bg-input border-border focus-visible:ring-ring text-foreground focus-visible:ring-offset-background"
                      placeholder="Enter Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-input dark:bg-input border-border focus-visible:ring-ring text-foreground focus-visible:ring-offset-background"
                      placeholder="Enter Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-input dark:bg-input border-border focus-visible:ring-ring text-foreground focus-visible:ring-offset-background"
                      placeholder="Enter Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-input dark:bg-input border-border focus-visible:ring-ring text-foreground focus-visible:ring-offset-background"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    // </AuthLayout> // <-- УДАЛЕНА ОБЕРТКА AUTHLAYOUT
  );
};

export default RegisterForm;
