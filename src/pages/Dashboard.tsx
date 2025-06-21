import ProfileCard from "@/components/dashboard/ProfileCard";
import EarningsCard from "@/components/dashboard/EarningsCard";
import JobRequestCard from "@/components/dashboard/JobRequestCard";
import ReviewsCard from "@/components/dashboard/ReviewsCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse"></div>
      </div>
      
      <div className="relative z-10 flex">
        {/* Left Sidebar - Profile Card */}
        <aside className="fixed top-20 left-0 w-80 h-full p-4 sm:p-6 lg:p-8">
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <ProfileCard />
          </div>
        </aside>
        
        <main className="flex-1 ml-80 p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
              Welcome Back!
            </h1>
            <p className="text-purple-200/80 text-lg max-w-2xl mx-auto">
              Manage your photography business, showcase your portfolio, and connect with clients
            </p>
          </div>

          {/* Dashboard Grid - Reorganized Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="xl:col-span-1 space-y-6 lg:space-y-8">
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <JobRequestCard />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                <ReviewsCard />
              </div>
            </div>
            
            {/* Right Sidebar - Availability and Earnings */}
            <div className="xl:col-span-1 space-y-6 lg:space-y-8">
              <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
                <EarningsCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
