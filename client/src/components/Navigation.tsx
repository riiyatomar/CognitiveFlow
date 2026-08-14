import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Camera, 
  Users, 
  MessageCircle, 
  Shield, 
  Settings, 
  Moon, 
  Sun,
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Navigation({ 
  currentPage, 
  onPageChange, 
  isDarkMode, 
  onThemeToggle 
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'camera', label: 'Face Recognition', icon: Camera },
    { id: 'voice', label: 'Voice Assistant', icon: MessageCircle },
    { id: 'family', label: 'Family & Friends', icon: Users },
    { id: 'caregiver', label: 'Caregiver View', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block fixed top-6 left-6 w-72 h-[calc(100vh-3rem)] z-50">
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">Memory Mirror</h1>
            <p className="text-sm text-muted-foreground">AI Cognitive Aid</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start text-lg py-6"
                  onClick={() => handlePageChange(item.id)}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                  {item.id === 'caregiver' && (
                    <Badge variant="secondary" className="ml-auto">
                      Pro
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="mt-auto pt-6 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-lg py-6"
              onClick={onThemeToggle}
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-5 h-5 mr-3" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 mr-3" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <Card className="fixed top-0 left-0 right-0 z-50 rounded-none border-x-0 border-t-0">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-xl font-bold text-primary">Memory Mirror</h1>
              <p className="text-sm text-muted-foreground">AI Cognitive Aid</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </Card>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <Card className="absolute top-0 right-0 w-80 h-full rounded-none border-r-0 border-t-0 border-b-0">
              <div className="p-6 h-full flex flex-col">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold">Navigation</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="button-close-mobile-menu"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start text-lg py-6"
                        onClick={() => handlePageChange(item.id)}
                        data-testid={`nav-mobile-${item.id}`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                        {item.id === 'caregiver' && (
                          <Badge variant="secondary" className="ml-auto">
                            Pro
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </nav>

                {/* Theme Toggle */}
                <div className="mt-auto pt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-lg py-6"
                    onClick={onThemeToggle}
                    data-testid="button-mobile-theme-toggle"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-5 h-5 mr-3" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5 mr-3" />
                        Dark Mode
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}