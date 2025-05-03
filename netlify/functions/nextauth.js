// Netlify function to handle NextAuth authentication
exports.handler = async (event, context) => {
  // Determine environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment ? 'http://localhost:3000' : 'https://uniwell.netlify.app';
  
  // Parse the request path
  const path = event.path.replace('/.netlify/functions/nextauth', '');
  const queryParams = event.queryStringParameters || {};
  const method = event.httpMethod;
  
  // Log in development
  if (isDevelopment) {
    console.log(`NextAuth handler: ${path}`);
    console.log(`Method: ${method}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Base URL: ${baseUrl}`);
  }
  
  // Handle specific auth routes
  if (path.includes('/callback')) {
    // Handle OAuth callbacks
    if (isDevelopment) {
      console.log(`Processing auth callback ${path}`);
    }
    
    // In development, redirect to localhost dashboard
    // In production, redirect to Netlify dashboard
    const redirectUrl = `${baseUrl}/dashboard`;
    
    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
        'Cache-Control': 'no-cache'
      }
    };
  }
  
  if (path.includes('/signin')) {
    // Handle sign-in requests
    if (isDevelopment) {
      console.log(`Processing signin request ${path}`);
    }
    
    // If this is a POST request with credentials
    if (method === 'POST') {
      try {
        // Get the request body
        const body = JSON.parse(event.body || '{}');
        
        if (body.email && body.password) {
          // Successful credential auth should redirect to dashboard
          // Use appropriate URL based on environment
          const dashboardUrl = `${baseUrl}/dashboard`;
          
          return {
            statusCode: 302,
            headers: {
              Location: dashboardUrl,
              'Set-Cookie': `next-auth.session-token=dummy-token; Path=/; HttpOnly; SameSite=Lax; ${!isDevelopment ? 'Secure;' : ''}`,
              'Cache-Control': 'no-cache'
            }
          };
        }
      } catch (error) {
        if (isDevelopment) {
          console.error('Error parsing credentials:', error);
        }
      }
    }
    
    // All other signin requests redirect to login page with appropriate UI
    // Use appropriate URL based on environment
    const signInUrl = isDevelopment ? '/sign-in' : '/en/sign-in';
    
    return {
      statusCode: 302,
      headers: {
        Location: signInUrl,
        'Cache-Control': 'no-cache'
      }
    };
  }
  
  if (path.includes('/signout')) {
    // Handle sign-out requests
    if (isDevelopment) {
      console.log(`Processing signout request ${path}`);
    }
    
    // Redirect to homepage based on environment
    const homeUrl = isDevelopment ? '/' : '/en';
    
    return {
      statusCode: 302,
      headers: {
        Location: homeUrl,
        'Set-Cookie': 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'Cache-Control': 'no-cache'
      }
    };
  }
  
  // Default response for other auth endpoints
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      status: 'success', 
      message: 'Auth endpoint handler',
      path,
      query: queryParams,
      environment: process.env.NODE_ENV || 'unknown',
      baseUrl
    })
  };
}; 