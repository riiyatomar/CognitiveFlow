import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, Loader2, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const { loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "caregiver">("patient");
  const [patientId, setPatientId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password, role, patientId: role === 'caregiver' ? patientId : null });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">CognitiveFlow</h1>
        <p className="text-muted-foreground mt-2">Your personalized cognitive assistance system</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your credentials to access your account" 
              : "Set up a new account for yourself or a family member"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Account Role</Label>
                  <Select value={role} onValueChange={(v: "patient" | "caregiver") => setRole(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient (Primary User)</SelectItem>
                      <SelectItem value="caregiver">Caregiver / Family Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === "caregiver" && (
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Assigned Patient ID</Label>
                    <Input
                      id="patientId"
                      type="text"
                      placeholder="UUID of the patient"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the unique ID of the patient you are caring for.
                    </p>
                  </div>
                )}
              </div>
            )}

            {(loginMutation.error || registerMutation.error) && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{(loginMutation.error || registerMutation.error)?.message || "An error occurred"}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {(loginMutation.isPending || registerMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                loginMutation.reset();
                registerMutation.reset();
                setIsLogin(!isLogin);
              }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
