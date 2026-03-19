export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export const supportFaqs: FaqItem[] = [
  {
    category: "Joining",
    question: "How do I join the server?",
    answer: "Add play.zcraftmc.xyz to your Java server list. Check the Play page for the latest supported versions and connection details.",
  },
  {
    category: "Gameplay",
    question: "I lost my items. Can I get them back?",
    answer: "Item restores are usually only handled when a verified server-side bug caused the loss. Open a support ticket with proof and the approximate timestamp.",
  },
  {
    category: "Moderation",
    question: "How do I report a player?",
    answer: "Use in-game reporting if available, or open a support ticket with screenshots, video, usernames, and the time it happened.",
  },
  {
    category: "Moderation",
    question: "How do I appeal a punishment?",
    answer: "Use the appeal portal linked on the support page. Keep the appeal factual and include your exact punishment details.",
  },
  {
    category: "Community",
    question: "How do I apply for staff?",
    answer: "Staff applications open when the network needs coverage. Watch announcements, Discord, and the forums for the next round.",
  },
  {
    category: "Store",
    question: "Is the server free to play?",
    answer: "Yes. The core server is free to join. Purchases, if available, are optional and should not be required to access normal gameplay.",
  },
];
