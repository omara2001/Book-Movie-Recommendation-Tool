// Replace with your Railway backend URL
const API_URL = 'https://bookmovie-recommendation-engine-production.up.railway.app';

// Initialize data
let selectedGenres = [];
let selectedMoods = [];
let selectedThemes = [];
let currentMediaType = 'books';

// Create stars background
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        starsContainer.appendChild(star);
    }
}

// Initialize the app
async function initializeApp() {
    console.log('Initializing app...');
    createStars();
    try {
        await loadGenres();
        await loadMoods();
        await loadThemes();
        setupEventListeners();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize app. Please try refreshing the page.');
    }
}

// Load genres from API
async function loadGenres() {
    try {
        console.log(`Loading genres for ${currentMediaType}...`);
        const response = await fetch(`${API_URL}/genres/${currentMediaType}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error loading genres: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to load genres: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Genres loaded:', data);
        
        const container = document.getElementById('genreChips');
        container.innerHTML = data.genres.map(genre => `
            <div class="chip" data-value="${genre}" onclick="toggleChip(this, 'genres')">
                ${genre}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading genres:', error);
        throw error;
    }
}

// Load moods from API
async function loadMoods() {
    try {
        console.log('Loading moods...');
        const response = await fetch(`${API_URL}/moods`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error loading moods: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to load moods: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Moods loaded:', data);
        
        const container = document.getElementById('moodChips');
        container.innerHTML = data.moods.map(mood => `
            <div class="chip" data-value="${mood}" onclick="toggleChip(this, 'moods')">
                ${mood}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading moods:', error);
        throw error;
    }
}

// Load themes from API
async function loadThemes() {
    try {
        console.log('Loading themes...');
        const response = await fetch(`${API_URL}/themes`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error loading themes: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to load themes: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Themes loaded:', data);
        
        const container = document.getElementById('themeChips');
        container.innerHTML = data.themes.map(theme => `
            <div class="chip" data-value="${theme}" onclick="toggleChip(this, 'themes')">
                ${theme}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading themes:', error);
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Media type selection
    document.querySelectorAll('.media-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const mediaType = btn.dataset.media;
            selectMediaType(btn, mediaType);
        });
    });

    // Mood cards
    document.querySelectorAll('.mood-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.mood-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Select media type
async function selectMediaType(button, mediaType) {
    const parent = button.parentElement;
    parent.querySelectorAll('.media-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    currentMediaType = mediaType;
    
    // Reload genres based on media type
    if (parent.closest('#personalized-tab')) {
        await loadGenres();
    }
}

// Toggle chip selection
function toggleChip(chip, type) {
    chip.classList.toggle('selected');
    const value = chip.dataset.value;
    
    if (type === 'genres') {
        if (chip.classList.contains('selected')) {
            selectedGenres.push(value);
        } else {
            selectedGenres = selectedGenres.filter(g => g !== value);
        }
    } else if (type === 'moods') {
        if (chip.classList.contains('selected')) {
            selectedMoods.push(value);
        } else {
            selectedMoods = selectedMoods.filter(m => m !== value);
        }
    } else if (type === 'themes') {
        if (chip.classList.contains('selected')) {
            selectedThemes.push(value);
        } else {
            selectedThemes = selectedThemes.filter(t => t !== value);
        }
    }
}

// Get personalized recommendations
async function getPersonalizedRecommendations() {
    const favorites = document.getElementById('favorites').value
        .split(',')
        .map(f => f.trim())
        .filter(f => f);
    
    if (favorites.length === 0) {
        showError('Please enter at least one favorite book or movie');
        return;
    }
    
    const count = parseInt(document.getElementById('recommendationCount').value);
    
    const preferences = {
        genres: selectedGenres,
        favorites: favorites,
        mood: selectedMoods,
        themes: selectedThemes
    };

    const requestData = {
        media_type: currentMediaType,
        preferences: preferences,
        recommendation_count: count,
        include_reasons: true
    };

    console.log('Sending personalized recommendation request:', requestData);
    await fetchRecommendations('/recommend', requestData);
}

// Quick search
async function quickSearch() {
    const query = document.getElementById('quickQuery').value;
    if (!query) {
        showError('Please enter a search query');
        return;
    }

    const mediaType = document.querySelector('#quick-tab .media-btn.active').dataset.media;
    
    const requestData = {
        media_type: mediaType,
        query: query,
        count: 5
    };

    console.log('Sending quick search request:', requestData);
    await fetchRecommendations('/quick-recommend', requestData);
}

// Discover media
async function discoverMedia() {
    const selectedMoodCard = document.querySelector('.mood-card.selected');
    if (!selectedMoodCard) {
        showError('Please select a mood');
        return;
    }

    const mood = selectedMoodCard.dataset.mood;
    const mediaType = document.querySelector('#discover-tab .media-btn.active').dataset.media;
    
    const requestData = {
        media_type: mediaType,
        mood: mood
    };

    console.log('Sending discover request:', requestData);
    await fetchRecommendations('/discover', requestData);
}

// Get trending
async function getTrending() {
    const mediaType = document.querySelector('#trending-tab .media-btn.active').dataset.media;
    const category = document.getElementById('trendingCategory').value;
    
    const requestData = {
        media_type: mediaType,
        category: category || null,
        time_frame: 'current'
    };

    console.log('Sending trending request:', requestData);
    await fetchRecommendations('/trending', requestData);
}

// Fetch recommendations from API
async function fetchRecommendations(endpoint, requestData) {
    try {
        showLoading();
        console.log(`Fetching recommendations from ${API_URL}${endpoint}...`);
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `Failed to get recommendations: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                if (errorData.detail) {
                    errorMessage += ` - ${errorData.detail}`;
                }
            } catch (e) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                if (errorText) {
                    errorMessage += ` - ${errorText}`;
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Recommendations received:', data);
        displayResults(data);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        showError('Error: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Display results
function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    const personalizedMessage = document.getElementById('personalizedMessage');
    
    resultsSection.style.display = 'block';
    personalizedMessage.textContent = data.personalized_message || '';
    
    const recommendations = data.recommendations || data.discoveries || data.trending || data.similar_items || [];
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = '<div class="no-results">No recommendations found. Try adjusting your preferences.</div>';
        return;
    }
    
    recommendationsGrid.innerHTML = recommendations.map(item => `
        <div class="recommendation-card">
            ${item.buzz_score ? '<div class="trending-badge">TRENDING</div>' : ''}
            <div class="media-header">
                <div class="media-info">
                    <h3>${item.title}</h3>
                    <p class="author-director">${item.author_director}</p>
                </div>
                ${item.rating ? `<div class="rating"><i class="fas fa-star"></i> ${item.rating}</div>` : ''}
            </div>
            
            <div class="genres">
                ${Array.isArray(item.genre) ? item.genre.map(g => `<span class="genre-tag">${g}</span>`).join('') : ''}
            </div>
            
            <p class="description">${item.description}</p>
            
            ${item.reason ? `<div class="recommendation-reason">${item.reason}</div>` : ''}
            ${item.why_similar ? `<div class="recommendation-reason">${item.why_similar}</div>` : ''}
            ${item.mood_match ? `<div class="recommendation-reason">${item.mood_match}</div>` : ''}
            ${item.trending_reason ? `<div class="recommendation-reason">${item.trending_reason}</div>` : ''}
            
            ${item.where_to_find ? `
                <div class="where-to-find">
                    <i class="fas fa-map-marker-alt"></i>
                    ${item.where_to_find}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Show loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    document.querySelectorAll('.search-btn').forEach(btn => btn.disabled = true);
}

// Hide loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.querySelectorAll('.search-btn').forEach(btn => btn.disabled = false);
}

// Show error
function showError(message) {
    console.error('Error:', message);
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Initialize the app when page loads
window.addEventListener('DOMContentLoaded', initializeApp);
