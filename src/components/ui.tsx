import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-[background-color,opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        secondary: "bg-elevated text-fg shadow-ring hover:bg-hover",
        ghost: "bg-transparent text-muted hover:bg-elevated hover:text-fg",
        danger: "bg-transparent text-danger hover:bg-elevated",
      },
      size: {
        md: "min-h-11 px-4",
        sm: "min-h-11 px-3",
        icon: "size-11 shrink-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-fg">{label}</span>
        {hint ? <span className="text-xs text-subtle">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export const controlClass =
  "w-full rounded-control bg-surface px-3 text-sm text-fg shadow-ring outline-none placeholder:text-subtle";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, "min-h-11", props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlClass, "min-h-28 py-3 leading-normal", props.className)} />;
}
