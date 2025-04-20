
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, BarChart, BookOpen, Share2 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface Chapter {
  id: string;
  title: string;
  content: string | null;
  video_id: string | null;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  chapters: Chapter[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  difficulty: string;
  duration: string;
  language: string;
  created_at: string;
  modules: Module[];
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;
        
        // Fetch modules for this course
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
        
        if (modulesError) throw modulesError;
        
        // For each module, fetch its chapters
        const modulesWithChapters = await Promise.all(
          modulesData.map(async (module) => {
            const { data: chaptersData, error: chaptersError } = await supabase
              .from('chapters')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index', { ascending: true });
            
            if (chaptersError) throw chaptersError;
            
            return {
              ...module,
              chapters: chaptersData || []
            };
          })
        );
        
        setCourse({
          ...courseData,
          modules: modulesWithChapters
        });
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Course not found</h1>
          <p>We couldn't find the course you're looking for.</p>
          <Link to="/dashboard">
            <Button className="mt-4">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {/* Course Hero */}
        <div 
          className="bg-gradient-to-r from-purple-600 to-violet-800 text-white py-16"
          style={course.banner_url ? { 
            backgroundImage: `linear-gradient(rgba(91, 33, 182, 0.8), rgba(124, 58, 237, 0.8)), url(${course.banner_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg opacity-90 mb-6">{course.description || "No description available"}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <BarChart className="h-4 w-4" />
                  <span>{course.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Course Content</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
          
          <div className="space-y-6">
            {course.modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {module.chapters.map((chapter) => (
                      <li key={chapter.id} className="py-3">
                        <Link 
                          to={`/course/${courseId}/chapter/${chapter.id}`}
                          className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
                        >
                          <div>
                            <h3 className="font-medium">{chapter.title}</h3>
                            <p className="text-sm text-gray-500">
                              {chapter.video_id ? "Includes video" : "Text content only"}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                      </li>
                    ))}
                    {module.chapters.length === 0 && (
                      <li className="py-3 text-center text-gray-500">
                        No chapters available for this module
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
            
            {course.modules.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">No modules found</h3>
                <p className="text-gray-500">This course doesn't have any content yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Course;
