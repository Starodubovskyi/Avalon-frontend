import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
};

export default AuthLayout;
