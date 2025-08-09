function loadAllStories() {
            const storiesContainer = document.getElementById('all-stories');
            const demoStories = [
                {
                    id: 'story-3',
                    author: 'Amit Patel',
                    date: '2024-05-10',
                    title: 'The Catch That Changed Everything',
                    excerpt: 'It was a routine match until that incredible boundary catch in the 18th over...',
                    votes: 156
                },
                {
                    id: 'story-4',
                    author: 'Sneha Reddy',
                    date: '2024-05-08',
                    title: 'Meeting My Cricket Hero',
                    excerpt: 'I never thought I would meet Virat Kohli, but destiny had other plans...',
                    votes: 203
                },
                {
                    id: 'story-5',
                    author: 'Rajesh Singh',
                    date: '2024-05-05',
                    title: 'The Underdog Victory',
                    excerpt: 'Our local team was 50 runs behind with 3 overs left. What happened next was magical...',
                    votes: 127
                }
            ];
            
            storiesContainer.innerHTML = demoStories.map(story => `
                <div class="card story-card wicket-border">
                    <div class="story-meta">
                        <span>By ${story.author}</span>
                        <span>${story.date}</span>
                    </div>
                    <h3 class="story-title">${story.title}</h3>
                    <p class="story-excerpt">${story.excerpt}</p>
                    <a href="story-detail.html" class="btn2">More</a> 
                    <div class="vote-widget">
                        <div class="vote-count">
                            <span>⭐</span>
                            <span>${story.votes} votes</span>
                        </div>
                        <button class="btn-vote" onclick="voteForStory('${story.id}')">Vote for This Tale</button>
                    </div>
                    <div class="boost-section">
                        <button class="boost-btn" onclick="boostStory('${story.id}')">Boost This Tale - $2</button>
                    </div>
                </div>
            `).join('');
        }