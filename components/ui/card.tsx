import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

const CardContainer = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5",
        className,
      )}
      {...props}
    />
  ),
);
CardContainer.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-5 pt-5 pb-0 sm:px-6 sm:pt-6", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardBody = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-5 py-4 sm:px-6", className)}
      {...props}
    />
  ),
);
CardBody.displayName = "CardBody";

export { CardContainer, CardHeader, CardBody };
