import { BentoPageLayout } from "@/components/layout/BentoPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, MessageSquare, Globe, Users, Gavel } from "lucide-react";
import { motion } from "framer-motion";

const ruleCategories = [
  {
    id: "server", name: "Server Rules", icon: Shield,
    rules: [
      { title: "No Cheating", description: "Using hacks, mods, or exploits that provide unfair advantages is strictly prohibited." },
      { title: "No Griefing", description: "Destroying or defacing other players' builds without permission is not allowed." },
      { title: "No Exploiting", description: "Abusing game mechanics or bugs to gain unfair advantages will result in punishment." },
      { title: "Respect Staff", description: "Follow staff instructions and do not argue with moderation decisions publicly." },
      { title: "No Account Sharing", description: "Each account should be used by one person only." },
    ],
  },
  {
    id: "chat", name: "Chat Rules", icon: MessageSquare,
    rules: [
      { title: "Be Respectful", description: "Treat all players with respect. No harassment, hate speech, or discrimination." },
      { title: "No Spam", description: "Avoid excessive messages, caps, or repeated content." },
      { title: "No Advertising", description: "Do not advertise other servers, websites, or services." },
      { title: "Keep it Clean", description: "No inappropriate, offensive, or explicit content." },
      { title: "English in Global Chat", description: "Please use English in global chat channels." },
    ],
  },
  {
    id: "forum", name: "Forum Rules", icon: Globe,
    rules: [
      { title: "Stay On Topic", description: "Post in the appropriate category and stay on topic." },
      { title: "No Necroposting", description: "Avoid reviving old threads unless you have valuable input." },
      { title: "Quality Content", description: "Make sure your posts are constructive and add value." },
      { title: "No Plagiarism", description: "Give credit where it's due and don't steal content." },
      { title: "Report, Don't Retaliate", description: "Report rule breakers to staff instead of engaging." },
    ],
  },
  {
    id: "discord", name: "Discord Rules", icon: Users,
    rules: [
      { title: "Follow Discord TOS", description: "Adhere to Discord's Terms of Service at all times." },
      { title: "Use Correct Channels", description: "Keep discussions in their appropriate channels." },
      { title: "No Ear Rape", description: "No loud or distorted audio in voice channels." },
      { title: "Respect Privacy", description: "Do not share personal information without consent." },
      { title: "No Impersonation", description: "Do not impersonate staff members or other players." },
    ],
  },
  {
    id: "punishments", name: "Punishments", icon: Gavel,
    rules: [
      { title: "Verbal Warning", description: "First minor offense typically results in a warning." },
      { title: "Temporary Mute", description: "Chat violations may result in temporary mutes (1h - 7d)." },
      { title: "Temporary Ban", description: "Serious offenses result in temporary bans (1d - 30d)." },
      { title: "Permanent Ban", description: "Repeat or severe offenses lead to permanent bans." },
      { title: "Appeals", description: "You may appeal punishments through our support system." },
    ],
  },
];

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" as const },
  }),
};

export default function RulesPage() {
  return (
    <BentoPageLayout
      title="Server Rules"
      subtitle="Please read and follow these rules to ensure a great experience for everyone."
      seo={{
        title: "ZCraft Network Server Rules — Minecraft Community Guidelines",
        description: "Complete server rules for ZCraft Network Minecraft server. Learn about gameplay rules, chat guidelines, forum policies, and Discord rules.",
        keywords: "zcraft rules, minecraft server rules, lifesteal rules, minecraft smp rules, server guidelines",
        url: "/rules",
        type: "article",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="server" className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-bento-card p-2 mb-8 rounded-2xl border border-bento-border">
            {ruleCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-primary-foreground/60 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {ruleCategories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="bento-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <cat.icon className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-primary-foreground">{cat.name}</h2>
                </div>
                <div className="space-y-3">
                  {cat.rules.map((rule, i) => (
                    <motion.div
                      key={i}
                      className="p-4 rounded-xl bg-bento-bg hover:bg-bento-card-hover transition-colors"
                      custom={i} variants={itemAnim} initial="hidden" animate="visible"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display font-bold text-sm">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-primary-foreground mb-1">{rule.title}</h3>
                          <p className="text-sm text-primary-foreground/50">{rule.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 p-6 rounded-2xl bg-bento-card border border-bento-border text-center">
          <p className="text-sm text-primary-foreground/50">
            <strong className="text-primary-foreground/70">Note:</strong> Staff reserve the right to issue punishments at their discretion. Rules may be updated at any time.
          </p>
        </div>
      </div>
    </BentoPageLayout>
  );
}
