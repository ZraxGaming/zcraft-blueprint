import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, Home, LifeBuoy, Newspaper, Search } from "lucide-react";

const quickLinks = [
  { label: "Homepage", href: "/", icon: Home },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "FAQ", href: "/faq", icon: Search },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout
      seo={{
        title: "404 - Page Not Found",
        description: "The page you requested does not exist on ZCraft Network.",
        url: location.pathname,
        noindex: true,
      }}
    >
      <section className="py-16 lg:py-24 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-10 lg:p-14">
                  <Badge variant="outline" className="mb-5">Error 404</Badge>
                  <h1 className="font-display text-5xl lg:text-7xl font-bold mb-4">
                    Lost In The <span className="text-gradient">Void</span>
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                    The page at <span className="font-mono text-foreground">{location.pathname}</span> does not exist,
                    was moved, or was linked incorrectly.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <Button asChild className="btn-primary-gradient gap-2">
                      <Link to="/">
                        <Home className="h-4 w-4" />
                        Back Home
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link to="/search">
                        <Search className="h-4 w-4" />
                        Search Site
                      </Link>
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {quickLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-t lg:border-t-0 lg:border-l border-border p-10 flex items-center">
                  <div className="w-full">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 mb-6">
                      <Compass className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-3">Quick Recovery</h2>
                    <p className="text-muted-foreground mb-5">
                      Most dead links on this site should now route through support, FAQ, or current content pages.
                    </p>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Try the FAQ page for common problems.</p>
                      <p>Use support for missing pages, appeals, or account issues.</p>
                      <p>Check news if you expected a recent announcement or update.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
