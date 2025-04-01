import { NextResponse } from "next/server";

// Cache weather data for 30 minutes to avoid excessive API calls
let cachedWeatherData: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function GET() {
  const currentTime = Date.now();
  
  // Return cached data if it's still valid
  if (cachedWeatherData && (currentTime - lastFetchTime < CACHE_DURATION)) {
    return NextResponse.json(cachedWeatherData);
  }
  
  try {
    // Get API key from environment variables
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Weather API key not configured" },
        { status: 500 }
      );
    }
    
    // Default location (can be made dynamic later by accepting query parameters)
    const location = "auto:ip"; // Auto-detect location based on IP
    
    // Fetch weather data from weatherapi.com
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update cache
    cachedWeatherData = data;
    lastFetchTime = currentTime;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
