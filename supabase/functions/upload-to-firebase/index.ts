
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { initializeApp } from "https://cdn.skypack.dev/firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "https://cdn.skypack.dev/firebase/storage";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: Deno.env.get("FIREBASE_API_KEY"),
  authDomain: Deno.env.get("FIREBASE_AUTH_DOMAIN"),
  projectId: Deno.env.get("FIREBASE_PROJECT_ID"),
  storageBucket: Deno.env.get("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: Deno.env.get("FIREBASE_MESSAGING_SENDER_ID"),
  appId: Deno.env.get("FIREBASE_APP_ID")
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if Firebase configuration is complete
    const missingConfigs = Object.entries(firebaseConfig).filter(([_, value]) => !value);
    if (missingConfigs.length > 0) {
      const missing = missingConfigs.map(([key]) => key).join(', ');
      console.error(`Missing Firebase configs: ${missing}`);
      return new Response(
        JSON.stringify({ error: `Firebase configuration incomplete. Missing: ${missing}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    const { imageData, filename, courseId, contentType } = await req.json();

    if (!imageData || !filename || !courseId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: imageData, filename, and courseId are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;

    // Create a storage reference
    const storageRef = ref(storage, `course-banners/${courseId}/${filename}`);
    
    // Upload the image
    const format = contentType || 'data_url';
    await uploadString(storageRef, base64Data, format);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return new Response(
      JSON.stringify({ url: downloadURL }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-to-firebase function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
