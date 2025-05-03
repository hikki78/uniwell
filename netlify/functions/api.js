const { NextResponse } = require('next/server');

// Netlify serverless function to handle API routes
exports.handler = async function(event, context) {
  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    
    // For preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: '',
      };
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Log all requests in development mode
    if (isDevelopment) {
      console.log(`API function called: ${path}`);
      console.log(`Request method: ${event.httpMethod}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    }
    
    // Handle authentication-related requests
    if (path.includes('/api/auth')) {
      // Redirect auth requests to the nextauth function
      if (isDevelopment) {
        console.log(`Redirecting auth request to nextauth function: ${path}`);
      }
      
      const redirectTarget = path.replace('/api', '/.netlify/functions/nextauth');
      
      return {
        statusCode: 302,
        headers: {
          Location: redirectTarget,
          'Cache-Control': 'no-cache'
        }
      };
    }
    
    // Handle dashboard access - check for authentication
    if (path.includes('/dashboard')) {
      const cookies = event.headers.cookie || '';
      const hasAuthCookie = cookies.includes('next-auth.session-token');
      
      if (!hasAuthCookie) {
        if (isDevelopment) {
          console.log('Unauthenticated dashboard access attempt - redirecting to login');
        }
        
        // Decide where to redirect based on environment
        const redirectUrl = isDevelopment ? '/sign-in' : '/en/sign-in';
        
        return {
          statusCode: 302,
          headers: {
            Location: redirectUrl,
            'Cache-Control': 'no-cache'
          }
        };
      }
    }
    
    // Return a simple JSON response for API requests
    if (isDevelopment) {
      console.log(`Returning API response for: ${path}`);
    }
    
    // Handle different API endpoints
    if (path.includes('/api/weather/get')) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current: {
            temp_c: 22,
            condition: {
              text: 'Sunny',
              icon: 'https://cdn.weatherapi.com/weather/64x64/day/113.png'
            }
          }
        })
      };
    }
    
    if (path.includes('/api/dashboard/tasks')) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          total: 5,
          completed: 3
        })
      };
    }
    
    if (path.includes('/api/dashboard/settings')) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          screenTimeLimit: 480,
          waterIntakeGoal: 2000,
          meditationGoal: 10,
          sleepGoal: 8,
          exerciseGoal: 30,
          readingGoal: 20
        })
      };
    }
    
    // Default response for any other API endpoint
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'API endpoint reached',
        path,
        method: event.httpMethod,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
} 