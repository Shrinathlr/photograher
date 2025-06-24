import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { authService } from "@/lib/supabaseService";
import { Menu, LogOut, Home, UserPlus, Users, Camera, Image, Calendar } from "lucide-react";
import AvailabilityToggle from "@/components/dashboard/AvailabilityToggle";
import { NavLink } from "react-router-dom";

const LOGO_URL = "/lovable-uploads/39bfa6f4-5595-4b19-96b4-1acbb4c0f42e.png";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkAuthStatus = async () => {
      const user = await authService.getCurrentUser();
      if (mounted) {
        setIsLoggedIn(!!user);
      }
    };

    checkAuthStatus();

    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsLoggedIn(!!session?.user);
      }
    });

    return () => { 
      mounted = false; 
      subscription.unsubscribe(); 
    };
  }, []);

  const handleSignOut = async () => {
    const success = await authService.signOut();
    if (success) {
      window.location.href = "/auth";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-900/80 shadow-lg">
      <div className="container flex h-20 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-8 flex items-center space-x-2 group">
            <div className="relative">
              <img
                src={LOGO_URL}
                alt="Logo"
                className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ minWidth: 80, maxHeight: 80 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
          <nav className="flex items-center space-x-8 text-sm font-medium">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-purple-200 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <Home className="h-4 w-4" />
              Studio
            </Link>
            <Link 
              to="/onboarding" 
              className="flex items-center gap-2 text-purple-200 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <UserPlus className="h-4 w-4" />
              Profile Setup
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-purple-200 hover:text-white hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-[300px] sm:w-[400px] bg-slate-900/95 backdrop-blur-xl border-r border-white/10"
              >
                <nav className="flex flex-col gap-6 mt-8">
                  <Link to="/" className="flex items-center space-x-2 text-lg font-medium group">
                    <div className="relative">
                      <img
                        src={LOGO_URL}
                        alt="Logo"
                        className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        style={{ minWidth: 64, maxHeight: 64 }}
                      />
                    </div>
                  </Link>
                  <div className="space-y-2">
                    <Link 
                      to="/" 
                      className="flex items-center gap-3 block px-4 py-3 text-lg text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    >
                      <Home className="h-5 w-5" />
                      Studio
                    </Link>
                    <Link 
                      to="/onboarding" 
                      className="flex items-center gap-3 block px-4 py-3 text-lg text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                    >
                      <UserPlus className="h-5 w-5" />
                      Profile Setup
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          
          <nav className="flex items-center gap-4">
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-500/20 text-white"
                    : "text-purple-200/80 hover:bg-purple-500/10 hover:text-white"
                }`
              }
            >
              <Users className="h-5 w-5" />
              Clients
            </NavLink>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 text-purple-200/80">
              <Image className="h-5 w-5" />
              <span className="text-sm font-medium">Portfolio</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 text-purple-200/80">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Bookings</span>
            </div>
            {isLoggedIn && (
              <AvailabilityToggle />
            )}
            {!isLoggedIn ? (
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <a href="/auth">Sign In</a>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

