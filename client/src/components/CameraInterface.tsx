import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FamilyMember } from "@shared/schema";

export default function CameraInterface() {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizedPerson, setRecognizedPerson] = useState<FamilyMember | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const recognizeMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const res = await apiRequest("POST", "/api/recognize", { image: imageBase64 });
      return await res.json() as { person: FamilyMember };
    },
    onSuccess: (data) => {
      setRecognizedPerson(data.person);
    },
    onError: (error) => {
      console.error("Recognition failed:", error);
      setError("Failed to recognize the person. Please try again.");
    }
  });

  const stopMediaTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
      } catch (e) {
        // Fallback for laptops/desktops without environment facing camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn("Video play exception:", e));
      }
      setIsActive(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError(
        err.name === 'NotAllowedError' 
          ? "Camera access denied. Please grant permission."
          : "Unable to access camera. Please ensure your device has a working camera."
      );
      setIsActive(false);
    }
  };

  const handleCameraToggle = () => {
    if (isActive) {
      stopMediaTracks();
      setIsActive(false);
      setRecognizedPerson(null);
      recognizeMutation.reset();
    } else {
      startCamera();
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera frame not ready. Please try again.");
      return;
    }

    // Create a canvas to capture the current video frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg");
    
    recognizeMutation.mutate(base64Image);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
    };
  }, [stopMediaTracks]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Face Recognition
          </CardTitle>
          <p className="text-muted-foreground">
            Point your camera at someone to learn who they are
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Preview Area */}
          <div className="relative bg-muted rounded-xl aspect-video flex items-center justify-center overflow-hidden">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isActive && !recognizedPerson && !recognizeMutation.isPending ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {isActive ? (
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${(recognizeMutation.isPending || recognizedPerson || error) ? 'bg-gradient-to-br from-primary/20 to-chart-2/20 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="text-center space-y-4">
                  {recognizeMutation.isPending ? (
                    <div className="space-y-4 p-8 bg-background/95 rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 border border-primary/20">
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-2 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-lg font-semibold text-primary animate-pulse">Analyzing Face...</p>
                      <p className="text-xs text-muted-foreground">Checking secure database</p>
                    </div>
                  ) : error ? (
                    <div className="space-y-2 p-4 bg-background/90 rounded-lg max-w-sm mx-auto text-destructive">
                      <AlertCircle className="w-8 h-8 mx-auto" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  ) : recognizedPerson ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-chart-2 mx-auto" />
                      <div className="bg-background/90 rounded-lg p-4 backdrop-blur-sm max-w-sm mx-auto shadow-lg">
                        <p className="font-semibold text-lg">{recognizedPerson.name}</p>
                        <p className="text-primary font-medium">{recognizedPerson.relationship}</p>
                        <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                          {recognizedPerson.notes}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 relative z-10">
                {error ? (
                  <>
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                    <p className="text-sm font-medium text-destructive max-w-xs mx-auto">{error}</p>
                  </>
                ) : (
                  <>
                    <CameraOff className="w-16 h-16 text-muted-foreground mx-auto" />
                    <p className="text-lg font-medium text-muted-foreground">Camera Off</p>
                    <p className="text-sm text-muted-foreground">Tap the camera button to start</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={isActive ? "destructive" : "default"}
              size="lg"
              onClick={handleCameraToggle}
              data-testid={isActive ? "button-stop-camera" : "button-start-camera"}
              className="px-8"
            >
              {isActive ? (
                <>
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </>
              )}
            </Button>

            {isActive && !recognizeMutation.isPending && !recognizedPerson && (
              <Button
                size="lg"
                onClick={handleCapture}
                data-testid="button-capture-face"
                className="px-8"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Recognize Person
              </Button>
            )}

            {recognizedPerson && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setRecognizedPerson(null);
                  recognizeMutation.reset();
                }}
                data-testid="button-reset-recognition"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          {recognizedPerson && (
            <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="font-semibold text-chart-2 mb-2">Memory Context</h4>
              <p className="text-sm text-muted-foreground">
                {recognizedPerson.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}