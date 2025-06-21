import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, ShieldCheck, Clock, Camera, MapPin, Loader2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { profileService, authService, Profile } from "@/lib/supabaseService";

const ProfileCard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const data = await profileService.getProfile(user.id);

      if (!ignore) {
        setProfile(data);
        setLoading(false);
      }
    }
    
    fetchProfile();
    return () => { ignore = true; };
  }, []);

  if (loading) {
    return (
      <Card className="glass-card border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photographer Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-4 animate-pulse" />
            <div className="h-6 w-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 mb-2 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 mb-2 rounded animate-pulse" />
            <div className="h-3 w-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="glass-card border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photographer Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
              <Camera className="h-12 w-12 text-purple-300" />
            </div>
            <p className="text-purple-200/80">No profile data found.</p>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
              asChild
            >
              <a href="/onboarding">
                <Edit className="mr-2 h-4 w-4" />
                Setup Profile
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getKycBadge = () => {
    if (profile.kyc_status === "verified") {
      return (
        <Badge className="ml-auto flex items-center gap-1 px-3 py-1 text-xs bg-green-500/20 text-green-300 border-green-500/30">
          <Award className="h-3 w-3" />
          Verified Pro
        </Badge>
      );
    } else if (profile.kyc_status === "pending") {
      return (
        <Badge className="ml-auto flex items-center gap-1 px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="relative z-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
        <div className="flex items-center">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photographer Profile
          </CardTitle>
          {getKycBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-6">
        <div className="flex flex-col items-center text-center">
          {/* Profile Avatar */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <Avatar className="w-24 h-24 border-4 border-white/20 relative z-10 group-hover:scale-105 transition-transform duration-300">
              <AvatarImage src={profile.profile_photo_url || undefined} alt={profile.full_name || "Photographer"} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                {profile.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "PH"}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Profile Info */}
          <div className="space-y-3 w-full">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              {profile.full_name || "Professional Photographer"}
            </h3>
            
            {profile.location && (
              <div className="flex items-center justify-center gap-2 text-purple-200/80">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.bio && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-purple-200/90 leading-relaxed">{profile.bio}</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm" 
              asChild
            >
              <a href="/onboarding">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
