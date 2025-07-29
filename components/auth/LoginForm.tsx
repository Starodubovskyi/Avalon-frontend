// components/auth/LoginForm.tsx
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
import styles from "./authForm.module.css";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const LoginForm = () => {
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
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>
          Welcome Back to Realnest!
        </CardTitle>
        <CardDescription className={styles.description}>
          Sign in your account
        </CardDescription>
      </CardHeader>

      <CardContent className={styles.content}>
        {/* Оберните все содержимое CardContent в один корневой div */}
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className={styles.form}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={styles.label}>Your Email</FormLabel>
                    <FormControl>
                      <Input
                        className={styles.input}
                        placeholder="info.your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.error} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={styles.label}>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className={styles.input}
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.error} />
                  </FormItem>
                )}
              />

              <div className={styles.options}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember Me
                </label>
                <Link href="/forgot-password" passHref legacyBehavior>
                  <a className={styles.forgot}>Forgot Password?</a>
                </Link>
              </div>

              <Button className={styles.submitButton} type="submit">
                Login
              </Button>
            </form>
          </Form>

          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine} />
          </div>

          <SocialAuthButtons />

          <div className={styles.bottomText}>
            Don't have an account?
            <Link href="/register" passHref legacyBehavior>
              <a className={styles.link}>Sign Up</a>
            </Link>
          </div>
        </div>{" "}
        {/* Закрытие корневого div */}
      </CardContent>
    </Card>
  );
};

export default LoginForm;
