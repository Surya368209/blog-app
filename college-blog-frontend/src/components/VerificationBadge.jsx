import { BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function VerificationBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* The Blue Tick */}
          <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50 ml-1 cursor-help inline-block align-middle" />
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 text-white border-0 text-xs">
          <p>Verified Faculty</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}