import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { availabilityService, authService } from "@/lib/supabaseService";
import { toast } from "@/hooks/use-toast";

interface AvailabilityStatus {
  isAvailable: boolean;
  lastUpdated: string;
  userId: string;
}

const AvailabilityToggle = () => {
  const [availability, setAvailability] = useState<AvailabilityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeAvailability = async () => {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        setUserId(user.id);
        const status = await availabilityService.getAvailability(user.id);
        setAvailability(status);
      }
      setLoading(false);
    };

    initializeAvailability();
  }, []);

  const handleAvailabilityToggle = async (isAvailable: boolean) => {
    if (!userId) return;
    
    setUpdating(true);
    try {
      const success = await availabilityService.updateAvailability(userId, isAvailable);
      if (success) {
        setAvailability(prev => prev ? { ...prev, isAvailable, lastUpdated: new Date().toISOString() } : null);
        toast({
          title: isAvailable ? "Available for Jobs" : "Unavailable",
          description: isAvailable 
            ? "You're now visible to clients." 
            : "You're hidden from searches.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "Failed to update availability status.",
        });
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!availability) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
        <Switch 
          id="availability-toggle-header" 
          checked={availability?.isAvailable || false}
          onCheckedChange={handleAvailabilityToggle}
          disabled={updating}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
        />
        <Badge 
          variant={availability.isAvailable ? "default" : "destructive"}
          className={`flex items-center gap-1 px-3 py-1 text-xs transition-colors duration-300 ${
            availability.isAvailable 
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}
        >
          {availability.isAvailable ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {availability.isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
    </div>
  );
};

export default AvailabilityToggle; 