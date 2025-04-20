
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API Key not configured");
    return new Response(
      JSON.stringify({ error: "YouTube API Key not configured" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    const { query, category } = await req.json();
    
    // Encode query for URL and improve search relevance
    const searchQuery = `${query} ${category || 'education'} tutorial`;
    const encodedQuery = encodeURIComponent(searchQuery);
    
    console.log(`Searching YouTube for: ${searchQuery}`);
    
    // Call YouTube Data API with specific parameters to improve relevance
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&key=${YOUTUBE_API_KEY}&type=video&maxResults=5&relevanceLanguage=en&videoEmbeddable=true&videoCategoryId=27&safeSearch=moderate`,
      { method: 'GET' }
    );
    
    const data = await youtubeResponse.json();
    
    if (youtubeResponse.status !== 200) {
      console.error(`YouTube API error: ${JSON.stringify(data.error || data)}`);
      throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    // Filter out unwanted videos (like memes or rickrolls) and extract video details
    const filteredVideos = data.items
      .filter(item => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        // Filter out common meme videos or irrelevant content
        return !title.includes("rick astley") && 
               !title.includes("never gonna give you up") &&
               !title.includes("meme") &&
               (title.includes("tutorial") || 
                title.includes("learn") || 
                title.includes("how to") ||
                description.includes("tutorial") || 
                description.includes("learn"));
      })
      .map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
      }));
    
    console.log(`Found ${filteredVideos.length} relevant videos`);
    
    if (filteredVideos.length === 0 && data.items.length > 0) {
      // If filtering removed all videos, return at least the first result
      const firstVideo = data.items[0];
      return new Response(
        JSON.stringify({ 
          videos: [{
            id: firstVideo.id.videoId,
            title: firstVideo.snippet.title,
            description: firstVideo.snippet.description,
            thumbnail: firstVideo.snippet.thumbnails.high.url,
            channelTitle: firstVideo.snippet.channelTitle,
            publishedAt: firstVideo.snippet.publishedAt
          }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ videos: filteredVideos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-youtube function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
