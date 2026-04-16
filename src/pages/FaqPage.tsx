import { useMemo, useState } from "react";
import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { supportFaqs } from "@/data/faqs";
import { motion } from "framer-motion";

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(supportFaqs.map((f) => f.category)))], []);

  const filteredFaqs = supportFaqs.filter((faq) => {
    const matchCat = activeCategory === "All" || faq.category === activeCategory;
    const q = query.trim().toLowerCase();
    const matchQ = q.length === 0 || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <BentoPageLayout
      title="FAQ"
      subtitle="Search common questions before opening a ticket."
      seo={{
        title: "ZCraft FAQ - Answers, Troubleshooting, and Support",
        description: "Browse ZCraft Network FAQs for joining, gameplay, moderation, and troubleshooting.",
        keywords: "zcraft faq, minecraft faq, server help, support, troubleshooting",
        url: "/faq", type: "website",
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/30" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search FAQs..." className="pl-10 h-12 bg-bento-card border-bento-border text-primary-foreground placeholder:text-primary-foreground/30" />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button key={cat} size="sm" variant={activeCategory === cat ? "default" : "outline"} onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "" : "border-bento-border text-primary-foreground/60"}
            >{cat}</Button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bento-card p-10 text-center">
              <p className="text-primary-foreground/60 mb-2">No FAQ matched that search.</p>
              <p className="text-primary-foreground/30 text-sm">Try a different keyword.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <motion.div key={`${faq.category}-${faq.question}`} className="bento-card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Badge className="bg-primary/10 text-primary border-0 mb-3">{faq.category}</Badge>
                <h2 className="font-semibold text-primary-foreground mb-2">{faq.question}</h2>
                <p className="text-primary-foreground/40 text-sm">{faq.answer}</p>
              </motion.div>
            ))
          )}
        </div>

        <div className="bento-card p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-primary-foreground mb-2">Still stuck?</h3>
          <p className="text-primary-foreground/40 mb-6">Use the support center for appeals, tickets, and help.</p>
          <Button asChild className="btn-primary-gradient gap-2"><Link to="/support">Open Support <ChevronRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </BentoPageLayout>
  );
}
