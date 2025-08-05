"use client";

import React from "react";
import { DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ResponsiveDialogContent: React.FC<ResponsiveDialogContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <DialogContent
      className={cn(
        "p-0 w-[90vw] h-[90vh] max-w-[1100px] max-h-[800px] overflow-hidden rounded-2xl bg-white dark:bg-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
};

export default ResponsiveDialogContent;
