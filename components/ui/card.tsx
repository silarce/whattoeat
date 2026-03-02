import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

type WheelCardProps = {
  name: string;
  isSelected: boolean;
  onClick?: () => void;
};

function Card({ name, isSelected, onClick }: WheelCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border-2 px-3 py-3 text-center transition-all duration-150",
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100 scale-105"
          : "border-gray-100 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer",
      )}
    >
      <p
        className={cn(
          "line-clamp-2 text-xs font-medium leading-tight",
          isSelected ? "text-orange-900" : "text-gray-700",
        )}
      >
        {name}
      </p>
    </button>
  );
}

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

export { CardContainer, CardHeader, CardBody, Card };
