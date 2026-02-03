// Simple Counter System using localStorage
// This is a temporary solution while CountAPI is down
// Stores counts locally in browser - not global across users

const STORAGE_KEYS = {
    HOMEPAGE_VISITS: 'homepage_visits_count',
    BLOG_VISITS: 'blog_visits_',
    BLOG_LIKES: 'blog_likes_',
    USER_LIKES: 'blog_user_likes',
    AGGREGATE_VIEWS: 'aggregate_views',
    AGGREGATE_LIKES: 'aggregate_likes'
};

// Initialize or increment a counter
function incrementCounter(key) {
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const newValue = current + 1;
    localStorage.setItem(key, newValue.toString());
    return newValue;
}

// Get current counter value
function getCounter(key) {
    return parseInt(localStorage.getItem(key) || '0', 10);
}

// Set counter value
function setCounter(key, value) {
    localStorage.setItem(key, value.toString());
}

// Track homepage visit
function trackHomepageVisits() {
    return incrementCounter(STORAGE_KEYS.HOMEPAGE_VISITS);
}

// Track blog post visit
function trackBlogVisit(postId) {
    const key = STORAGE_KEYS.BLOG_VISITS + postId;
    return incrementCounter(key);
}

// Get blog post visit count
function getBlogVisits(postId) {
    const key = STORAGE_KEYS.BLOG_VISITS + postId;
    return getCounter(key);
}

// Increment blog post likes
function incrementBlogLikes(postId) {
    const key = STORAGE_KEYS.BLOG_LIKES + postId;
    return incrementCounter(key);
}

// Get blog post like count
function getBlogLikes(postId) {
    const key = STORAGE_KEYS.BLOG_LIKES + postId;
    return getCounter(key);
}

// Check if user has liked a post
function hasUserLiked(postId) {
    const userLikes = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_LIKES) || '[]');
    return userLikes.includes(postId);
}

// Mark post as liked by user
function markAsLiked(postId) {
    const userLikes = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_LIKES) || '[]');
    if (!userLikes.includes(postId)) {
        userLikes.push(postId);
        localStorage.setItem(STORAGE_KEYS.USER_LIKES, JSON.stringify(userLikes));
        return true;
    }
    return false;
}

// Calculate aggregate stats
function calculateAggregateStats(blogPostIds) {
    let totalViews = 0;
    let totalLikes = 0;
    
    blogPostIds.forEach(postId => {
        totalViews += getBlogVisits(postId);
        totalLikes += getBlogLikes(postId);
    });
    
    return { totalViews, totalLikes };
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        incrementCounter,
        getCounter,
        setCounter,
        trackHomepageVisits,
        trackBlogVisit,
        getBlogVisits,
        incrementBlogLikes,
        getBlogLikes,
        hasUserLiked,
        markAsLiked,
        calculateAggregateStats,
        STORAGE_KEYS
    };
}
