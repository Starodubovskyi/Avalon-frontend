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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SocialAuthButtons from "../SocialAuthButtons";

const emailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface Props {
  onContinue: (email: string) => void;
}

const RegisterStepEmail: React.FC<Props> = ({ onContinue }) => {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (data: EmailFormData) => {
    onContinue(data.email);
  };

  return (
    <Card className="border-none shadow-none bg-transparent w-full max-w-xl mx-auto p-4">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Enter your Email
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm dark:text-gray-300">
          Continue with your email address
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-full border border-gray-300 py-2 px-4 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500 focus:outline-none transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-0.5" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-2.5 px-4 text-sm sm:text-base font-semibold rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
            >
              Continue
            </Button>
          </form>
        </Form>

        <div className="flex items-center py-4">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
          <span className="mx-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
            Or Register With
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
        </div>

        <SocialAuthButtons />
      </CardContent>
    </Card>
  );
};

export default RegisterStepEmail;
