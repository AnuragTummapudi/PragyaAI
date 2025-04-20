
import React from 'react';
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedCourse } from './types';
import { CourseForm } from './CourseForm';
import { CoursePreview } from './CoursePreview';

interface CourseGenerationStepProps {
  step: 'form' | 'generating' | 'review';
  isLoading: boolean;
  generatedCourse: GeneratedCourse | null;
  onSubmit: (data: any) => Promise<void>;
  onSave: () => Promise<void>;
  onEdit: () => void;
  form: any;
}

export const CourseGenerationStep: React.FC<CourseGenerationStepProps> = ({
  step,
  isLoading,
  generatedCourse,
  onSubmit,
  onSave,
  onEdit,
  form
}) => {
  if (step === 'generating') {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <h3 className="text-xl font-semibold text-center">Generating Your Course</h3>
        <p className="text-gray-500 text-center max-w-md">
          Our AI is creating your course content and finding relevant videos. This may take a few moments...
        </p>
      </div>
    );
  }

  if (step === 'review' && generatedCourse) {
    return <CoursePreview course={generatedCourse} isLoading={isLoading} onSave={onSave} onEdit={onEdit} />;
  }

  return <CourseForm form={form} onSubmit={onSubmit} isLoading={isLoading} />;
};
