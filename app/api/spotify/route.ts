import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export async function GET() {
  const scope = 'user-read-private user-read-email user-modify-playback-state';
  const authUrl = new URL('https://accounts.spotify.com/authorize');

  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID!);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI!);
  authUrl.searchParams.append('state', 'some-state-of-my-choice');

  return NextResponse.redirect(authUrl.toString());
}
