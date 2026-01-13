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
          className="absolute top-6 right-6 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
        >
          {isLoginPage ? "Register" : "Sign In"}
        </Link>
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden h-[500px]">
        <div className="hidden md:flex flex-col justify-center items-center bg-[#1e1e1e] text-white w-1/2 p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-50" />
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to Ship.Inspect</h2>
            <p className="text-sm opacity-80 leading-relaxed">
              Track vessels. Get ship data. Simplify your logistics.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-6 relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
