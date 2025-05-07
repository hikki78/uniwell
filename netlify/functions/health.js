// A simple health check function for the Netlify deployment
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Netlify function is working correctly",
      timestamp: new Date().toISOString(),
      build: process.env.COMMIT_REF || 'local'
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}; 