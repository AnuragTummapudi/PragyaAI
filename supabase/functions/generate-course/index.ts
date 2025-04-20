
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, category, difficulty, duration, chapters } = await req.json();

    // This would normally call an AI model like OpenAI or Google Gemini
    // For now we'll mock the response with realistic course data
    const moduleTitle = `Introduction to ${title}`;
    const courseData = {
      title,
      description: description || `A comprehensive course about ${title}`,
      modules: [
        {
          title: moduleTitle,
          description: `Learn the fundamentals of ${title}`,
          chapters: Array.from({ length: chapters || 5 }, (_, i) => {
            const chapterNum = i + 1;
            return {
              title: chapterNum === 1 ? `Getting Started with ${title}` : 
                     chapterNum === 2 ? `Core Concepts of ${title}` :
                     chapterNum === 3 ? `Advanced ${title} Techniques` :
                     chapterNum === 4 ? `Practical ${title} Applications` :
                     `Mastering ${title}`,
              content: `
# ${chapterNum === 1 ? `Getting Started with ${title}` : 
          chapterNum === 2 ? `Core Concepts of ${title}` :
          chapterNum === 3 ? `Advanced ${title} Techniques` :
          chapterNum === 4 ? `Practical ${title} Applications` :
          `Mastering ${title}`}

## Introduction
This chapter introduces ${chapterNum === 1 ? 'the fundamentals' : 
                          chapterNum === 2 ? 'core concepts' :
                          chapterNum === 3 ? 'advanced techniques' :
                          chapterNum === 4 ? 'practical applications' :
                          'mastery techniques'} of ${title}.

## Key Learning Points
- Understanding ${title} ${chapterNum === 1 ? 'basics' : 
                          chapterNum === 2 ? 'principles' :
                          chapterNum === 3 ? 'advanced methods' :
                          chapterNum === 4 ? 'real-world usage' :
                          'expert strategies'}
- How to apply ${chapterNum === 1 ? 'simple concepts' : 
                chapterNum === 2 ? 'foundational knowledge' :
                chapterNum === 3 ? 'complex techniques' :
                chapterNum === 4 ? 'practical solutions' :
                'advanced strategies'} in ${title}
- ${chapterNum === 1 ? 'Getting started with' : 
   chapterNum === 2 ? 'Building upon' :
   chapterNum === 3 ? 'Mastering' :
   chapterNum === 4 ? 'Implementing' :
   'Leading with'} ${title} in different contexts

## Summary
This chapter has provided ${chapterNum === 1 ? 'a foundation' : 
                           chapterNum === 2 ? 'deeper knowledge' :
                           chapterNum === 3 ? 'advanced understanding' :
                           chapterNum === 4 ? 'practical implementation skills' :
                           'mastery'} of ${title}. Continue to the next chapter to build upon these concepts.
              `,
              order_index: i
            };
          })
        }
      ]
    };

    return new Response(JSON.stringify(courseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-course function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
