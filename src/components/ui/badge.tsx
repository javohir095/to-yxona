import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit transition-colors overflow-hidden [&_svg]:pointer-events-none [&_svg]:size-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:brightness-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:brightness-110",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:brightness-105",
        outline:
          "border-border bg-transparent text-foreground [a&]:hover:bg-muted",
        success:
          "border-transparent bg-success text-white [a&]:hover:brightness-105",
        warning:
          "border-transparent bg-warning text-white [a&]:hover:brightness-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
