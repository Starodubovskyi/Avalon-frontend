import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  showSignInButton?: boolean;
  isLoginPage?: boolean;
}

const AuthLayout = ({
  children,
  showSignInButton = false,
  isLoginPage = true,
}: AuthLayoutProps) => {
  return (
    <div className="h-screen flex items-center justify-center relative bg-[#e6f4f1]">
      {showSignInButton && (
        <Link
          href={isLoginPage ? "/register" : "/login"}
          className="absolute top-6 right-6 text-sm font-semibold text-blue-600 hover:underline"
        >
          {isLoginPage ? "Register" : "Sign In"}
        </Link>
      )}

      <div className="bg-white rounded-2xl shadow-md w-full max-w-4xl flex overflow-hidden h-[500px]">
        <div className="hidden md:flex flex-col justify-center items-center bg-[#1e1e1e] text-white w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Welcome to Ship.Inspect
          </h2>
          <p className="text-center text-sm opacity-80">
            Track vessels. Get ship data. Simplify your logistics.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
