import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User as UserIcon, Loader2 } from "lucide-react";
import { authService, profileService, storageService, ProfileUpdate } from "@/lib/supabaseService";
import { toast } from "@/components/ui/use-toast";

// FileUploadDropzone Component
const FileUploadDropzone = ({
  icon: Icon,
  title,
  subtitle,
  file,
  onFileChange,
  accept,
  htmlFor,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
  htmlFor: string;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileChange(files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e.target.files?.[0] || null);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        isDragOver
          ? 'border-purple-400 bg-purple-500/20 scale-105'
          : 'border-purple-300/50 bg-white/5 hover:border-purple-300 hover:bg-white/10'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
          <Icon className="h-12 w-12 text-purple-300" />
        </div>
        <div>
          <Label
            htmlFor={htmlFor}
            className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
          >
            <span className="text-purple-300 hover:text-purple-100 transition-colors">Upload a file</span>
            <Input
              id={htmlFor}
              name={htmlFor}
              type="file"
              accept={accept}
              className="sr-only"
              onChange={handleFileChange}
            />
          </Label>
          <p className="pl-1 text-purple-200/70 inline">or drag and drop</p>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {file ? file.name : subtitle}
        </p>
      </div>
    </div>
  );
};

const Onboarding = () => {
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [kycDoc, setKycDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndFetchProfile = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const profile = await profileService.getProfile(user.id);
      if (profile) {
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
      }
      setPageLoading(false);
    }
    checkSessionAndFetchProfile();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("You must be signed in.");

      let profilePhotoUrl: string | null = null;
      if (profilePhoto) {
        profilePhotoUrl = await storageService.uploadProfilePhoto(user.id, profilePhoto);
        if (!profilePhotoUrl) throw new Error("Photo upload failed");
      }

      let kycDocUrl: string | null = null;
      if (kycDoc) {
        kycDocUrl = await storageService.uploadKycDocument(user.id, kycDoc);
        if (!kycDocUrl) throw new Error("KYC doc upload failed");
      }

      const profileUpdateData: ProfileUpdate = {
        full_name: fullName,
        bio,
        location,
        onboarded: true,
      };

      if (profilePhotoUrl) {
        profileUpdateData.profile_photo_url = profilePhotoUrl;
      }
      
      if (kycDocUrl) {
        profileUpdateData.kyc_doc_url = kycDocUrl;
        profileUpdateData.kyc_status = "pending";
      }

      const updatedProfile = await profileService.updateProfile(user.id, profileUpdateData);
      
      if (!updatedProfile) throw new Error("Failed to update profile.");

      toast({
        title: "Profile updated 🎉",
        description: "Your profile has been successfully updated!",
      });

      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card border-0 shadow-xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-white/10">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Update Your Profile
            </CardTitle>
            <CardDescription className="text-purple-200/80 mt-2">
              Keep your information up to date. This will be visible to potential clients.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-purple-200">Full Name</Label>
                  <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Jane Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-purple-200">Location</Label>
                  <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" required className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-purple-200">Bio</Label>
                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your passion for photography..." rows={4} required className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-purple-200">Profile Photo</Label>
                  <FileUploadDropzone 
                    icon={UserIcon}
                    title="Upload a Profile Photo"
                    subtitle="PNG, JPG, GIF up to 10MB"
                    file={profilePhoto}
                    onFileChange={setProfilePhoto}
                    accept="image/*"
                    htmlFor="photo-upload"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">KYC Document (Government ID)</Label>
                  <p className="text-xs text-muted-foreground mb-2">For verification purposes only. This will not be shared publicly.</p>
                  <FileUploadDropzone
                    icon={FileText}
                    title="Upload KYC Document"
                    subtitle="PNG, JPG, PDF up to 10MB"
                    file={kycDoc}
                    onFileChange={setKycDoc}
                    accept=".jpg,.jpeg,.png,.pdf"
                    htmlFor="kyc-upload"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : "Update Profile"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
