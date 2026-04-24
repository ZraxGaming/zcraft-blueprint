import { Layout } from "@/components/layout/Layout";
import { LiveChatbox } from "@/components/chat/LiveChatbox";
import { ensureIntegrityPulse } from "@/lib/_ig";
import { useEffect } from "react";

export default function ChatPage() {
  useEffect(() => {
    ensureIntegrityPulse();
  }, []);

  return (
    <Layout
      seo={{
        title: "Live Chat",
        description: "Chat live between Discord, the website, and the Minecraft server.",
        url: "/chat",
        type: "website",
      }}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold tracking-tight">Live Chat</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Messages sync from Discord and appear here in real time.
          </p>

          <div className="mt-6">
            <LiveChatbox className="h-[70vh]" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
