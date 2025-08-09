// api/story-submit.js - Updated with JSON storage
const fs = require('fs').promises;
const path = require('path');

const STORIES_FILE = path.join(__dirname, '..', 'data', 'stories.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(__dirname, '..', 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read existing stories
async function readStories() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(STORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist
  }
}

// Write stories to file
async function writeStories(stories) {
  await ensureDataDir();
  await fs.writeFile(STORIES_FILE, JSON.stringify(stories, null, 2));
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { name, email, date, story } = JSON.parse(event.body);
    
    // Validate input
    if (!name || !email || !date || !story) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'All fields are required' })
      };
    }

    // Read existing stories
    const stories = await readStories();
    
    // Create new story object
    const newStory = {
      id: `story-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      date: date,
      story: story.trim(),
      votes: 0,
      boosted: false,
      createdAt: new Date().toISOString(),
      excerpt: story.trim().substring(0, 150) + (story.length > 150 ? '...' : '')
    };
    
    // Add to stories array
    stories.unshift(newStory); // Add at beginning for newest first
    
    // Keep only last 100 stories to prevent file from getting too large
    if (stories.length > 100) {
      stories.splice(100);
    }
    
    // Save back to file
    await writeStories(stories);
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Story submitted successfully',
        id: newStory.id,
        story: newStory
      })
    };
    
  } catch (error) {
    console.error('Story submission error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to submit story',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    };
  }
};

// api/get-stories.js - New endpoint to fetch all stories
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const stories = await readStories();
    
    // Get query parameters for pagination
    const url = new URL(event.rawUrl);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;
    
    // Paginate results
    const paginatedStories = stories.slice(offset, offset + limit);
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        stories: paginatedStories,
        pagination: {
          page,
          limit,
          total: stories.length,
          totalPages: Math.ceil(stories.length / limit)
        }
      })
    };
    
  } catch (error) {
    console.error('Get stories error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to fetch stories'
      })
    };
  }
};

const form = document.getElementById('story-submit-form');
const submitBtn = document.getElementById('submit-btn');
const loader = document.getElementById('loading-indicator');
const storiesContainer = document.getElementById('stories-container'); // From main stories grid

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loader & disable button
    loader.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('/api/story-submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to submit story");

        const newStory = await res.json();

        // Reset form
        form.reset();

        // Add story to grid immediately (if on same page as grid)
        if (storiesContainer) {
            const card = document.createElement('div');
            card.classList.add('story-card');
            card.innerHTML = `
                <a href="story-detail.html?id=${newStory.id}" class="story-link">
                    <h3>${newStory.title}</h3>
                    <p>${newStory.summary || ''}</p>
                </a>
            `;
            storiesContainer.prepend(card);
        }

        alert("✅ Story submitted successfully!");

    } catch (err) {
        console.error(err);
        alert("❌ Error submitting story. Please try again.");
    } finally {
        // Hide loader & enable button
        loader.style.display = 'none';
        submitBtn.disabled = false;
    }
});
