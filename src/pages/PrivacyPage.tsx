import { BentoPageLayout } from "@/components/layout/BentoPageLayout";

const sections = [
  { title: "1. Information We Collect", content: "When you use ZCraft, we collect certain information to provide and improve our services. This includes your Minecraft username, IP address for security purposes, gameplay statistics, and any information you voluntarily provide through our forums or support system." },
  { title: "2. How We Use Your Information", content: "To provide and maintain our gaming services. To detect and prevent cheating, fraud, and abuse. To communicate important server updates and announcements. To respond to your support requests. To improve our services and develop new features." },
  { title: "3. Data Storage & Security", content: "We implement industry-standard security measures to protect your data. Your information is stored on secure servers and access is limited to authorized personnel only." },
  { title: "4. Third-Party Services", content: "We use third-party services such as Tebex for payment processing and Discord for community communication. These services have their own privacy policies." },
  { title: "5. Your Rights", content: "You have the right to access, correct, or delete your personal data. Contact our support team to request a copy or deletion of your data." },
  { title: "6. Cookies", content: "Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic." },
  { title: "7. Contact Us", content: "If you have questions about this Privacy Policy, please contact us at privacy@zcraft.net or through our support system." },
];

export default function PrivacyPage() {
  return (
    <BentoPageLayout
      title="Privacy Policy"
      subtitle="Last updated: January 2, 2025"
      seo={{
        title: "ZCraft Network Privacy Policy — Data Protection & User Rights",
        description: "ZCraft Network privacy policy: Learn how we collect, use, and protect your data.",
        keywords: "zcraft privacy policy, data protection, user privacy, gdpr compliance",
        url: "/privacy", type: "website",
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
