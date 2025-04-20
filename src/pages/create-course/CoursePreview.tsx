
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GeneratedCourse } from './types';

interface CoursePreviewProps {
  course: GeneratedCourse;
  isLoading: boolean;
  onSave: () => Promise<void>;
  onEdit: () => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({ 
  course, 
  isLoading, 
  onSave, 
  onEdit 
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">{course.title}</h2>
        <p className="text-gray-600 mt-2">{course.description}</p>
      </div>
      
      {course.modules.map((module, moduleIndex) => (
        <div key={moduleIndex} className="space-y-4">
          <h3 className="text-xl font-medium">{module.title}</h3>
          <p className="text-gray-600">{module.description}</p>
          
          <div className="space-y-3">
            {module.chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="border rounded-lg p-4">
                <h4 className="font-medium">Chapter {chapterIndex + 1}: {chapter.title}</h4>
                
                {chapter.video_id ? (
                  <div className="mt-3 space-y-2">
                    <div className="text-green-600 text-sm flex items-center">
                      <span className="mr-2">●</span> 
                      YouTube video found
                    </div>
                    <div className="aspect-video w-full max-w-md mt-2">
                      <iframe 
                        className="w-full h-full rounded"
                        src={`https://www.youtube.com/embed/${chapter.video_id}`}
                        title={`Video for ${chapter.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ) : (
                  <div className="text-orange-500 text-sm flex items-center mt-2">
                    <span className="mr-2">○</span> 
                    No video available
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onEdit} disabled={isLoading}>
          Edit Details
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Course"
          )}
        </Button>
      </div>
    </div>
  );
};
