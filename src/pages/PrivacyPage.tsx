import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <Layout
      seo={{
        title: "ZCraft Network Privacy Policy — Data Protection & User Rights",
        description: "ZCraft Network privacy policy: Learn how we collect, use, and protect your data on our Minecraft lifesteal SMP server. Your privacy and data security are our priority.",
        keywords: "zcraft privacy policy, minecraft server privacy, data protection, user privacy, gdpr compliance, privacy rights, data collection policy",
        url: "/privacy",
        type: "website",
        tags: ["privacy policy", "data protection", "gdpr", "user rights"]
      }}
    >
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2, 2025</p>

            <Card className="border-0 bg-card">
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    When you use ZCraft, we collect certain information to provide and improve our services. This includes your Minecraft username, IP address for security purposes, gameplay statistics, and any information you voluntarily provide through our forums or support system.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                    <li>To provide and maintain our gaming services</li>
                    <li>To detect and prevent cheating, fraud, and abuse</li>
                    <li>To communicate important server updates and announcements</li>
                    <li>To respond to your support requests</li>
                    <li>To improve our services and develop new features</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">3. Data Storage & Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement industry-standard security measures to protect your data. Your information is stored on secure servers and access is limited to authorized personnel only. We retain your data for as long as your account is active or as needed to provide services.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">4. Third-Party Services</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use third-party services such as Tebex for payment processing and Discord for community communication. These services have their own privacy policies that govern how they handle your information.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">5. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to access, correct, or delete your personal data. You can request a copy of your data or ask us to remove it by contacting our support team. Note that some data may be retained for legal or security purposes.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">6. Cookies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">7. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us at privacy@zcraft.net or through our support system.
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
