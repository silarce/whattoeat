import { cn } from "@/lib/utils";

const Container = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden dark:bg-gray-900 dark:ring-gray-100/10",
      className,
    )}
    {...props}
  />
)
Container.displayName = "Container";

export default Container