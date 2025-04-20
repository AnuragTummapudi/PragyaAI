
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Code, Video, Sparkles, Share2, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Generated Courses",
      description: "Create comprehensive courses with customizable chapters in seconds using Google's Gemini AI"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Chapter Videos",
      description: "Automatically find relevant videos for each chapter from YouTube"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Code Examples",
      description: "Generate practical code examples for programming-related courses"
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Public Sharing",
      description: "Share your courses with the world or keep them private for personal use"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Custom Content",
      description: "Edit and customize course content, upload banners, and arrange chapters"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Track your progress through courses with completion markers"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-6 flex justify-between items-center"
      >
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-purple-600 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-800 bg-clip-text text-transparent">
            PragyaAI
          </h1>
        </div>
        <div className="flex gap-4">
          <Link to="/explore">
            <Button variant="ghost">Explore</Button>
          </Link>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-violet-800 bg-clip-text text-transparent"
        >
          Create AI-Powered Courses in Minutes
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          Transform your knowledge into structured courses with the help of Google's Gemini AI. Generate complete curriculum, content, and find relevant videos.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button size="lg" className="gap-2" onClick={signInWithGoogle}>
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          <Link to="/explore">
            <Button variant="outline" size="lg">
              Explore Courses
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Powerful Course Creation Tools
        </motion.h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center text-purple-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-700 to-violet-900 text-white rounded-2xl p-8 md:p-16 shadow-xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to create your first course?</h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of creators who are building and sharing knowledge with our AI-powered platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="gap-2 text-purple-900" 
            onClick={signInWithGoogle}
          >
            Start Creating <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-100 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-bold text-gray-700">PragyaAI © 2025</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-purple-600 transition-colors">About</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
