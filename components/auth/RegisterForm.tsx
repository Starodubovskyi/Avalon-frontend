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

import styles from "./authForm.module.css";

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
  onCloseModal: () => void; // <-- Добавляем новый пропс
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchTab,
  onCloseModal,
}) => {
  // <-- Принимаем пропс
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

    onSwitchTab(); // Переключаем на вкладку логина после регистрации
    // onCloseModal(); // Если вы хотите закрыть модальное окно сразу после успешной регистрации, раскомментируйте это
  };

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>Create Your Account</CardTitle>
        <CardDescription className={styles.description}>
          Register to start
        </CardDescription>
      </CardHeader>

      <CardContent className={styles.content}>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className={styles.form}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={styles.label}>Your Name</FormLabel>
                    <FormControl>
                      <Input
                        className={styles.input}
                        placeholder="Enter your name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={styles.error} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={styles.label}>Your Email</FormLabel>
                    <FormControl>
                      <Input
                        className={styles.input}
                        placeholder="info@example.com"
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={styles.label}>
                      Confirm Password
                    </FormLabel>
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

              <Button className={styles.submitButton} type="submit">
                Register
              </Button>
            </form>
          </Form>

          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or</span>
            <div className={styles.dividerLine}></div>
          </div>

          <SocialAuthButtons />

          <div className={styles.bottomText}>
            Already have an account?{" "}
            {/* <-- Используем onClick для переключения вкладки */}
            <a className={styles.link} onClick={onSwitchTab}>
              Log In
            </a>
          </div>
        </div>{" "}
        {/* Закрытие корневого div */}
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
