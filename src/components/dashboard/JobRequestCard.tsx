import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, User, Loader2, CheckCircle, XCircle, Clock, Check, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { customerRequestService, authService, CustomerRequest, jobService } from "@/lib/supabaseService";
import { toast } from "@/components/ui/use-toast";

type JobRequestWithCustomer = CustomerRequest & {
  customer_name?: string | null;
  customer_photo?: string | null;
};

const JobRequestCard = () => {
  const [requests, setRequests] = useState<JobRequestWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchRequests() {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const data = await customerRequestService.getRequestsForPhotographer(user.id);

      if (!ignore) {
        const requestsWithCustomer = data.map((req: any) => ({
          ...req,
          customer_name: req.profiles?.full_name ?? "Client",
          customer_photo: req.profiles?.profile_photo_url ?? null
        }));
        setRequests(requestsWithCustomer);
        setLoading(false);
      }
    }
    fetchRequests();
    return () => { ignore = true; };
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date not specified";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAccept = async (requestId: string) => {
    const success = await jobService.acceptJob(requestId);
    if (success) {
      toast({ title: "Booking Accepted", description: "This photography session has been added to your schedule." });
      // Here you would typically refetch the job requests to update the list
    } else {
      toast({ variant: "destructive", title: "Error", description: "Could not accept the booking." });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Booking Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="relative z-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Booking Requests
            </CardTitle>
            <CardDescription className="text-orange-200/80">
              {requests.length === 0 
                ? "No new booking requests" 
                : `You have ${requests.length} new booking request${requests.length === 1 ? "" : "s"}`
              }
            </CardDescription>
          </div>
          {requests.length > 0 && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {requests.length} New
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-6">
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full w-fit mx-auto mb-4">
                <Camera className="h-12 w-12 text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No booking requests yet</h3>
              <p className="text-orange-200/70">When clients request photography sessions, they'll appear here.</p>
            </div>
          ) : (
            requests.map((req) => (
              <div 
                key={req.id} 
                className="group/item p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-12 h-12 border-2 border-white/20">
                      <AvatarImage src={req.customer_photo || undefined} alt={req.customer_name || "Client"} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        {req.customer_name?.charAt(0) ?? "C"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{req.customer_name}</h4>
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                          {req.event_type || "Photography Session"}
                        </Badge>
                      </div>
                      
                      {req.event_date && (
                        <div className="flex items-center gap-2 text-sm text-orange-200/80">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(req.event_date)}</span>
                          <span>•</span>
                          <span>{formatTime(req.event_date)}</span>
                        </div>
                      )}
                      
                      {req.details && (
                        <p className="text-sm text-purple-200/80 leading-relaxed">
                          {req.details}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-purple-200/60">
                        <Clock className="h-3 w-3" />
                        <span>Requested {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'recently'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-500/10">
                        Decline
                      </Button>
                      <Button 
                        onClick={() => handleAccept(req.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobRequestCard;

