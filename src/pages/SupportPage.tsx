import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageSquare, FileText, Shield, ExternalLink, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supportFaqs } from "@/data/faqs";
import { getPageSeo, siteConfig } from "@/config/siteEnv";
import { useSettings } from "@/contexts/SettingsContext";

const supportOptions = [
  {
    icon: FileText,
    title: "Create a Ticket",
    description: "Submit a support ticket for personalized help from our team.",
    action: "Open Ticket",
    color: "bg-primary/10 text-primary",
    href: siteConfig.discordUrl,
  },
  {
    icon: Shield,
    title: "Appeal a Ban",
    description: "Think you were unfairly punished? Submit an appeal here.",
    action: "Start Appeal",
    color: "bg-amber-500/10 text-amber-600",
    href: "/appeal",
  },
  {
    icon: MessageSquare,
    title: "Join Discord",
    description: "Get real-time support from staff and community members.",
    action: "Join Server",
    color: "bg-indigo-500/10 text-indigo-600",
    href: siteConfig.discordUrl,
  },
];

export default function SupportPage() {
  const { settings } = useSettings();

  return (
    <Layout seo={{
      ...getPageSeo("support", {
        title: settings?.supportSeoTitle,
        description: settings?.supportSeoDescription,
        keywords: settings?.supportSeoKeywords,
      }),
      url: "/support",
      type: "website",
      tags: ["support", "help", "faq", "troubleshooting", "ban appeal"],
    }}>
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border mb-6">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Help Center</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How can we <span className="text-gradient">help</span>?
            </h1>
            <p className="text-xl text-muted-foreground">
              Get support from our team or find answers in our resources.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {supportOptions.map((option) => (
              <Card key={option.title} className="card-hover border-0 bg-card text-center">
                <CardContent className="p-8">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${option.color} mb-6`}>
                    <option.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{option.description}</p>
                  {option.href.startsWith("http") ? (
                    <a href={option.href} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full gap-2">
                        {option.action}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link to={option.href} className="block">
                      <Button className="w-full gap-2">
                        {option.action}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {supportFaqs.slice(0, 5).map((faq, index) => (
                <Card key={index} className="border-0 bg-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2 flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        Q
                      </span>
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-9">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/faq" className="inline-block">
                <Button variant="outline" className="gap-2">
                  View Full FAQ Page <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-0 bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team typically responds within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="px-4 py-2">
                  support@zcraft.net
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  Discord: ZCraft Support
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
