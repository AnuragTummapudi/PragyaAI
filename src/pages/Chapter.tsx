import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Chapter {
  id: string;
  title: string;
  content: string | null;
  detailed_notes: string | null;
  video_id: string | null;
  order_index: number;
  module_id: string;
}

interface Course {
  id: string;
  title: string;
}

const Chapter = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        // Fetch current chapter
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single();
        
        if (chapterError) throw chapterError;
        
        setChapter(chapterData);
        
        // Fetch course info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;
        
        setCourse(courseData);
        
        // Fetch adjacent chapters for navigation
        if (chapterData) {
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('id, order_index')
            .eq('module_id', chapterData.module_id)
            .order('order_index', { ascending: true });
          
          if (chaptersError) throw chaptersError;
          
          const currentIndex = chaptersData.findIndex(ch => ch.id === chapterId);
          
          if (currentIndex > 0) {
            setPrevChapterId(chaptersData[currentIndex - 1].id);
          }
          
          if (currentIndex < chaptersData.length - 1) {
            setNextChapterId(chaptersData[currentIndex + 1].id);
          }
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && chapterId) {
      fetchChapter();
    }
  }, [courseId, chapterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Chapter not found</h1>
          <p>We couldn't find the chapter you're looking for.</p>
          <Link to={`/course/${courseId}`}>
            <Button className="mt-4">Return to Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/course/${courseId}`} className="text-purple-600 hover:text-purple-700 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to {course.title}
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">{chapter.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {chapter.video_id && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${chapter.video_id}`}
                      title={chapter.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Chapter Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Detailed Notes
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="mt-4">
                    {chapter.content ? (
                      <div className="prose max-w-none">
                        {/* We're rendering the content as plain text for now, 
                            but in a real application you would use a markdown renderer */}
                        {chapter.content.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No content available for this chapter.</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="notes" className="mt-4">
                    {chapter.detailed_notes ? (
                      <div className="prose max-w-none">
                        {/* We're rendering the notes as plain text for now, 
                            but in a real application you would use a markdown renderer */}
                        {chapter.detailed_notes.split("\n").map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No detailed notes available for this chapter.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Navigation sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prevChapterId && (
                  <Link to={`/course/${courseId}/chapter/${prevChapterId}`}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <ArrowLeft className="h-4 w-4" /> Previous Chapter
                    </Button>
                  </Link>
                )}
                
                {nextChapterId && (
                  <Link to={`/course/${courseId}/chapter/${nextChapterId}`}>
                    <Button className="w-full justify-end gap-2">
                      Next Chapter <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                
                <div className="pt-4 border-t">
                  <Link to={`/course/${courseId}`}>
                    <Button variant="link" className="w-full">View All Chapters</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chapter;
