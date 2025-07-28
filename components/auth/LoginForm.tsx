// components/LoginForm.tsx
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

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Please enter a valid email",
    }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

const LoginForm = () => {
  const router = useRouter();

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
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
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
    // <AuthLayout showBackButton={false}> // <-- УДАЛЕНА ОБЕРТКА AUTHLAYOUT
    <Card className="w-full shadow-lg transform transition-transform duration-300 hover:scale-[1.01]">
      {" "}
      {/* max-w-md убран, т.к. Tabs его уже задает */}
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Login</CardTitle>
        <CardDescription className="text-muted-foreground">
          Log into your account with your credentials
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

            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    // </AuthLayout> // <-- УДАЛЕНА ОБЕРТКА AUTHLAYOUT
  );
};

export default LoginForm;
