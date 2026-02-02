// CountAPI Configuration
const COUNTAPI_NAMESPACE = 'embedded-essentials.github.io'; // Change to your domain
const BLOG_POST_IDS = ['mentorship']; // Add more blog post IDs as you create them

// Track homepage visitors using CountAPI
async function trackHomepageVisitors() {
    try {
        const response = await fetch(`https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/homepage/visits`);
        const data = await response.json();
        
        // Homepage visit tracked
    } catch (error) {
        console.error('Failed to track homepage visit:', error);
    }
}

// Load and display aggregate blog statistics
async function loadAggregateStats() {
    let totalLikes = 0;
    let totalViews = 0;
    
    try {
        // Fetch stats from all blog posts
        for (const blogId of BLOG_POST_IDS) {
            // Fetch likes
            const likesResponse = await fetch(`https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${blogId}/likes`);
            const likesData = await likesResponse.json();
            totalLikes += likesData.value || 0;
            
            // Fetch views
            const viewsResponse = await fetch(`https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${blogId}/visits`);
            const viewsData = await viewsResponse.json();
            totalViews += viewsData.value || 0;
        }
        
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

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

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

// Like Button Functionality (deprecated - kept for backward compatibility)
// New blog posts use CountAPI in post.js
function initLikeButtons() {
    const LIKES_KEY = 'blog_post_likes';
    const USER_LIKES_KEY = 'blog_user_likes';
    
    // Get all likes and user's liked posts
    let allLikes = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
    let userLikes = JSON.parse(localStorage.getItem(USER_LIKES_KEY) || '[]');
    
    // Initialize like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        const postId = btn.getAttribute('data-post');
        const likeCount = btn.querySelector('.like-count');
        const icon = btn.querySelector('i');
        
        // Set initial like count
        const count = allLikes[postId] || 0;
        likeCount.textContent = count;
        
        // Check if user has liked this post
        if (userLikes.includes(postId)) {
            btn.classList.add('liked');
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
        
        // Add click handler
        btn.addEventListener('click', () => {
            const isLiked = userLikes.includes(postId);
            
            if (isLiked) {
                // Unlike
                userLikes = userLikes.filter(id => id !== postId);
                allLikes[postId] = Math.max(0, (allLikes[postId] || 0) - 1);
                btn.classList.remove('liked');
                icon.classList.remove('fas');
                icon.classList.add('far');
            } else {
                // Like
                userLikes.push(postId);
                allLikes[postId] = (allLikes[postId] || 0) + 1;
                btn.classList.add('liked');
                icon.classList.remove('far');
                icon.classList.add('fas');
                
                // Create heart animation
                createHeartAnimation(btn);
            }
            
            // Update display
            likeCount.textContent = allLikes[postId];
            
            // Save to localStorage
            localStorage.setItem(LIKES_KEY, JSON.stringify(allLikes));
            localStorage.setItem(USER_LIKES_KEY, JSON.stringify(userLikes));
            
            // Update total likes
            updateTotalLikes();
        });
    });
    
    // Update total likes counter
    updateTotalLikes();
}

function updateTotalLikes() {
    const LIKES_KEY = 'blog_post_likes';
    const allLikes = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
    const total = Object.values(allLikes).reduce((sum, count) => sum + count, 0);
    animateCounter('total-likes', total);
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
    // Track homepage visit
    trackHomepageVisitors();
    
    // Load aggregate stats from all blog posts
    loadAggregateStats();
    
    initLikeButtons();
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
