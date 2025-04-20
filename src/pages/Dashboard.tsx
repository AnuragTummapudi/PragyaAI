
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  difficulty: string;
  duration: string;
  created_at: string;
}

const Dashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Courses</h1>
          <Link to="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create New Course
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-gray-500">Courses created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Latest Course</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses[0]?.title || "No courses yet"}</div>
              <p className="text-xs text-gray-500">
                {courses[0] ? new Date(courses[0].created_at).toLocaleDateString() : "Create your first course"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Most Common Difficulty</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.length > 0 
                  ? Object.entries(
                      courses.reduce((acc, course) => {
                        acc[course.difficulty] = (acc[course.difficulty] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"}
              </div>
              <p className="text-xs text-gray-500">Difficulty level</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">No courses found</h3>
            <p className="text-gray-500 mb-6">Start by creating your first course</p>
            <Link to="/create">
              <Button>Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link to={`/course/${course.id}`} key={course.id}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-r from-purple-300 to-purple-400 relative">
                    {course.banner_url && (
                      <img 
                        src={course.banner_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {course.difficulty}
                      </span>
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
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
