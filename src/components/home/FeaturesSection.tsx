import { Sword, Users, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/siteEnv";

const features = [
  {
    icon: Sword,
    title: "Survival Experience",
    description: "Classic survival gameplay with unique twists, custom enchantments, and challenging dungeons.",
    gradient: "from-red-500/20 to-orange-500/20",
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Join thousands of active players, make friends, and build together in our welcoming community.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Anti-Cheat Protected",
    description: "State-of-the-art protection ensures fair gameplay for everyone, every time.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Zero Lag",
    description: "Optimized servers with dedicated hardware provide the smoothest experience possible.",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Why Play <span className="text-gradient">{siteConfig.shortName}</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover what makes our server special and why players keep coming back.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="card-hover border-0 bg-card h-full group">
                <CardContent className="p-6 text-center">
                  <motion.div 
                    className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
