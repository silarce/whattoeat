import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

type WheelCardProps = {
  name: string;
  isSelected: boolean;
  onClick?: () => void;
  onRemove?: () => void;
};

function Card({ name, isSelected, onClick, onRemove }: WheelCardProps) {
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
      {onRemove && (
        <span
          role="button"
          aria-label="移除"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1 right-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </span>
      )}
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
      data-component="CardContainer"
      className={cn(
        "rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden",
        className,
      )}
      {...props}
    />
  ),
);
CardContainer.displayName = "CardContainer";

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-component="CardHeader"
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
      data-component="CardBody"
      className={cn("px-5 py-4 sm:px-6 min-w-0", className)}
      {...props}
    />
  ),
);
CardBody.displayName = "CardBody";

export { CardContainer, CardHeader, CardBody, Card };
