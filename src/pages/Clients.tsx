import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobService, authService, CustomerRequest } from "@/lib/supabaseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Users } from "lucide-react";

type JobWithCustomer = CustomerRequest & {
  profiles: {
    full_name: string | null;
    profile_photo_url: string | null;
  } | null;
};

const ClientsPage = () => {
  const [jobs, setJobs] = useState<JobWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        const data = await jobService.getJobs(user.id);
        setJobs(data as JobWithCustomer[]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="h-10 w-10" />
            My Clients
          </h1>
          <p className="text-purple-200/80 mt-2">Manage your active and completed jobs.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 bg-black/20 rounded-2xl border border-purple-500/20">
            <Users className="mx-auto h-16 w-16 text-purple-400/50 mb-4" />
            <h3 className="text-xl font-semibold text-white">No Active Jobs</h3>
            <p className="text-purple-200/80 mt-2">Accepted job requests will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link to={`/clients/${job.id}`} key={job.id} className="group">
                <Card className="glass-card h-full flex flex-col justify-between hover:border-purple-400/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-purple-400/50">
                          <AvatarImage src={job.profiles?.profile_photo_url || ''} />
                          <AvatarFallback className="bg-purple-900/50"><User /></AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                            {job.profiles?.full_name || "Client"}
                          </CardTitle>
                          <p className="text-sm text-purple-300/70">{job.event_type}</p>
                        </div>
                      </div>
                      <Badge className="ml-auto capitalize glass-badge" variant={job.status === 'completed' ? 'secondary' : 'default'}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-purple-200/80">
                      <p>Event Date: {new Date(job.event_date).toLocaleDateString()}</p>
                      <p>Location: {job.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsPage; 