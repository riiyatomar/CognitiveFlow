import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Activity as ActivityIcon,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Calendar,
  Lock,
  Eye,
  Check,
  XCircle,
  Repeat,
  Loader2,
  Printer,
  Phone,
  Send,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Activity, Reminder, CaregiverNote, Alert, PatientSummary } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FamilyProfiles from "./FamilyProfiles";

interface CaregiverDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function CaregiverDashboard({ onNavigate }: CaregiverDashboardProps = {}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Modals & Dialogs state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<CaregiverNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<CaregiverNote | null>(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null);

  // Activity Form Fields
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actCategory, setActCategory] = useState("Personal");
  const [actDate, setActDate] = useState(new Date().toISOString().split("T")[0]);
  const [actTime, setActTime] = useState("09:00 AM");
  const [actDuration, setActDuration] = useState("30 mins");
  const [actPriority, setActPriority] = useState("MEDIUM");
  const [actStatus, setActStatus] = useState("upcoming");

  // Reminder Form Fields
  const [remTitle, setRemTitle] = useState("");
  const [remDesc, setRemDesc] = useState("");
  const [remDate, setRemDate] = useState(new Date().toISOString().split("T")[0]);
  const [remTime, setRemTime] = useState("09:00 AM");
  const [remPriority, setRemPriority] = useState("MEDIUM");
  const [remRecurrence, setRemRecurrence] = useState("Once");
  const [remStatus, setRemStatus] = useState("UPCOMING");

  // Note Form Fields
  const [noteText, setNoteText] = useState("");
  const [noteIsPrivate, setNoteIsPrivate] = useState(false);

  // Alert Form Fields
  const [alertType, setAlertType] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertPriority, setAlertPriority] = useState("MEDIUM");

  // Fetch Data Queries
  const { data: summary, isLoading: loadingSummary } = useQuery<PatientSummary>({
    queryKey: ["/api/summary"],
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const { data: notes = [] } = useQuery<CaregiverNote[]>({
    queryKey: ["/api/notes"],
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // ==========================================
  // ACTIVITY MUTATIONS
  // ==========================================
  const saveActivityMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingActivity) {
        const res = await apiRequest("PATCH", `/api/activities/${editingActivity.id}`, payload);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/activities", payload);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setIsActivityModalOpen(false);
      resetActivityForm();
      toast({ title: editingActivity ? "Activity updated" : "Activity created" });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setActivityToDelete(null);
      toast({ title: "Activity deleted" });
    },
  });

  // ==========================================
  // REMINDER MUTATIONS
  // ==========================================
  const saveReminderMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingReminder) {
        const res = await apiRequest("PATCH", `/api/reminders/${editingReminder.id}`, payload);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/reminders", payload);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsReminderModalOpen(false);
      resetReminderForm();
      toast({ title: editingReminder ? "Reminder updated" : "Reminder created" });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setReminderToDelete(null);
      toast({ title: "Reminder deleted" });
    },
  });

  // ==========================================
  // NOTE MUTATIONS
  // ==========================================
  const saveNoteMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingNote) {
        const res = await apiRequest("PATCH", `/api/notes/${editingNote.id}`, payload);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/notes", payload);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsNoteModalOpen(false);
      resetNoteForm();
      toast({ title: editingNote ? "Note updated" : "Note saved" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNoteToDelete(null);
      toast({ title: "Note deleted" });
    },
  });

  // ==========================================
  // ALERT MUTATIONS
  // ==========================================
  const saveAlertMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingAlert) {
        const res = await apiRequest("PATCH", `/api/alerts/${editingAlert.id}`, payload);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/alerts", payload);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setIsAlertModalOpen(false);
      resetAlertForm();
      toast({ title: editingAlert ? "Alert updated" : "Alert created" });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setAlertToDelete(null);
      toast({ title: "Alert deleted" });
    },
  });

  // Helpers
  const resetActivityForm = () => {
    setEditingActivity(null);
    setActTitle("");
    setActDesc("");
    setActCategory("Personal");
    setActDate(new Date().toISOString().split("T")[0]);
    setActTime("09:00 AM");
    setActDuration("30 mins");
    setActPriority("MEDIUM");
    setActStatus("upcoming");
  };

  const openEditActivity = (act: Activity) => {
    setEditingActivity(act);
    setActTitle(act.activityName);
    setActDesc(act.description || "");
    setActCategory(act.category || "Personal");
    setActDate(act.date || new Date().toISOString().split("T")[0]);
    setActTime(act.time);
    setActDuration(act.duration || "30 mins");
    setActPriority(act.priority || "MEDIUM");
    setActStatus(act.status);
    setIsActivityModalOpen(true);
  };

  const resetReminderForm = () => {
    setEditingReminder(null);
    setRemTitle("");
    setRemDesc("");
    setRemDate(new Date().toISOString().split("T")[0]);
    setRemTime("09:00 AM");
    setRemPriority("MEDIUM");
    setRemRecurrence("Once");
    setRemStatus("UPCOMING");
  };

  const openEditReminder = (rem: Reminder) => {
    setEditingReminder(rem);
    setRemTitle(rem.title);
    setRemDesc(rem.description || "");
    setRemDate(rem.date);
    setRemTime(rem.time);
    setRemPriority(rem.priority);
    setRemRecurrence(rem.recurrence);
    setRemStatus(rem.status);
    setIsReminderModalOpen(true);
  };

  const resetNoteForm = () => {
    setEditingNote(null);
    setNoteText("");
    setNoteIsPrivate(false);
  };

  const openEditNote = (n: CaregiverNote) => {
    setEditingNote(n);
    setNoteText(n.noteText);
    setNoteIsPrivate(n.isPrivate);
    setIsNoteModalOpen(true);
  };

  const resetAlertForm = () => {
    setEditingAlert(null);
    setAlertType("info");
    setAlertMessage("");
    setAlertPriority("MEDIUM");
  };

  // Timeline Builder
  const timelineEvents = [
    ...activities.map(a => ({
      time: a.time,
      title: `Activity: ${a.activityName}`,
      description: a.description || `Category: ${a.category}`,
      status: a.status,
      type: "activity",
    })),
    ...reminders.map(r => ({
      time: r.time,
      title: `Reminder: ${r.title}`,
      description: `Recurrence: ${r.recurrence}`,
      status: r.status.toLowerCase(),
      type: "reminder",
    })),
    ...notes.map(n => ({
      time: new Date(n.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Caregiver Note: ${n.noteText.slice(0, 40)}...`,
      description: n.isPrivate ? "Caregiver Private" : "Visible to Patient",
      status: "info",
      type: "note",
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Caregiver Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Caregiver Portal & Care Management</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Authorized Care Planning
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Managing Patient Care Plan for <strong className="text-foreground">{summary?.patientName || "Jane Doe"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button size="sm" onClick={() => setIsActivityModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-muted/60 p-1.5 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg gap-2">
            <ActivityIcon className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="activities" className="rounded-lg gap-2">
            <Calendar className="w-4 h-4" /> Activities
          </TabsTrigger>
          <TabsTrigger value="reminders" className="rounded-lg gap-2">
            <Bell className="w-4 h-4" /> Reminders
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg gap-2">
            <FileText className="w-4 h-4" /> Notes & Alerts
          </TabsTrigger>
          <TabsTrigger value="family" className="rounded-lg gap-2">
            <Users className="w-4 h-4" /> Family & Profiles
          </TabsTrigger>
        </TabsList>

        {/* ==========================================
            TAB 1: OVERVIEW & TODAY'S CARE PLAN
            ========================================== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Activities</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {activities.filter(a => a.status === "completed").length} / {activities.length}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Reminders</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {reminders.filter(r => r.status === "UPCOMING").length}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Bell className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recognition Rate</p>
                  <h3 className="text-2xl font-bold mt-1">{summary?.faceRecognitionSuccessRate || 95}%</h3>
                  <p className="text-xs text-muted-foreground mt-1">AI Face accuracy</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {alerts.filter(a => !a.resolved).length}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Care Plan Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Today's Care Plan Schedule
                      </CardTitle>
                      <CardDescription>Structured daily schedule for patient care</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setIsActivityModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No activities planned for today. Click "Add Item" to schedule.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act.id}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                          act.status === "completed"
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : act.status === "missed"
                            ? "bg-amber-500/5 border-amber-500/20"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="font-mono text-xs font-semibold px-2 py-1 bg-muted rounded shrink-0">
                            {act.time}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{act.activityName}</span>
                              <Badge variant="secondary" className="text-[10px]">{act.category}</Badge>
                            </div>
                            {act.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{act.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={act.status}
                            onValueChange={(val) => {
                              saveActivityMutation.mutate({ id: act.id, status: val });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="missed">Missed</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditActivity(act)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Patient Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Patient Event Timeline
                  </CardTitle>
                  <CardDescription>Chronological stream of patient activities and care notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {timelineEvents.map((evt, idx) => (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary">{evt.time}</span>
                            <span className="text-sm font-semibold">{evt.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{evt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health & Engagement Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement & Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily Activity Rate</span>
                      <span className="font-semibold">{summary?.dailyActivitiesCompletedRate || 85}%</span>
                    </div>
                    <Progress value={summary?.dailyActivitiesCompletedRate || 85} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Voice Assistant Usage</span>
                      <span className="font-semibold">{summary?.voiceInteractions || 14} queries</span>
                    </div>
                    <Progress value={75} className="h-2 bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Family Contacts</span>
                      <span className="font-semibold">{summary?.familyCallsThisWeek || 4} this week</span>
                    </div>
                    <Progress value={80} className="h-2 bg-muted" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Caregiver Notes Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Recent Notes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsNoteModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No notes logged yet.</p>
                  ) : (
                    notes.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-3 rounded-lg bg-muted/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {new Date(n.dateTime).toLocaleDateString()}
                          </span>
                          <Badge variant={n.isPrivate ? "secondary" : "outline"} className="text-[9px]">
                            {n.isPrivate ? "Caregiver Private" : "Patient Visible"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{n.noteText}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ==========================================
            TAB 2: ACTIVITIES MANAGER
            ========================================== */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Activity Management</CardTitle>
                <CardDescription>Schedule, edit, and track patient activities</CardDescription>
              </div>
              <Button onClick={() => { resetActivityForm(); setIsActivityModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add New Activity
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 border rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{act.activityName}</span>
                        <Badge variant="outline">{act.category}</Badge>
                        <Badge variant={act.status === "completed" ? "default" : "secondary"}>
                          {act.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{act.description || "No description provided."}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span>Time: {act.time}</span>
                        <span>Date: {act.date}</span>
                        <span>Priority: {act.priority}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditActivity(act)}>
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setActivityToDelete(act)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            TAB 3: REMINDERS MANAGER
            ========================================== */}
        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recurring Reminders System</CardTitle>
                <CardDescription>Manage patient reminders with recurrence and priority</CardDescription>
              </div>
              <Button onClick={() => { resetReminderForm(); setIsReminderModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Reminder
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div key={rem.id} className="p-4 border rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{rem.title}</span>
                        <Badge variant="secondary" className="gap-1">
                          <Repeat className="w-3 h-3" /> {rem.recurrence}
                        </Badge>
                        <Badge variant={rem.status === "COMPLETED" ? "default" : "outline"}>
                          {rem.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rem.description}</p>
                      <div className="text-xs text-muted-foreground pt-1">
                        Time: {rem.time} • Priority: {rem.priority}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditReminder(rem)}>
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setReminderToDelete(rem)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==========================================
            TAB 4: CAREGIVER NOTES & ALERTS
            ========================================== */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Notes Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Clinical & Care Notes</CardTitle>
                  <CardDescription>Internal or patient-visible memory context</CardDescription>
                </div>
                <Button size="sm" onClick={() => { resetNoteForm(); setIsNoteModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Note
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.dateTime).toLocaleString()}
                      </span>
                      <Badge variant={n.isPrivate ? "secondary" : "outline"}>
                        {n.isPrivate ? "Caregiver Private" : "Patient Visible"}
                      </Badge>
                    </div>
                    <p className="text-sm">{n.noteText}</p>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditNote(n)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setNoteToDelete(n)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alerts Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">System & Safety Alerts</CardTitle>
                  <CardDescription>Manage and resolve patient notifications</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => { resetAlertForm(); setIsAlertModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Create Alert
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((al) => (
                  <div key={al.id} className="p-3 border rounded-lg flex items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={al.resolved ? "secondary" : "destructive"}>
                          {al.priority}
                        </Badge>
                        <span className="text-sm font-medium">{al.message}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{al.time}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={al.resolved ? "outline" : "default"}
                        onClick={() => saveAlertMutation.mutate({ id: al.id, resolved: !al.resolved })}
                      >
                        {al.resolved ? "Reopen" : "Resolve"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setAlertToDelete(al)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==========================================
            TAB 5: FAMILY MANAGEMENT
            ========================================== */}
        <TabsContent value="family">
          <FamilyProfiles />
        </TabsContent>
      </Tabs>

      {/* ==========================================
          MODALS & DIALOGS
          ========================================== */}

      {/* Activity Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Create New Activity"}</DialogTitle>
            <DialogDescription>Add or update activity details for patient care plan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-2">
              <Label>Activity Title *</Label>
              <Input
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="e.g. Morning Walk"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={actCategory} onValueChange={setActCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Exercise">Exercise</SelectItem>
                    <SelectItem value="Meal">Meal</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Medication-related">Medication-related</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
                <Input value={actTime} onChange={(e) => setActTime(e.target.value)} placeholder="09:00 AM" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={actDate} onChange={(e) => setActDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Input value={actDuration} onChange={(e) => setActDuration(e.target.value)} placeholder="30 mins" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Instructions</Label>
              <Textarea
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                placeholder="Details about the activity..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                saveActivityMutation.mutate({
                  activityName: actTitle,
                  description: actDesc,
                  category: actCategory,
                  date: actDate,
                  time: actTime,
                  duration: actDuration,
                  priority: actPriority,
                  status: actStatus,
                });
              }}
            >
              {saveActivityMutation.isPending ? "Saving..." : "Save Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Modal */}
      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingReminder ? "Edit Reminder" : "Create New Reminder"}</DialogTitle>
            <DialogDescription>Configure patient reminder details and recurrence schedule.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-2">
              <Label>Reminder Title *</Label>
              <Input
                value={remTitle}
                onChange={(e) => setRemTitle(e.target.value)}
                placeholder="e.g. Take Evening Medication"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Recurrence</Label>
                <Select value={remRecurrence} onValueChange={setRemRecurrence}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once">Once</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Every Monday">Every Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Input value={remTime} onChange={(e) => setRemTime(e.target.value)} placeholder="08:00 PM" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={remDesc}
                onChange={(e) => setRemDesc(e.target.value)}
                placeholder="Details or memory prompt for patient..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                saveReminderMutation.mutate({
                  title: remTitle,
                  description: remDesc,
                  date: remDate,
                  time: remTime,
                  priority: remPriority,
                  recurrence: remRecurrence,
                  status: remStatus,
                });
              }}
            >
              {saveReminderMutation.isPending ? "Saving..." : "Save Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Edit Care Note" : "Add Care Note"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-2">
              <Label>Note Content *</Label>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log patient condition, mood, or care notes..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div className="space-y-0.5">
                <Label>Private Caregiver Note</Label>
                <p className="text-xs text-muted-foreground">If enabled, note is hidden from patient view</p>
              </div>
              <Switch checked={noteIsPrivate} onCheckedChange={setNoteIsPrivate} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                saveNoteMutation.mutate({
                  noteText,
                  isPrivate: noteIsPrivate,
                });
              }}
            >
              {saveNoteMutation.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Modal */}
      <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Create Safety Alert</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-2">
              <Label>Alert Message *</Label>
              <Input
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="e.g. Patient missed scheduled morning walk"
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={alertPriority} onValueChange={setAlertPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">LOW</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                saveAlertMutation.mutate({
                  message: alertMessage,
                  priority: alertPriority,
                  type: "warning",
                });
              }}
            >
              {saveAlertMutation.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alerts */}
      <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this activity?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => activityToDelete && deleteActivityMutation.mutate(activityToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!reminderToDelete} onOpenChange={(open) => !open && setReminderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this reminder?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => reminderToDelete && deleteReminderMutation.mutate(reminderToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Caregiver Note?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this note?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => noteToDelete && deleteNoteMutation.mutate(noteToDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}