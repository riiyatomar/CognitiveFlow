import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Sparkles,
  Repeat,
  Check,
  XCircle,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Activity, Reminder } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PatientRemindersCard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: activities = [], isLoading: loadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: reminders = [], isLoading: loadingReminders } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  // Toggle activity status
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/activities/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({ title: "Status updated", description: "Activity status saved." });
    },
  });

  // Toggle reminder status
  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/reminders/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Reminder updated", description: "Reminder status saved." });
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return <Badge variant="destructive" className="text-[10px]">High Priority</Badge>;
      case "LOW":
        return <Badge variant="secondary" className="text-[10px]">Low Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Medium Priority</Badge>;
    }
  };

  const combinedItems = [
    ...activities.map(a => ({
      id: a.id,
      title: a.activityName,
      description: a.description,
      time: a.time,
      type: "activity" as const,
      category: a.category,
      priority: a.priority,
      status: a.status.toLowerCase(),
      recurrence: null,
    })),
    ...reminders.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      time: r.time,
      type: "reminder" as const,
      category: "Reminder",
      priority: r.priority,
      status: r.status.toLowerCase(),
      recurrence: r.recurrence,
    }))
  ];

  const upcomingItems = combinedItems.filter(i => i.status === "upcoming");
  const completedItems = combinedItems.filter(i => i.status === "completed");
  const missedItems = combinedItems.filter(i => i.status === "missed");

  const filteredItems = activeTab === "upcoming" ? upcomingItems :
                        activeTab === "completed" ? completedItems :
                        activeTab === "missed" ? missedItems : combinedItems;

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Today's Reminders & Care Plan</CardTitle>
              <CardDescription>Scheduled activities and reminders set by your caregiver</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 font-semibold text-primary border-primary/30">
            {upcomingItems.length} Upcoming
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All ({combinedItems.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingItems.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedItems.length})</TabsTrigger>
            <TabsTrigger value="missed">Missed ({missedItems.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {loadingActivities || loadingReminders ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 bg-muted/20 rounded-lg">
            <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No items in this view.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={`${item.type}-${item.id}`}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  item.status === "completed"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : item.status === "missed"
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    item.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                    item.status === "missed" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                  }`}>
                    {item.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                     item.status === "missed" ? <XCircle className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-foreground">{item.title}</span>
                      <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      {getPriorityBadge(item.priority)}
                      {item.recurrence && item.recurrence !== "Once" && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Repeat className="w-3 h-3" />
                          {item.recurrence}
                        </Badge>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {item.time}
                      </span>
                      <span className="capitalize font-semibold text-xs">
                        Status: <span className={
                          item.status === "completed" ? "text-emerald-600" :
                          item.status === "missed" ? "text-amber-600" : "text-primary"
                        }>{item.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {item.status !== "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800"
                    onClick={() => {
                      if (item.type === "activity") {
                        updateActivityMutation.mutate({ id: item.id, status: "completed" });
                      } else {
                        updateReminderMutation.mutate({ id: item.id, status: "COMPLETED" });
                      }
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Done
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
