import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground shadow-[inset_0_1px_2px_hsl(var(--shadow-color)/0.05)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/75 hover:border-border-strong focus-visible:border-primary/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-[invalid=true]:border-bad/60 aria-[invalid=true]:focus-visible:ring-bad/15";

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, "h-10", className)} {...props} />;
  },
);

/** Native select with a drawn chevron, so it matches the inputs on every OS */
export const SelectInput = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectInput({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(fieldBase, "select-chevron h-10 cursor-pointer appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(fieldBase, "min-h-[88px] py-2.5 leading-relaxed", className)} {...props} />;
  },
);

export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[12.5px] font-semibold text-foreground/85">{label}</span>
      {children}
      {error ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-bad">
          <span className="h-1 w-1 shrink-0 rounded-full bg-bad" aria-hidden />
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
