const storyGrid = document.querySelector(".story-grid");
const tagSelect = document.getElementById("tag-select");
const errorBanner = document.getElementById("error-banner");

async function fetchStories(tag) {
  try {
    hideError();
    const query = tag && tag !== "All" ? `?tag=${encodeURIComponent(tag)}` : "";
    const res = await fetch(`/api/stories${query}`);
    if (!res.ok) throw new Error("Failed to load stories");
    const stories = await res.json();
    renderStories(stories);
  } catch (err) {
    showError(err.message);
  }
}
// Assuming 'stories' is the array you got from /api/stories
stories.forEach(story => {
    const card = document.createElement('div');
    card.classList.add('story-card');

    // Entire card clickable via <a>
    card.innerHTML = `
        <a href="story-detail.html?id=${story.id}" class="story-link" style="text-decoration:none; color:inherit;">
            <h3>${story.title}</h3>
            <p>${story.summary || ''}</p>
        </a>
    `;

    document.querySelector('#stories-container').appendChild(card);
});

function renderStories(stories) {
  storyGrid.innerHTML = stories
    .map(
      (story) => `
      <div class="story-card">
        <h3>${story.title}</h3>
        <p>${story.summary}</p>
      </div>
    `
    )
    .join("");
}


function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.style.display = "block";
  setTimeout(hideError, 5000);
}

function hideError() {
  errorBanner.style.display = "none";
}

tagSelect.addEventListener("change", () => {
  fetchStories(tagSelect.value);
});

// Initial load
fetchStories("All");
