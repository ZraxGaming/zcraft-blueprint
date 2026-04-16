import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, Search, ChevronRight } from "lucide-react";
import { supportFaqs } from "@/data/faqs";

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(supportFaqs.map((faq) => faq.category)))],
    []
  );

  const filteredFaqs = supportFaqs.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  return (
    <Layout
      seo={{
        title: "ZCraft FAQ - Answers, Troubleshooting, and Support",
        description: "Browse ZCraft Network FAQs for joining, gameplay, moderation, Discord, account issues, and troubleshooting.",
        keywords: "zcraft faq, minecraft faq, server help, support, troubleshooting, discord login, profile upload",
        url: "/faq",
        type: "website",
        tags: ["faq", "support", "help", "troubleshooting"],
      }}
    >
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border mb-6">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Knowledge Base</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Search common questions before opening a ticket.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search login, appeals, avatars, Discord, rules..."
                className="pl-10 h-12 bg-card"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.length === 0 ? (
              <Card className="border-0 bg-card">
                <CardContent className="p-10 text-center">
                  <p className="text-lg font-medium mb-2">No FAQ matched that search.</p>
                  <p className="text-muted-foreground">Try a different keyword or open the support page.</p>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((faq) => (
                <Card key={`${faq.category}-${faq.question}`} className="border-0 bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{faq.category}</Badge>
                    </div>
                    <h2 className="font-semibold text-lg mb-2">{faq.question}</h2>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-0 bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-2xl font-bold mb-2">Still stuck?</h3>
              <p className="text-muted-foreground mb-6">
                Use the support center for appeals, tickets, and community help.
              </p>
              <Button asChild className="btn-primary-gradient gap-2">
                <Link to="/support">
                  Open Support Center
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
