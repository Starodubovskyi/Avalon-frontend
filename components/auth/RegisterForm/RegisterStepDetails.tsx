"use client";
import { AuthApi } from "@/lib/api/auth";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
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
import { toast } from "@/components/ui/use-toast";
import SocialAuthButtons from "../SocialAuthButtons";
import Select from "react-select";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

countries.registerLocale(enLocale);

const schema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(1, { message: "Confirm your password" }),
    country: z.string().min(1, { message: "Country is required" }),
    accountType: z.enum(["private", "business"], {
      required_error: "Account type is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  email: string;
  onEditEmail: () => void;
}

const RegisterStepDetails: React.FC<Props> = ({ email, onEditEmail }) => {
  const router = useRouter();

  const countryOptions = useMemo(() => {
    const names = countries.getNames("en", { select: "official" });
    return Object.entries(names).map(([code, name]) => ({
      value: code,
      label: name,
    }));
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      country: "",
      accountType: "private",
    },
  });

  const handleSubmit = async (data: FormData) => {
    const newUser = {
      name: data.name,
      lastName: data.lastName,
      email,
      country: data.country,
      accountType: data.accountType,
      password: data.password,
    };

    try {
      await AuthApi.register({
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.name,
        lastName: newUser.lastName,
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });

      router.push("/profile");
    } catch (e: any) {
      const msg =
        e?.response?.data?.errors?.email ??
        e?.response?.data?.errors?.password ??
        e?.response?.data?.message ??
        "Registration failed";

      toast({
        title: "Registration Error",
        description: String(msg),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent w-full max-w-xl mx-auto">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
          Complete Registration
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm dark:text-gray-300">
          Fill out the rest of your information
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-y-auto max-h-[calc(80vh-100px)] pr-1 custom-scrollbar">
        <div className="flex justify-between items-center text-sm px-1 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            {email}
          </span>
          <button
            onClick={onEditEmail}
            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold hover:underline"
          >
            Edit
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        className="w-full rounded-full border border-gray-300 py-2 px-4 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500 focus:outline-none transition-colors"
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
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
                        className="w-full rounded-full border border-gray-300 py-2 px-4 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500 focus:outline-none transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-0.5" />
                  </FormItem>
                )}
              />
            </div>

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
                      value={countryOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      placeholder="Select your country"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderRadius: "9999px",
                          borderColor: state.isFocused ? "#6366f1" : "#d1d5db", // indigo-500 : gray-300
                          boxShadow: "none",
                          paddingLeft: "0.5rem",
                          paddingRight: "0.5rem",
                          "&:hover": {
                            borderColor: state.isFocused
                              ? "#6366f1"
                              : "#9ca3af",
                          },
                        }),
                        input: (base) => ({
                          ...base,
                          "input:focus": {
                            boxShadow: "none",
                          },
                        }),
                      }}
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
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                        <input
                          type="radio"
                          value="private"
                          className="accent-indigo-500 w-4 h-4"
                          checked={field.value === "private"}
                          onChange={() => field.onChange("private")}
                        />
                        Private
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                        <input
                          type="radio"
                          value="business"
                          className="accent-indigo-500 w-4 h-4"
                          checked={field.value === "business"}
                          onChange={() => field.onChange("business")}
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
                      className="w-full rounded-full border border-gray-300 py-2 px-4 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-indigo-500 focus:outline-none transition-colors"
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
              className="w-full mt-2 py-2.5 px-4 text-sm sm:text-base font-semibold rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
            >
              Register
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

export default RegisterStepDetails;
