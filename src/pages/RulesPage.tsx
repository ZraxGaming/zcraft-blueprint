import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MessageSquare, Globe, Users, Gavel } from "lucide-react";

const ruleCategories = [
  {
    id: "server",
    name: "Server Rules",
    icon: Shield,
    rules: [
      { title: "No Cheating", description: "Using hacks, mods, or exploits that provide unfair advantages is strictly prohibited." },
      { title: "No Griefing", description: "Destroying or defacing other players' builds without permission is not allowed." },
      { title: "No Exploiting", description: "Abusing game mechanics or bugs to gain unfair advantages will result in punishment." },
      { title: "Respect Staff", description: "Follow staff instructions and do not argue with moderation decisions publicly." },
      { title: "No Account Sharing", description: "Each account should be used by one person only." },
    ],
  },
  {
    id: "chat",
    name: "Chat Rules",
    icon: MessageSquare,
    rules: [
      { title: "Be Respectful", description: "Treat all players with respect. No harassment, hate speech, or discrimination." },
      { title: "No Spam", description: "Avoid excessive messages, caps, or repeated content." },
      { title: "No Advertising", description: "Do not advertise other servers, websites, or services." },
      { title: "Keep it Clean", description: "No inappropriate, offensive, or explicit content." },
      { title: "English in Global Chat", description: "Please use English in global chat channels." },
    ],
  },
  {
    id: "forum",
    name: "Forum Rules",
    icon: Globe,
    rules: [
      { title: "Stay On Topic", description: "Post in the appropriate category and stay on topic." },
      { title: "No Necroposting", description: "Avoid reviving old threads unless you have valuable input." },
      { title: "Quality Content", description: "Make sure your posts are constructive and add value." },
      { title: "No Plagiarism", description: "Give credit where it's due and don't steal content." },
      { title: "Report, Don't Retaliate", description: "Report rule breakers to staff instead of engaging." },
    ],
  },
  {
    id: "discord",
    name: "Discord Rules",
    icon: Users,
    rules: [
      { title: "Follow Discord TOS", description: "Adhere to Discord's Terms of Service at all times." },
      { title: "Use Correct Channels", description: "Keep discussions in their appropriate channels." },
      { title: "No Ear Rape", description: "No loud or distorted audio in voice channels." },
      { title: "Respect Privacy", description: "Do not share personal information without consent." },
      { title: "No Impersonation", description: "Do not impersonate staff members or other players." },
    ],
  },
  {
    id: "punishments",
    name: "Punishments",
    icon: Gavel,
    rules: [
      { title: "Verbal Warning", description: "First minor offense typically results in a warning." },
      { title: "Temporary Mute", description: "Chat violations may result in temporary mutes (1h - 7d)." },
      { title: "Temporary Ban", description: "Serious offenses result in temporary bans (1d - 30d)." },
      { title: "Permanent Ban", description: "Repeat or severe offenses lead to permanent bans." },
      { title: "Appeals", description: "You may appeal punishments through our support system." },
    ],
  },
];

export default function RulesPage() {
  return (
    <Layout
      seo={{
        title: "ZCraft Network Server Rules — Minecraft Community Guidelines",
        description: "Complete server rules for ZCraft Network Minecraft server. Learn about gameplay rules, chat guidelines, forum policies, and Discord rules for our lifesteal SMP community.",
        keywords: "zcraft rules, minecraft server rules, lifesteal rules, minecraft smp rules, server guidelines, minecraft community rules, zcraft network rules",
        url: "/rules",
        type: "article",
        tags: ["minecraft rules", "server rules", "lifesteal rules", "gaming community", "minecraft smp"]
      }}
    >
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Server <span className="text-gradient">Rules</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Please read and follow these rules to ensure a great experience for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Rules Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="server" className="w-full">
              <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
                {ruleCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <category.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {ruleCategories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <Card className="border-0 bg-card">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl flex items-center gap-3">
                        <category.icon className="h-6 w-6 text-primary" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {category.rules.map((rule, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-sm">
                                {index + 1}
                              </span>
                              <div>
                                <h3 className="font-semibold mb-1">{rule.title}</h3>
                                <p className="text-sm text-muted-foreground">{rule.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Disclaimer */}
            <div className="mt-8 p-6 rounded-xl bg-muted/50 border">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Note:</strong> Staff reserve the right to issue punishments at their discretion.
                Rules may be updated at any time. Ignorance of the rules is not an excuse.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
