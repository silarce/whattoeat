import { cn } from "@/lib/utils";

const Top = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-5 pt-5 pb-0 sm:px-6 sm:pt-6", className)}
    {...props}
  />
)
Top.displayName = "Top";

export default Top;