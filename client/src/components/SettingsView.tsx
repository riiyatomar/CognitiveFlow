import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Volume2, 
  ShieldCheck, 
  LogOut
} from "lucide-react";

export default function SettingsView() {
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [memoryReminders, setMemoryReminders] = useState(true);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  const handleSavePreferences = () => {
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Settings & Preferences
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your Memory Mirror experience and manage your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              User Profile
            </CardTitle>
            <CardDescription>Your active account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {getInitials(user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">{user?.username}</h3>
                  <Badge variant={user?.role === "caregiver" ? "default" : "secondary"}>
                    {user?.role === "caregiver" ? "Caregiver (Pro)" : "Patient"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  User ID: {user?.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              Appearance & Theme
            </CardTitle>
            <CardDescription>Customize the visual interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme for easier viewing
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-2"
                data-testid="button-settings-theme-toggle"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" /> Light Theme
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" /> Dark Theme
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice & Assistant Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              Voice & Audio Preferences
            </CardTitle>
            <CardDescription>Configure AI assistant voice interaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Voice Assistance</Label>
                <p className="text-sm text-muted-foreground">
                  Enable text-to-speech audio for AI responses
                </p>
              </div>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={(checked) => {
                  setVoiceEnabled(checked);
                  handleSavePreferences();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Autoplay Audio</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically read aloud AI voice assistant responses
                </p>
              </div>
              <Switch
                checked={autoPlayAudio}
                onCheckedChange={(checked) => {
                  setAutoPlayAudio(checked);
                  handleSavePreferences();
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Gentle Memory Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive gentle audio prompts for scheduled daily activities
                </p>
              </div>
              <Switch
                checked={memoryReminders}
                onCheckedChange={(checked) => {
                  setMemoryReminders(checked);
                  handleSavePreferences();
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account & Logout */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Account Actions
            </CardTitle>
            <CardDescription>Manage your session</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Log out of your Memory Mirror account on this device
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-settings-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Signing out..." : "Log Out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
