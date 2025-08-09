exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { storyId, email } = JSON.parse(event.body);
    
    // Here you would typically:
    // 1. Check if user has already voted
    // 2. Update vote count in database
    // 3. Record the vote
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: true, 
        newVoteCount: Math.floor(Math.random() * 100) + 200
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};