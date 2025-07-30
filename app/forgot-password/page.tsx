// app/forgot-password/page.tsx
import AuthLayout from "@/components/auth/AuthLoyout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout showSignInButton={true} isLoginPage={false}>
      <Card className="w-[350px] h-[400px] bg-white shadow-[rgba(0,0,0,0.35)_0px_5px_15px] rounded-lg box-border p-5 md:p-[30px] flex flex-col justify-between">
        <CardHeader className="text-center p-0 pb-6">
          <CardTitle className="font-sans text-3xl font-extrabold my-2 md:my-5 text-gray-900">
            Forgot Your Password?
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm font-sans">
            Enter your email to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Your Email
            </label>
            <Input
              type="email"
              className="rounded-full border border-gray-300 outline-none px-4 py-3 bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="info.your@email.com"
            />
            <Button className="w-full py-3 font-sans rounded-full border-0 outline-none bg-teal-500 text-white cursor-pointer shadow-md hover:bg-teal-600 active:shadow-none">
              Send Reset Link
            </Button>
          </div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400 text-sm font-sans">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline dark:text-blue-400 font-medium font-bold"
            >
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
