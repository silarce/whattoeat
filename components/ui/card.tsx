import { cn } from "@/lib/utils";
import { XCircleIcon } from "@/components/icons";



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


export default Card;
