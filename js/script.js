// Blog Configuration
const BLOG_POST_IDS = ['mentorship']; // Add more blog post IDS as you create them

// Track homepage visitors using Firebase
async function trackHomepageVisitors() {
    try {
        const count = await FirebaseCounters.increment('counters/homepage-visits');
        console.log('Homepage visit tracked:', count);
    } catch (error) {
        console.error('Failed to track homepage visit:', error);
    }
}

// Load and display aggregate blog statistics
async function loadAggregateStats() {
    let totalLikes = 0;
    let totalViews = 0;
    
    console.log('📊 Loading aggregate stats...');
    console.log('Blog post IDs:', BLOG_POST_IDS);
    
    try {
        // Fetch stats from all blog posts
        for (const blogId of BLOG_POST_IDS) {
            // Fetch likes
            const likesPath = `counters/posts/${blogId}/likes`;
            const likes = await FirebaseCounters.get(likesPath);
            console.log(`${blogId} likes:`, likes);
            totalLikes += likes;
            
            // Fetch views
            const viewsPath = `counters/posts/${blogId}/views`;
            const views = await FirebaseCounters.get(viewsPath);
            console.log(`${blogId} views:`, views);
            totalViews += views;
        }
        
        console.log('Total Likes:', totalLikes);
        console.log('Total Views:', totalViews);
        
        // Animate counters
        animateCounter('total-likes', totalLikes);
        animateCounter('visitor-count', totalViews);
        
    } catch (error) {
        console.error('Failed to load aggregate stats:', error);
        // Fallback to showing 0
        const likesElement = document.getElementById('total-likes');
        const viewsElement = document.getElementById('visitor-count');
        if (likesElement) likesElement.textContent = '0';
        if (viewsElement) viewsElement.textContent = '0';
    }
}

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Active navigation on scroll
const navSections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    navSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (scrollY > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Like Button Functionality for blog cards on homepage
function initLikeButtons() {
    const USER_LIKES_KEY = 'blog_user_likes';
    
    // Get user's liked posts from localStorage
    let userLikes = JSON.parse(localStorage.getItem(USER_LIKES_KEY) || '[]');
    
    // Initialize like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        const postId = btn.getAttribute('data-post');
        const likeCount = btn.querySelector('.like-count');
        const icon = btn.querySelector('i');
        
        // Load current like count from Firebase
        loadCardLikeCount(postId, likeCount);
        
        // Check if user has liked this post
        if (userLikes.includes(postId)) {
            btn.classList.add('liked');
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
        
        // Add click handler
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent card click
            const isLiked = userLikes.includes(postId);
            
            if (isLiked) {
                showToast('You already liked this post!');
                return;
            }
            
            try {
                // Like - increment on Firebase
                const newCount = await FirebaseCounters.increment(`counters/posts/${postId}/likes`);
                
                // Update display
                likeCount.textContent = newCount;
                
                // Mark as liked locally
                userLikes.push(postId);
                localStorage.setItem(USER_LIKES_KEY, JSON.stringify(userLikes));
                
                btn.classList.add('liked');
                icon.classList.remove('far');
                icon.classList.add('fas');
                
                // Create heart animation
                createHeartAnimation(btn);
                
                // Update total likes
                loadAggregateStats();
                
                showToast('Thanks for liking! ❤️');
            } catch (error) {
                console.error('Failed to like post:', error);
                showToast('Failed to register like. Please try again.');
            }
        });
    });
}

// Load like count for a specific blog card
async function loadCardLikeCount(postId, likeCountElement) {
    try {
        const count = await FirebaseCounters.get(`counters/posts/${postId}/likes`);
        
        if (likeCountElement) {
            likeCountElement.textContent = count;
        }
    } catch (error) {
        console.error('Failed to load like count for', postId, error);
        if (likeCountElement) {
            likeCountElement.textContent = '0';
        }
    }
}

function updateTotalLikes() {
    // This is now handled by loadAggregateStats()
    loadAggregateStats();
}

function createHeartAnimation(button) {
    const heart = document.createElement('i');
    heart.className = 'fas fa-heart heart-animation';
    heart.style.cssText = `
        position: absolute;
        font-size: 1.5rem;
        color: #ec4899;
        pointer-events: none;
        animation: heartFloat 1s ease-out forwards;
    `;
    
    const rect = button.getBoundingClientRect();
    heart.style.left = rect.left + rect.width / 2 + 'px';
    heart.style.top = rect.top + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 1000);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        border: 1px solid var(--border-color);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add heart animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes heartFloat {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px) scale(1.5);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Counter Animation
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Particle Background Animation
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            opacity: 0.3;
            animation: float ${duration}s ${delay}s infinite ease-in-out;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Add particle animation CSS
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
        }
        25% {
            transform: translate(20px, -20px);
        }
        50% {
            transform: translate(-20px, 20px);
        }
        75% {
            transform: translate(20px, 20px);
        }
    }
`;
document.head.appendChild(particleStyle);

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe blog cards
document.querySelectorAll('.blog-card').forEach(card => {
    observer.observe(card);
});

// Observe stat cards
document.querySelectorAll('.stat-card').forEach(card => {
    observer.observe(card);
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Firebase to initialize
    setTimeout(async () => {
        // Track homepage visit
        await trackHomepageVisitors();
        
        // Load aggregate stats from all blog posts
        await loadAggregateStats();
        
        initLikeButtons();
    }, 500);
    
    createParticles();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Parallax effect for hero section
window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 700;
    }
}, 10));

// Add smooth reveal animation for sections
const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

sections.forEach(section => {
    sectionObserver.observe(section);
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        // Trigger special effect
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// Performance monitoring
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
                console.warn('Slow operation detected:', entry.name, entry.duration + 'ms');
            }
        }
    });
    
    perfObserver.observe({ entryTypes: ['measure', 'navigation'] });
}

console.log('%c🚀 Welcome to Embedded Essentials! ', 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%cInterested in the code? Check out the GitHub repo!', 'color: #667eea; font-size: 12px;');

// Make entire blog card clickable - wrapped in function to ensure DOM is ready
function makeCardsClickable() {
    const cards = document.querySelectorAll('.blog-card');
    
    cards.forEach((card, index) => {
        const titleLink = card.querySelector('.card-title-link');
        const readMoreLink = card.querySelector('.read-more');
        
        const url = titleLink ? titleLink.getAttribute('href') : 
                    readMoreLink ? readMoreLink.getAttribute('href') : null;
        
        if (url) {
            // Make entire card clickable
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on like button or read more button specifically
                const clickedElement = e.target;
                const isLikeButton = clickedElement.closest('.like-btn');
                const isReadMore = clickedElement.closest('.read-more');
                
                if (isLikeButton || isReadMore) {
                    return;
                }
                
                // Navigate to the post
                e.preventDefault();
                window.location.href = url;
            }, true); // Use capture phase
        }
    });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makeCardsClickable);
} else {
    makeCardsClickable();
}
