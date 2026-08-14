import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

// Component imports
import HeroSection from "@/components/HeroSection";
import CameraInterface from "@/components/CameraInterface";
import VoiceAssistant from "@/components/VoiceAssistant";
import FamilyProfiles from "@/components/FamilyProfiles";
import CaregiverDashboard from "@/components/CaregiverDashboard";
import SettingsView from "@/components/SettingsView";
import Navigation from "@/components/Navigation";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroSection onNavigate={setCurrentPage} />;
      case 'camera':
        return <CameraInterface />;
      case 'voice':
        return <VoiceAssistant />;
      case 'family':
        return <FamilyProfiles />;
      case 'caregiver':
        if (user.role !== 'caregiver') {
          return (
            <div className="p-8 text-center text-muted-foreground">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Unauthorized</h2>
              <p>You must be a caregiver to access this dashboard.</p>
            </div>
          );
        }
        return <CaregiverDashboard onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HeroSection onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isDarkMode={theme === 'dark'}
        onThemeToggle={toggleTheme}
      />
      
      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        <div className="pt-20 lg:pt-0">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ThemeProvider>
            <MainApp />
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
