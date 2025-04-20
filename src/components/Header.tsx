
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { BookOpen, Plus, Menu, X, User, LogOut, LayoutDashboard, Sparkles, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Generate user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    const email = user.email;
    const nameParts = email.split("@")[0].split(".");
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-xl">PragyaAI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className={`text-gray-600 hover:text-purple-600 transition-colors ${location.pathname === '/dashboard' ? 'text-purple-600 font-medium' : ''}`}>
            Dashboard
          </Link>
          <Link to="/explore" className={`text-gray-600 hover:text-purple-600 transition-colors ${location.pathname === '/explore' ? 'text-purple-600 font-medium' : ''}`}>
            Explore
          </Link>
          <Link to="/create">
            <Button variant={location.pathname === '/create' ? "default" : "outline"} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.email}</span>
                    <span className="text-xs text-gray-500 font-normal">
                      {user.user_metadata?.name || "User"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container px-4 py-4 flex flex-col gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
                <LayoutDashboard className="h-5 w-5 text-gray-500" />
                <span>Dashboard</span>
              </Link>
              <Link to="/explore" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
                <Compass className="h-5 w-5 text-gray-500" />
                <span>Explore</span>
              </Link>
              <Link to="/create" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
                <Sparkles className="h-5 w-5 text-gray-500" />
                <span>Create Course</span>
              </Link>
              {user ? (
                <Button onClick={signOut} variant="ghost" className="flex items-center justify-start gap-2">
                  <LogOut className="h-5 w-5 text-gray-500" />
                  <span>Sign Out</span>
                </Button>
              ) : (
                <Link to="/auth">
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
