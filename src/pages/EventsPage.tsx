// %%__NONCE_EVENTS_PAGE_17_%%
// %%__BUILTBYBIT_%%
// %%__RESOURCE_TITLE_%%

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { eventService, Event } from "@/services/eventService";
import { toast } from "@/components/ui/use-toast";

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const upcoming = await eventService.getUpcomingEvents();
      const past = await eventService.getPastEvents();
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (err: any) {
      setError(err?.message || "Failed to load events");
      toast({ title: "Error", description: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-20 text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout
      seo={{
        title: 'Server Events — ZCraft',
        description: 'Join exciting events on ZCraft — tournaments, building contests, seasonal events, and more.',
        keywords: 'zcraft events, server events, minecraft events',
        url: 'https://z-craft.xyz/events',
        type: 'website',
      }}
    >
      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border mb-6">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Events Calendar</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Server <span className="text-gradient">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Join exciting events, win prizes, and make memories with the community.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              Upcoming Events
            </h2>
            <div className="space-y-6">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <Card key={event.id} className="card-hover border-0 bg-card overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-8 md:p-12 text-6xl md:w-48 shrink-0">
                          📅
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-emerald-500/10 text-emerald-600">Upcoming</Badge>
                          </div>
                          <h3 className="font-display text-xl font-bold mb-2">{event.title}</h3>
                          <p className="text-muted-foreground mb-4">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex items-center justify-center md:border-l">
                          <Button className="btn-primary-gradient gap-2">
                            Learn More <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-6">Past Events</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {pastEvents.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-8">No past events</p>
              ) : (
                pastEvents.map((event) => (
                  <Card key={event.id} className="card-hover border-0 bg-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-4">📅</div>
                      <Badge variant="secondary" className="mb-3">Completed</Badge>
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}