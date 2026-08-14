import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Heart, Users, MessageCircle, Shield } from "lucide-react";
import heroImage from "@assets/generated_images/Elderly_person_using_tablet_confidently_59108935.png";
import PatientRemindersCard from "./PatientRemindersCard";

interface HeroSectionProps {
  onNavigate?: (page: string) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Your Personal
                <span className="text-primary block">Memory Mirror</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AI-powered support that helps you remember faces, conversations, and daily activities with gentle, caring assistance.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                data-testid="button-start-memory-mirror"
                onClick={() => onNavigate ? onNavigate('family') : undefined}
              >
                <Heart className="w-5 h-5 mr-2" />
                Start Memory Mirror
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                data-testid="button-caregiver-access"
                onClick={() => onNavigate ? onNavigate('caregiver') : undefined}
              >
                <Shield className="w-5 h-5 mr-2" />
                Caregiver Access
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Person comfortably using Memory Mirror on tablet"
              className="rounded-2xl shadow-lg w-full h-auto"
              data-testid="img-hero"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Always here to help</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Reminders & Care Plan Section */}
        <div className="mb-16">
          <PatientRemindersCard />
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="p-6 text-center hover-elevate cursor-pointer transition-shadow"
            onClick={() => onNavigate ? onNavigate('camera') : undefined}
          >
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Face Recognition</h3>
            <p className="text-muted-foreground text-sm">
              Instantly recognize family and friends with gentle reminders about your relationships
            </p>
          </Card>

          <Card 
            className="p-6 text-center hover-elevate cursor-pointer transition-shadow"
            onClick={() => onNavigate ? onNavigate('voice') : undefined}
          >
            <div className="bg-chart-2/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-chart-2" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Memory Assistant</h3>
            <p className="text-muted-foreground text-sm">
              Ask questions about recent events, conversations, and daily activities
            </p>
          </Card>

          <Card 
            className="p-6 text-center hover-elevate cursor-pointer transition-shadow"
            onClick={() => onNavigate ? onNavigate('family') : undefined}
          >
            <div className="bg-chart-3/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-chart-3" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Family Connection</h3>
            <p className="text-muted-foreground text-sm">
              Keep your loved ones close with photos, stories, and shared memories
            </p>
          </Card>

          <Card 
            className="p-6 text-center hover-elevate cursor-pointer transition-shadow"
            onClick={() => onNavigate ? onNavigate('caregiver') : undefined}
          >
            <div className="bg-chart-4/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-chart-4" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Gentle Guidance</h3>
            <p className="text-muted-foreground text-sm">
              Compassionate support and alerts to help you stay safe and confident
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}