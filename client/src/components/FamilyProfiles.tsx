import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Heart, 
  Phone, 
  MessageSquare, 
  Calendar, 
  UserPlus, 
  Trash2, 
  AlertCircle, 
  Loader2,
  Camera,
  Upload,
  RefreshCw
} from "lucide-react";
import familyImage from "@assets/generated_images/Three_generation_family_portrait_b5d41c3d.png";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { FamilyMember } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function FamilyProfiles() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  // Form fields for adding new member
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [customRelationship, setCustomRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // Quick Camera state inside dialog
  const [isCameraActive, setIsCameraActive] = useState(false);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const dialogStreamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  const { data: familyMembers = [], isLoading, error } = useQuery<FamilyMember[]>({
    queryKey: ["/api/family"],
  });

  // Add Member Mutation
  const addMemberMutation = useMutation({
    mutationFn: async (newMember: {
      name: string;
      relationship: string;
      phoneNumber?: string;
      notes?: string;
      avatar?: string | null;
    }) => {
      const res = await apiRequest("POST", "/api/family", newMember);
      return await res.json();
    },
    onSuccess: (createdMember: FamilyMember) => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      setSelectedMember(createdMember);
      setIsAddDialogOpen(false);
      resetForm();
      stopDialogCamera();
      toast({
        title: "Member added successfully",
        description: `${createdMember.name} has been added with their face reference.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to add member",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Delete Member Mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/family/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/family"] });
      if (selectedMember?.id === deletedId) {
        const remaining = familyMembers.filter((m) => m.id !== deletedId);
        setSelectedMember(remaining.length > 0 ? remaining[0] : null);
      }
      setMemberToDelete(null);
      toast({
        title: "Member deleted",
        description: "Family member removed successfully.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to delete member",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const stopDialogCamera = () => {
    if (dialogStreamRef.current) {
      dialogStreamRef.current.getTracks().forEach((track) => track.stop());
      dialogStreamRef.current = null;
    }
    if (dialogVideoRef.current) {
      dialogVideoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startDialogCamera = async () => {
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      dialogStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (dialogVideoRef.current) {
          dialogVideoRef.current.srcObject = stream;
          dialogVideoRef.current.play().catch(console.warn);
        }
      }, 100);
    } catch (err: any) {
      toast({
        title: "Camera error",
        description: "Could not access camera for photo capture.",
        variant: "destructive",
      });
    }
  };

  const captureDialogPhoto = () => {
    if (!dialogVideoRef.current) return;
    const video = dialogVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const photoBase64 = canvas.toDataURL("image/jpeg", 0.85);
    setAvatar(photoBase64);
    stopDialogCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setRelationship("");
    setCustomRelationship("");
    setPhoneNumber("");
    setNotes("");
    setAvatar(null);
    stopDialogCamera();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRelationship = relationship === "Other" ? customRelationship : relationship;
    if (!name.trim() || !finalRelationship.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide both a name and a relationship.",
        variant: "destructive",
      });
      return;
    }

    addMemberMutation.mutate({
      name: name.trim(),
      relationship: finalRelationship.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      avatar: avatar || undefined,
    });
  };

  const handleMemberSelect = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center space-y-4 bg-destructive/10 text-destructive p-8 rounded-lg max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load family profiles</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="h-[60vh]">
              <CardContent className="flex items-center justify-center h-full">
                <Skeleton className="h-48 w-64 rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const activeMember = selectedMember || (familyMembers.length > 0 ? familyMembers[0] : null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Family Members List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Family & Friends
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  data-testid="button-add-member"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {familyMembers.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-muted-foreground text-sm">No family members found.</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                    data-testid="button-add-first-member-list"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Member
                  </Button>
                </div>
              ) : (
                familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 flex items-center justify-between gap-3 ${
                      activeMember?.id === member.id ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleMemberSelect(member)}
                    data-testid={`card-family-member-${member.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{member.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.relationship}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberToDelete(member);
                      }}
                      data-testid={`button-delete-member-${member.id}`}
                      title="Delete family member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Member Details Panel */}
        <div className="lg:col-span-2">
          {activeMember ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={activeMember.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {getInitials(activeMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">{activeMember.name}</CardTitle>
                      <p className="text-lg text-muted-foreground">{activeMember.relationship}</p>
                      <div className="flex gap-2 mt-3">
                        {activeMember.phoneNumber && (
                          <Button size="sm" data-testid={`button-call-${activeMember.id}`}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-message-${activeMember.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setMemberToDelete(activeMember)}
                    data-testid="button-delete-active-member"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeMember.lastContact && (
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      Added / Last Contact
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {new Date(activeMember.lastContact).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {activeMember.notes && (
                  <div>
                    <h4 className="font-semibold mb-1 text-foreground">About {activeMember.name}</h4>
                    <p className="text-muted-foreground leading-relaxed text-sm bg-muted/30 p-4 rounded-lg">
                      {activeMember.notes}
                    </p>
                  </div>
                )}

                {activeMember.phoneNumber && (
                  <div>
                    <h4 className="font-semibold mb-1 text-foreground">Contact Information</h4>
                    <p className="text-muted-foreground text-sm">{activeMember.phoneNumber}</p>
                  </div>
                )}

                <div className="bg-primary/10 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-1">Face Recognition Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeMember.avatar 
                      ? `Face reference photo is stored for ${activeMember.name}. The AI camera will recognize their face when scanned.`
                      : `No face reference photo uploaded yet for ${activeMember.name}. Add a face photo so the AI camera can recognize them!`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <img 
                  src={familyImage} 
                  alt="Family photo"
                  className="w-64 h-48 object-cover rounded-lg mx-auto mb-6 shadow-sm"
                  data-testid="img-family-photo"
                />
                <h3 className="text-xl font-semibold mb-2">Your Family & Friends</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Add your family members or friends with face reference photos to recognize faces and keep memories close.
                </p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  data-testid="button-add-first-member"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Add Family Member or Friend
              </DialogTitle>
              <DialogDescription>
                Register person details and reference face photo for AI Face Recognition.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-member-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={relationship}
                  onValueChange={(val) => setRelationship(val)}
                >
                  <SelectTrigger data-testid="select-relationship-trigger">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Son">Son</SelectItem>
                    <SelectItem value="Daughter">Daughter</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Caregiver">Caregiver</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Brother">Brother</SelectItem>
                    <SelectItem value="Sister">Sister</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Grandchild">Grandchild</SelectItem>
                    <SelectItem value="Other">Other...</SelectItem>
                  </SelectContent>
                </Select>

                {relationship === "Other" && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom relationship (e.g. Neighbor, Cousin)"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    required
                    data-testid="input-custom-relationship"
                  />
                )}
              </div>

              {/* Reference Face Photo Section */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-base font-semibold">Face Reference Photo for AI Recognition</Label>
                <p className="text-xs text-muted-foreground">
                  Provide a face photo so the AI can recognize this person on camera.
                </p>

                {/* Avatar Preview */}
                {avatar && (
                  <div className="relative w-28 h-28 mx-auto my-2 rounded-full overflow-hidden border-2 border-primary">
                    <img src={avatar} alt="Face reference" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                      onClick={() => setAvatar(null)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {/* Camera Live Snapshot Box */}
                {isCameraActive && (
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video my-2">
                    <video ref={dialogVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                      <Button type="button" size="sm" onClick={captureDialogPhoto}>
                        <Camera className="w-4 h-4 mr-1" /> Snap Photo
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={stopDialogCamera}>
                        Cancel Camera
                      </Button>
                    </div>
                  </div>
                )}

                {!avatar && !isCameraActive && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={startDialogCamera}
                    >
                      <Camera className="w-4 h-4 mr-2 text-primary" />
                      Take Photo with Camera
                    </Button>
                    <Label
                      htmlFor="face-upload"
                      className="flex-1 border rounded-md px-3 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-muted font-medium text-center"
                    >
                      <Upload className="w-4 h-4 text-primary" />
                      Upload Image
                    </Label>
                    <input
                      id="face-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-member-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes & Memories (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Visits on Sunday afternoons. Likes gardening and tea."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="textarea-member-notes"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addMemberMutation.isPending}
                data-testid="button-save-member"
              >
                {addMemberMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Member"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => {
          if (!open) setMemberToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong className="text-foreground">{memberToDelete?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToDelete) {
                  deleteMemberMutation.mutate(memberToDelete.id);
                }
              }}
              data-testid="button-confirm-delete"
            >
              {deleteMemberMutation.isPending ? "Deleting..." : "Delete Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}