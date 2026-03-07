import { cn } from "@/lib/utils";

const SubContainer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-5 py-4 sm:px-6 min-w-0", className)}
    {...props}
  />
)
SubContainer.displayName = "SubContainer";

export default SubContainer