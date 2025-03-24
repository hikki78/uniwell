import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }
  
  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri as string
      }).toString()
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error_description || 'Failed to exchange authorization code');
    }
    
    const tokenData = await tokenResponse.json();
    
    // Redirect back to the dashboard with a success parameter
    res.redirect('/dashboard?spotify=success');
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect('/dashboard?spotify=error');
  }
}
