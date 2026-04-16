import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageSquare, FileText, Shield, ExternalLink, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supportFaqs } from "@/data/faqs";
import { getPageSeo, siteConfig } from "@/config/siteEnv";
import { useSettings } from "@/contexts/SettingsContext";
import { motion } from "framer-motion";

const supportOptions = [
  { icon: FileText, title: "Create a Ticket", description: "Submit a support ticket for personalized help.", action: "Open Ticket", href: siteConfig.discordUrl },
  { icon: Shield, title: "Appeal a Ban", description: "Think you were unfairly punished? Submit an appeal.", action: "Start Appeal", href: "/appeal" },
  { icon: MessageSquare, title: "Join Discord", description: "Get real-time support from staff and community.", action: "Join Server", href: siteConfig.discordUrl },
];

export default function SupportPage() {
  const { settings } = useSettings();

  return (
    <BentoPageLayout
      title="Support"
      subtitle="Get help from our team or find answers in our resources."
      seo={{
        ...getPageSeo("support", { title: settings?.supportSeoTitle, description: settings?.supportSeoDescription, keywords: settings?.supportSeoKeywords }),
        url: "/support", type: "website",
      }}
    >
      <div className="space-y-10">
        {/* Options */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {supportOptions.map((opt, i) => (
            <motion.div key={opt.title} className="bento-card p-8 text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                <opt.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary-foreground mb-2">{opt.title}</h3>
              <p className="text-sm text-primary-foreground/40 mb-6">{opt.description}</p>
              {opt.href.startsWith("http") ? (
                <a href={opt.href} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2">{opt.action} <ExternalLink className="h-4 w-4" /></Button>
                </a>
              ) : (
                <Link to={opt.href}><Button className="w-full">{opt.action}</Button></Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-primary-foreground text-center mb-6">FAQ</h2>
          <div className="space-y-3">
            {supportFaqs.slice(0, 5).map((faq, i) => (
              <motion.div key={i} className="bento-card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <h3 className="font-semibold text-primary-foreground mb-2 flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">Q</span>
                  {faq.question}
                </h3>
                <p className="text-primary-foreground/40 pl-9 text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/faq"><Button variant="outline" className="gap-2 border-bento-border text-primary-foreground/60">View Full FAQ <ChevronRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </div>
    </BentoPageLayout>
  );
}
