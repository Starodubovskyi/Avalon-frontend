"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

function cn(...cls: Array<string | undefined | false | null>) {
  return cls.filter(Boolean).join(" ");
}

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, side = "top", ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      side={side}
      className={cn(
        // стекло + бордер
        "z-50 rounded-2xl border border-white/20 bg-white/10 px-3 py-2",
        "backdrop-blur-xl text-white shadow-2xl",
        // лёгкая анимация появления
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[side=bottom]:slide-in-from-top-1",
        "data-[side=top]:slide-in-from-bottom-1",
        "data-[side=left]:slide-in-from-right-1",
        "data-[side=right]:slide-in-from-left-1",
        "text-sm leading-snug",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
