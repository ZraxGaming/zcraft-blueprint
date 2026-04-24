import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { LiveChatbox } from "@/components/chat/LiveChatbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type SheetSide = "right" | "left" | "top" | "bottom";

function useResponsiveSheetSide(): SheetSide {
  const [side, setSide] = useState<SheetSide>("right");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setSide(mq.matches ? "bottom" : "right");
    update();

    mq.addEventListener?.("change", update);
    // Safari <14
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener?.(update);

    return () => {
      mq.removeEventListener?.("change", update);
      // eslint-disable-next-line deprecation/deprecation
      mq.removeListener?.(update);
    };
  }, []);

  return side;
}

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const side = useResponsiveSheetSide();

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label="Open live chat"
            title="Live chat"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side={side}
          className={
            side === "bottom"
              ? "p-0 h-[85vh]"
              : "p-0 w-[420px] sm:w-[480px] sm:max-w-none"
          }
        >
          <div className="border-b border-border/50 px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Live chat</div>
            <Link
              to="/chat"
              className="text-xs text-primary underline underline-offset-2"
              onClick={() => setOpen(false)}
            >
              Open page
            </Link>
          </div>

          <div className="p-4">
            <LiveChatbox className={side === "bottom" ? "h-[calc(85vh-88px)]" : "h-[calc(100vh-136px)] max-h-[640px]"} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

