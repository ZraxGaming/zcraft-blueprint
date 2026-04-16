import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <Layout
      seo={{
        title: "ZCraft Network Terms of Service — Server Usage Agreement",
        description: "ZCraft Network Terms of Service: Complete terms and conditions for using our Minecraft lifesteal SMP server, forums, Discord, and all community services.",
        keywords: "zcraft terms of service, minecraft server terms, terms and conditions, server agreement, user agreement, service terms, minecraft tos",
        url: "/terms",
        type: "website",
        tags: ["terms of service", "user agreement", "server rules", "legal"]
      }}
    >
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2, 2025</p>

            <Card className="border-0 bg-card">
              <CardContent className="p-8 space-y-8">
                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using ZCraft services, including our Minecraft server, website, forums, and Discord, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">2. Account Responsibility</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the security of your account. Any actions taken through your account are your responsibility. Do not share your account credentials with others. We reserve the right to suspend or terminate accounts that violate our rules.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">3. Server Rules</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All players must follow our server rules, available on our Rules page. Violations may result in warnings, mutes, temporary bans, or permanent bans at the discretion of our staff team.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">4. Purchases & Refunds</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All purchases made through our store are final. Refunds may be issued at our discretion for technical issues or billing errors. Chargebacks will result in permanent bans. Virtual items have no real-world monetary value and cannot be exchanged or transferred.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">5. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ZCraft and its original content, features, and functionality are owned by ZCraft and are protected by international copyright, trademark, and other intellectual property laws. Minecraft is a trademark of Mojang AB.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">6. Disclaimer</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our services are provided "as is" without warranties of any kind. We do not guarantee uninterrupted service and are not liable for any data loss, downtime, or damages resulting from the use of our services.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">7. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms. Major changes will be announced on our Discord and forums.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="font-display text-xl font-semibold mb-4">8. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms of Service, contact us at legal@zcraft.net or through our support system.
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
