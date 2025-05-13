// This handles the POST request for code analysis
export async function POST(request) {
  // Get the code from the request body
  const { code } = await request.json();

  // Perform the code analysis: count lines and length
  const lines = code.split('\n').length;
  const length = code.length;

  // Return the analysis result as JSON
  const result = {
    message: 'Code analyzed successfully',
    lines,
    length,
  };

  return Response.json(result);
}

// This handles the GET request for basic API status
export async function GET(request) {
  return Response.json({ message: 'API is working. Use POST to analyze code.' });
}
