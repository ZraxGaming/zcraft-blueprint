import { BentoPageLayout } from "@/components/layout/BentoPageLayout";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing or using ZCraft services, including our Minecraft server, website, forums, and Discord, you agree to be bound by these Terms of Service." },
  { title: "2. Account Responsibility", content: "You are responsible for maintaining the security of your account. Any actions taken through your account are your responsibility. Do not share your account credentials." },
  { title: "3. Server Rules", content: "All players must follow our server rules, available on our Rules page. Violations may result in warnings, mutes, temporary bans, or permanent bans." },
  { title: "4. Purchases & Refunds", content: "All purchases made through our store are final. Refunds may be issued at our discretion. Chargebacks will result in permanent bans." },
  { title: "5. Intellectual Property", content: "ZCraft and its original content are owned by ZCraft and protected by international copyright and trademark laws. Minecraft is a trademark of Mojang AB." },
  { title: "6. Disclaimer", content: "Our services are provided 'as is' without warranties of any kind. We are not liable for any data loss, downtime, or damages." },
  { title: "7. Changes to Terms", content: "We reserve the right to modify these terms at any time. Continued use constitutes acceptance of the new terms." },
  { title: "8. Contact", content: "For questions about these Terms, contact us at legal@zcraft.net or through our support system." },
];

export default function TermsPage() {
  return (
    <BentoPageLayout
      title="Terms of Service"
      subtitle="Last updated: January 2, 2025"
      seo={{
        title: "ZCraft Network Terms of Service — Server Usage Agreement",
        description: "ZCraft Network Terms of Service: Complete terms and conditions for using our services.",
        keywords: "zcraft terms of service, terms and conditions, server agreement",
        url: "/terms", type: "website",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bento-card p-8 space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-xl font-semibold text-primary-foreground mb-3">{s.title}</h2>
              <p className="text-primary-foreground/50 leading-relaxed text-sm">{s.content}</p>
              {i < sections.length - 1 && <div className="border-b border-bento-border mt-8" />}
            </section>
          ))}
        </div>
      </div>
    </BentoPageLayout>
  );
}
