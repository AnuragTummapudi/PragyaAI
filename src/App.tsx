import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateCourse from "./pages/CreateCourse";
import Course from "./pages/Course";
import Chapter from "./pages/Chapter";
import AuthPage from "./pages/Auth";
import ExplorePage from "./pages/Explore";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();
// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> */}
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create" element={<CreateCourse />} />
                <Route path="/course/:courseId" element={<Course />} />
                <Route path="/course/:courseId/chapter/:chapterId" element={<Chapter />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    {/* </GoogleOAuthProvider> */}
  </QueryClientProvider>
);

export default App;
