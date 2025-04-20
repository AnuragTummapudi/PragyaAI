import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Course {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  difficulty: string;
  duration: string;
  created_at: string;
  user_id: string;
}

const ExplorePage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let query = supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setDeletingCourseId(courseId);
      
      // First check if the course belongs to the current user
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        toast.error("Course not found");
        return;
      }

      if (course.user_id !== user?.id) {
        toast.error("You can only delete your own courses");
        return;
      }

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      // Remove the course from the local state
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error("Failed to delete course");
    } finally {
      setDeletingCourseId(null);
      setCourseToDelete(null);
    }
  };

  // Filter courses based on search term and difficulty
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'all' || !filterDifficulty ? true : course.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <h1 className="text-3xl font-bold">Explore Courses</h1>
          
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search courses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-400 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Discovering amazing courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterDifficulty !== 'all'
                ? "Try adjusting your search or filters" 
                : "Be the first to create and share a course!"}
            </p>
            <Link to="/create">
              <Button>Create a Course</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {filteredCourses.map((course) => (
                <motion.div key={course.id} variants={itemVariants} layout>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow relative">
                    <div className="h-40 bg-gradient-to-r from-purple-300 to-purple-400 relative">
                      {course.banner_url ? (
                        <img 
                          src={course.banner_url} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-12 w-12 text-white/70" />
                        </div>
                      )}
                      
                      {/* Delete button - only visible for course owner */}
                      {user && course.user_id === user.id && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-600/90"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent navigation
                            e.stopPropagation(); // Prevent event bubbling
                            setCourseToDelete(course);
                          }}
                          disabled={deletingCourseId === course.id}
                        >
                          {deletingCourseId === course.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <Link to={`/course/${course.id}`} className="block h-full">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={`
                              bg-opacity-10 text-xs px-2 py-1
                              ${course.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' : 
                                course.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                'bg-purple-100 text-purple-800 border-purple-200'}
                            `}
                          >
                            {course.difficulty}
                          </Badge>
                          <span className="text-gray-500 text-xs">
                            {course.duration}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-2">{course.description || "No description"}</p>
                      </CardContent>
                      <CardFooter className="text-xs text-gray-500">
                        Created on {new Date(course.created_at).toLocaleDateString()}
                      </CardFooter>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              "{courseToDelete?.title}" and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => courseToDelete && handleDeleteCourse(courseToDelete.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExplorePage;
