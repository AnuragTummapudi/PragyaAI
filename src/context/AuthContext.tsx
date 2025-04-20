import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
// import { useGoogleLogin } from "@react-oauth/google";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const signInWithGoogle = () => {
    // Create a dummy user
    const dummyUser: User = {
      id: 'dummy-user-id',
      email: 'dummy@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {
        name: 'Dummy User',
        avatar_url: 'https://ui-avatars.com/api/?name=Dummy+User'
      },
      aud: 'authenticated',
      role: 'authenticated'
    };

    // Create a dummy session
    const dummySession: Session = {
      access_token: 'dummy-access-token',
      refresh_token: 'dummy-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: dummyUser,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };

    setUser(dummyUser);
    setSession(dummySession);
    toast.success("Signed in successfully");
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("An error occurred during sign out");
      console.error("Error during sign-out:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success("Signed in successfully");
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
