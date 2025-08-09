exports.handler = async (event, context) => {
  // IMPORTANT: Secret key is accessed from environment variables
  // NEVER hardcode secret keys in your code!
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { storyId, amount } = JSON.parse(event.body);
    
    // Validate input
    if (!storyId || !amount || amount !== 200) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid request data' })
      };
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Cricket Story Boost',
            description: `Boost story ${storyId} for enhanced visibility`,
          },
          unit_amount: amount, // $2.00 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.URL || 'https://yoursite.netlify.app'}/success.html?storyId=${storyId}`,
      cancel_url: `${process.env.URL || 'https://yoursite.netlify.app'}/cancel.html`,
      metadata: {
        storyId: storyId,
        feature: 'story_boost'
      },
      // 20% application fee as mentioned in requirements
      payment_intent_data: {
        application_fee_amount: Math.round(amount * 0.20),
      }
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        id: session.id,
        url: session.url 
      })
    };
    
  } catch (error) {
    console.error('Stripe session creation failed:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Payment session creation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    };
  }
};

// api/config.js - Configuration management
exports.getPublicConfig = async (event, context) => {
  return {
    statusCode: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      environment: process.env.NODE_ENV || 'development'
    })
  };
};