import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { CourseGenerationStep } from "./create-course/CourseGenerationStep";
import { formSchema, type FormValues } from "./create-course/schema";
import type { GeneratedCourse } from "./create-course/types";

const CreateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [generationStep, setGenerationStep] = useState<'form' | 'generating' | 'review'>('form');
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      } else {
        // For demo purposes, use a dummy user id if not authenticated
        setUserId('00000000-0000-0000-0000-000000000000');
      }
    };

    checkAuth();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty: "beginner",
      duration: "short",
      chapters: 5,
      includeVideos: true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setGenerationStep('generating');
    
    try {
      const { data: generatedData, error: generationError } = await supabase.functions.invoke('generate-course', {
        body: {
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          duration: data.duration,
          chapters: data.chapters
        },
      });
      
      if (generationError) throw new Error(generationError.message);
      
      if (data.includeVideos && generatedData.modules && generatedData.modules[0]?.chapters) {
        const updatedModules = [...generatedData.modules];
        const chaptersToProcess = updatedModules[0].chapters.slice(0, 3);
        
        for (const chapter of chaptersToProcess) {
          try {
            const { data: videoData, error: videoError } = await supabase.functions.invoke('search-youtube', {
              body: {
                query: `${data.title} ${chapter.title} tutorial`,
              },
            });
            
            if (!videoError && videoData.videos && videoData.videos.length > 0) {
              chapter.video_id = videoData.videos[0].id;
              console.log(`Found video for ${chapter.title}: ${chapter.video_id}`);
            } else if (videoError) {
              console.error('Error finding videos:', videoError);
            }
          } catch (videoError) {
            console.error('Error finding videos:', videoError);
          }
        }
        
        generatedData.modules = updatedModules;
      }
      
      setGeneratedCourse(generatedData);
      setGenerationStep('review');
      toast.success("Course generated successfully!");
    } catch (error) {
      console.error("Error generating course:", error);
      toast.error("Failed to generate course. Please try again.");
      setGenerationStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!generatedCourse || !userId) return;
    
    setIsLoading(true);
    try {
      // First create the course record
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: generatedCourse.title,
          description: generatedCourse.description || null,
          difficulty: form.getValues('difficulty'),
          duration: form.getValues('duration'),
          language: 'English',
          user_id: userId,
        })
        .select('id')
        .single();

      if (courseError) {
        console.error("Course insert error:", courseError);
        throw new Error(`Failed to create course: ${courseError.message}`);
      }
      
      if (!courseData || !courseData.id) {
        throw new Error("No course ID returned after creation");
      }
      
      if (generatedCourse.modules.length > 0) {
        const module = generatedCourse.modules[0];
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: courseData.id,
            title: module.title,
            description: module.description,
            order_index: 0
          })
          .select('id')
          .single();
          
        if (moduleError) {
          console.error("Module insert error:", moduleError);
          throw new Error(`Failed to create module: ${moduleError.message}`);
        }
        
        if (moduleData && moduleData.id && module.chapters.length > 0) {
          const chapterInserts = module.chapters.map((chapter, index) => ({
            module_id: moduleData.id,
            title: chapter.title,
            content: chapter.content,
            detailed_notes: chapter.detailed_notes || '',
            order_index: index,
            video_id: chapter.video_id || null
          }));
          
          const { error: chaptersError } = await supabase
            .from('chapters')
            .insert(chapterInserts);
            
          if (chaptersError) {
            console.error("Chapters insert error:", chaptersError);
            throw new Error(`Failed to create chapters: ${chaptersError.message}`);
          }
        }
        
        toast.success("Course saved successfully!");
        navigate(`/course/${courseData.id}`);
      }
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast.error(`Failed to save course: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create a New Course</h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              {generationStep === 'form' 
                ? "Fill in the basic information about your course, and our AI will help generate the content."
                : generationStep === 'generating'
                  ? "Our AI is creating your course content..."
                  : "Review your generated course before saving"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseGenerationStep
              step={generationStep}
              isLoading={isLoading}
              generatedCourse={generatedCourse}
              onSubmit={onSubmit}
              onSave={handleSaveCourse}
              onEdit={() => setGenerationStep('form')}
              form={form}
            />
          </CardContent>
          <CardFooter className="text-sm text-gray-500 flex justify-center">
            {generationStep === 'form' && "Our AI will generate a structured course based on your specifications"}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default CreateCourse;
