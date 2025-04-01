import { NextRequest, NextResponse } from "next/server";
import { spotifyConfig } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  
  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=spotify_no_code", request.url));
  }
  
  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(
          `${spotifyConfig.clientId}:`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: spotifyConfig.redirectUri,
      }).toString(),
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Spotify token exchange error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=spotify_token_exchange", request.url));
    }
    
    const tokenData = await tokenResponse.json();
    
    // Redirect to a page that will save the tokens in localStorage
    const redirectUrl = new URL("/dashboard/spotify-auth", request.url);
    redirectUrl.searchParams.set("access_token", tokenData.access_token);
    redirectUrl.searchParams.set("refresh_token", tokenData.refresh_token);
    redirectUrl.searchParams.set("expires_in", tokenData.expires_in.toString());
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Spotify callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=spotify_callback", request.url));
  }
}
