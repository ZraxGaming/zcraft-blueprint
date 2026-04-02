// %%__NONCE_ADMIN_EVENTS_04_%%
// %%__BUILTBYBIT_%%
// %%__TIMESTAMP_%%

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  Users,
  Clock,
  Loader,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { eventService, Event } from "@/services/eventService";
import { toast } from "@/components/ui/use-toast";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents(50, 0);
      setEvents(data);
    } catch (err: any) {
      console.error('Error loading events:', err);
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setMaxPlayers("");
    setImageUrl("");
    setEditingEvent(null);
  };

  const handleCreate = async () => {
    if (!title || !description || !date || !location) {
      toast({ title: "Missing fields", description: "Please fill in all required fields" });
      return;
    }

    try {
      setSaving(true);
      const dateTime = time ? `${date}T${time}:00` : `${date}T12:00:00`;
      
      await eventService.createEvent({
        title,
        description,
        date: new Date(dateTime).toISOString(),
        location,
        max_players: maxPlayers ? parseInt(maxPlayers) : null,
        image_url: imageUrl || null,
      });
      
      toast({ title: "Success", description: "Event created successfully" });
      setIsCreateOpen(false);
      resetForm();
      loadEvents();
    } catch (err: any) {
      console.error('Error creating event:', err);
      toast({ title: "Error", description: err?.message || "Failed to create event", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingEvent || !title || !description || !date || !location) {
      toast({ title: "Missing fields", description: "Please fill in all required fields" });
      return;
    }

    try {
      setSaving(true);
      const dateTime = time ? `${date}T${time}:00` : `${date}T12:00:00`;
      
      await eventService.updateEvent(editingEvent.id, {
        title,
        description,
        date: new Date(dateTime).toISOString(),
        location,
        max_players: maxPlayers ? parseInt(maxPlayers) : null,
        image_url: imageUrl || null,
      });
      
      toast({ title: "Success", description: "Event updated successfully" });
      setIsEditOpen(false);
      resetForm();
      loadEvents();
    } catch (err: any) {
      console.error('Error updating event:', err);
      toast({ title: "Error", description: err?.message || "Failed to update event", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, eventTitle: string) => {
    if (!confirm(`Delete "${eventTitle}"?`)) return;
    
    try {
      await eventService.deleteEvent(id);
      toast({ title: "Success", description: "Event deleted" });
      loadEvents();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete event", variant: "destructive" });
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    const eventDate = new Date(event.date);
    setDate(eventDate.toISOString().split('T')[0]);
    setTime(eventDate.toTimeString().slice(0, 5));
    setLocation(event.location);
    setMaxPlayers(event.max_players?.toString() || "");
    setImageUrl(event.image_url || "");
    setIsEditOpen(true);
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  if (loading) {
    return (
      <AdminLayout title="Events Management">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const EventForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Event Title *</Label>
        <Input 
          placeholder="Enter event title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Time</Label>
          <Input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Location *</Label>
          <Input 
            placeholder="e.g., Spawn Arena" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Players</Label>
          <Input 
            type="number" 
            placeholder="Unlimited"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input 
          placeholder="https://..." 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea 
          placeholder="Describe the event..." 
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>Cancel</Button>
        <Button className="btn-primary-gradient" onClick={onSubmit} disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Events Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end">
          <Button className="btn-primary-gradient gap-2" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Upcoming Events", value: upcomingEvents.length.toString() },
            { label: "Total Participants", value: events.reduce((sum, e) => sum + (e.registered_count || 0), 0).toString() },
            { label: "This Month", value: events.filter(e => new Date(e.date).getMonth() === now.getMonth()).length.toString() },
            { label: "Completed", value: pastEvents.length.toString() },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-display">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events ({upcomingEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-xs text-primary font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.registered_count || 0} / {event.max_players || '∞'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/events`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(event)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(event.id, event.title)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Events ({pastEvents.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastEvents.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} • {event.registered_count || 0} participants
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{event.location}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleCreate} submitLabel="Create Event" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
