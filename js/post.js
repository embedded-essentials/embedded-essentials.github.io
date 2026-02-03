// Post page specific JavaScript

// Track page visitors using Firebase
async function trackPageVisitors(pageId) {
    try {
        const count = await FirebaseCounters.increment(`counters/posts/${pageId}/views`);
        
        // Update visitor count in UI
        const visitorCount = document.getElementById('visitor-count');
        if (visitorCount) {
            visitorCount.textContent = count;
        }
    } catch (error) {
        console.error('Failed to track page visit:', error);
    }
}

// Load current like count from Firebase
async function loadLikeCount(pageId) {
    try {
        const count = await FirebaseCounters.get(`counters/posts/${pageId}/likes`);
        
        const likeCount = document.querySelector('.like-count');
        if (likeCount) {
            likeCount.textContent = count;
        }
        
        // Check if user already liked (localStorage)
        const likeKey = `liked_${pageId}`;
        const likeBtn = document.querySelector('.like-btn-post');
        const icon = likeBtn ? likeBtn.querySelector('i') : null;
        
        if (localStorage.getItem(likeKey)) {
            if (likeBtn) {
                likeBtn.classList.add('liked');
                likeBtn.disabled = true;
            }
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        }
    } catch (error) {
        console.error('Failed to load like count:', error);
    }
}

// Handle like button click
async function handleLike(pageId) {
    const likeKey = `liked_${pageId}`;
    const likeBtn = document.querySelector('.like-btn-post');
    const likeCount = document.querySelector('.like-count');
    const icon = likeBtn ? likeBtn.querySelector('i') : null;
    
    console.log('========================================');
    console.log('🔥 LIKE BUTTON CLICKED');
    console.log('Page ID:', pageId);
    console.log('Like key:', likeKey);
    console.log('Like button element:', likeBtn);
    console.log('Like count element:', likeCount);
    console.log('Icon element:', icon);
    
    // Check if user already liked
    const alreadyLiked = localStorage.getItem(likeKey);
    console.log('Already liked (from localStorage):', alreadyLiked);
    
    if (alreadyLiked) {
         console.log('⚠️ User already liked this post - showing toast and exiting');
         showToast('You already liked this post!');
         return;
     }
    
    try {
        console.log('📡 Sending like request to Firebase...');
   
        // Increment like counter on Firebase
        const newCount = await FirebaseCounters.increment(`counters/posts/${pageId}/likes`);
        console.log('✅ Like registered successfully!');
        console.log('New like count:', newCount);
        
        // Update UI with new count
        if (likeCount) {
            const oldCount = likeCount.textContent;
            likeCount.textContent = newCount;
            console.log('Updated like count:', oldCount, '→', newCount);
        }
        
        // Mark as liked in localStorage
        localStorage.setItem(likeKey, 'true');
        console.log('Saved to localStorage:', likeKey, '= true');
        
        // Update button state
        if (likeBtn) {
            likeBtn.classList.add('liked');
            likeBtn.disabled = true;
            console.log('Button disabled and marked as liked');
        }
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
             console.log('Icon changed from far to fas');
        }
        
        // Create celebration effect
        if (likeBtn) {
            createLikeExplosion(likeBtn);
            console.log('Creating like explosion effect...');
        }
        
        // Add animation
        if (likeBtn) {
            likeBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                likeBtn.style.transform = 'scale(1)';
            }, 200);
            console.log('Added scale animation');
        }
        
        showToast('Thanks for liking this post! ❤️');
        console.log('✅ Like process completed successfully');
        console.log('========================================');
        
    } catch (error) {
        console.error('❌ LIKE FAILED');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        showToast('Failed to register like. Please try again.');
        console.log('========================================');
    }
}

// Initialize like button for post page
function initPostLikeButton() {
    const likeBtn = document.querySelector('.like-btn-post');
    if (!likeBtn) return;
    
    const postId = likeBtn.getAttribute('data-post');
    if (!postId) {
        console.error('Like button missing data-post attribute');
        return;
    }
    
    // Load current like count
    loadLikeCount(postId);
    
    // Track page visit
    trackPageVisitors(postId);
    
    // Add click handler
    likeBtn.addEventListener('click', () => handleLike(postId));
}

// Create like explosion animation
function createLikeExplosion(button) {
    const colors = ['#ec4899', '#f472b6', '#fb7185', '#f43f5e'];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '<i class="fas fa-heart"></i>';
        particle.style.cssText = `
            position: fixed;
            pointer-events: none;
            color: ${colors[Math.floor(Math.random() * colors.length)]};
            font-size: ${Math.random() * 10 + 10}px;
            z-index: 10000;
        `;
        
        const rect = button.getBoundingClientRect();
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        animateParticle(particle, vx, vy);
    }
}

function animateParticle(particle, vx, vy) {
    const duration = 1000;
    const startTime = Date.now();
    const startX = parseFloat(particle.style.left);
    const startY = parseFloat(particle.style.top);
    
    function update() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            particle.remove();
            return;
        }
        
        const x = startX + vx * progress;
        const y = startY + vy * progress + (progress * progress * 200); // gravity
        const opacity = 1 - progress;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.opacity = opacity;
        particle.style.transform = `scale(${1 - progress * 0.5})`;
        
        requestAnimationFrame(update);
    }
    
    update();
}

// Share functionality
function initShareButtons() {
    const shareBtn = document.querySelector('.share-btn');
    const shareIcons = document.querySelectorAll('.share-icon');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        url: window.location.href
                    });
                } catch (err) {
                    // Share cancelled or not supported
                }
            } else {
                // Fallback: copy to clipboard
                copyToClipboard(window.location.href);
                showToast('Link copied to clipboard!');
            }
        });
    }
    
    shareIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href;
            const title = document.title;
            
            if (icon.querySelector('.fa-twitter')) {
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
            } else if (icon.querySelector('.fa-linkedin')) {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
            } else if (icon.querySelector('.fa-facebook')) {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            } else if (icon.querySelector('.fa-link')) {
                copyToClipboard(url);
                showToast('Link copied to clipboard!');
            }
        });
    });
}

// Copy to clipboard helper
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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

// Add toast animations
const toastStyle = document.createElement('style');
toastStyle.textContent = `
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
document.head.appendChild(toastStyle);

// Reading progress bar
function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--gradient-primary);
        z-index: 9999;
        transition: width 0.1s ease-out;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Scroll with offset for fixed navbar
                    const yOffset = -120; 
                    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Table of Contents active state tracking
function initTOC() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('h2[id], h3[id]');
    
    if (tocLinks.length === 0 || sections.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-120px 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Remove active class from all links
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initPostLikeButton();
    initShareButtons();
    initReadingProgress();
    initSmoothScroll();
    initTOC();
});
