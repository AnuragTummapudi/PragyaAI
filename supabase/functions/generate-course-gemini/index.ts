import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    console.error("Gemini API Key not configured");
    return new Response(
      JSON.stringify({ error: "Gemini API Key not configured" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    const { title, description, category, difficulty, duration, chapters } = await req.json();

    // Create a detailed prompt for Gemini
    const prompt = `
      Generate a comprehensive educational course about "${title}". 
      Category: ${category || 'General'}
      Difficulty level: ${difficulty || 'Beginner'} 
      Estimated duration: ${duration || 'Medium'}
      
      Please structure your response as a valid JSON object with the following format:
      {
        "title": "Complete Course Title",
        "description": "Comprehensive course description",
        "modules": [
          {
            "title": "Module Title",
            "description": "Module description",
            "chapters": [
              {
                "title": "Chapter Title",
                "content": "# Chapter Title\\n\\n## Introduction\\nContent here\\n\\n## Key Learning Points\\n- Point 1\\n- Point 2\\n\\n## Code Example (if applicable)\\n```\\ncode here\\n```\\n\\n## Summary\\nSummary content here",
                "detailed_notes": "# Detailed Notes for Chapter Title\\n\\n## Overview\\nComprehensive overview of the chapter topic\\n\\n## Key Concepts\\n- Detailed explanation of concept 1\\n- Detailed explanation of concept 2\\n\\n## Examples\\nDetailed examples with explanations\\n\\n## Common Pitfalls\\n- Pitfall 1 and how to avoid it\\n- Pitfall 2 and how to avoid it\\n\\n## Further Reading\\n- Resource 1\\n- Resource 2\\n\\n## Practice Questions\\n1. Question 1\\n2. Question 2",
                "order_index": 0
              }
            ]
          }
        ]
      }
      
      Generate exactly ${chapters || 5} chapters.
      For programming topics, include relevant code examples in the chapter content.
      Format chapter content using markdown with proper sections and code blocks if applicable.
      Make the content educational, detailed, and focused on teaching the topic thoroughly.
      
      For each chapter, also generate detailed notes that include:
      - A comprehensive overview of the topic
      - In-depth explanations of key concepts
      - Detailed examples with step-by-step explanations
      - Common pitfalls and how to avoid them
      - Further reading resources
      - Practice questions to reinforce learning
      
      The detailed notes should be thorough and provide additional value beyond the main chapter content.
    `;

    // Make request to Gemini API
    const genAIResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "contents": [
          {
            "parts": [
              {
                "text": prompt
              }
            ]
          }
        ],
        "generationConfig": {
          "temperature": 0.7,
          "maxOutputTokens": 8192
        }
      })
    });
    
    const genAIData = await genAIResponse.json();
    
    if (!genAIResponse.ok) {
      console.error("Gemini API error:", genAIData);
      throw new Error(`Gemini API error: ${genAIData.error?.message || 'Unknown error'}`);
    }

    let courseData;
    try {
      // Extract the JSON from the Gemini response
      const textResponse = genAIData.candidates[0]?.content?.parts[0]?.text;
      // Find JSON between code fences if present, or use the whole text
      const jsonMatch = textResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, textResponse];
      const jsonContent = jsonMatch[1].trim();
      
      courseData = JSON.parse(jsonContent);
      
      // Validate the parsed data has the expected structure
      if (!courseData.title || !courseData.description || !courseData.modules) {
        throw new Error("Generated content is missing required fields");
      }
      
      // Ensure content is properly formatted
      courseData.modules.forEach(module => {
        if (module.chapters) {
          module.chapters.forEach(chapter => {
            if (!chapter.content) {
              chapter.content = `# ${chapter.title}\n\nContent for this chapter will be available soon.`;
            }
            
            // Ensure detailed_notes exist
            if (!chapter.detailed_notes) {
              chapter.detailed_notes = `# Detailed Notes for ${chapter.title}\n\nDetailed notes for this chapter will be available soon.`;
            }
          });
        }
      });
      
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      throw new Error("Failed to parse course content from AI response");
    }

    return new Response(JSON.stringify(courseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-course-gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
