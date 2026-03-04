import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { XCircleIcon } from "@/components/icons";

type CardProps = HTMLAttributes<HTMLDivElement>;

type WheelCardProps = {
  name: string;
  isSelected: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
};

function Card({ name, isSelected, disabled, onClick, onRemove }: WheelCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border-2 px-3 py-3 text-center transition-all duration-150",
        disabled && "pointer-events-none select-none opacity-80",
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100 dark:bg-orange-950 dark:shadow-orange-900/20"
          : "border-gray-100 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-600 dark:hover:bg-orange-950/50",
      )}
    >
      {onRemove && (
        <span
          role="button"
          aria-label="移除"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-0 right-0 text-gray-400 hover:text-red-500 transition-colors cursor-pointer dark:text-gray-500 dark:hover:text-red-400"
        >
          <XCircleIcon className="w-5 h-5" />
        </span>
      )}
      <p
        className={cn(
          "line-clamp-2 text-xs font-medium leading-tight",
          isSelected ? "text-orange-900 dark:text-orange-200" : "text-gray-700 dark:text-gray-300",
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
        "rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden dark:bg-gray-900 dark:ring-gray-100/10",
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
