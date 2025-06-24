import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ClientsPage from "./pages/Clients";
import ClientChatPage from "./pages/ClientChat";
import { Loader2, Camera } from "lucide-react";

// Auth wrapper for protecting routes
function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setIsAuthenticated(!!data.session?.user);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    }
  }, []);

  if (loading) {
    // Show photographer-themed splash screen
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center space-x-3 mb-4">
          <Camera className="h-12 w-12 text-purple-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-white">reelsstudio</h1>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p className="text-gray-400 mt-4">Loading your photography studio...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      const isAuthRoute = location.pathname === '/auth';
      
      if (!user && !isAuthRoute) {
        navigate('/auth');
      } else if (user && isAuthRoute) {
        navigate('/');
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN') {
        navigate('/');
      } else if (_event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    checkSession();

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center space-x-3 mb-4">
          <Camera className="h-12 w-12 text-purple-400 animate-pulse" />
          <h1 className="text-3xl font-bold text-white">reelsstudio</h1>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <p className="text-gray-400 mt-4">Loading your photography studio...</p>
      </div>
    );
  }

  const isAuthRoute = location.pathname === '/auth';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white min-h-screen">
      {!isAuthRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:jobId" element={<ClientChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default App;
