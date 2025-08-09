// Gallery functionality for Excellence Educational Institute

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initPhotoGallery();
    initLightbox();
    initGalleryFilters();
    
    console.log('Gallery initialized');
});

// Initialize photo gallery
function initPhotoGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryItems.length === 0) return;
    
    // Add click handlers for gallery items
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            openLightbox(index);
        });
        
        // Add keyboard navigation
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
        
        // Make gallery items focusable
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View gallery image ${index + 1}`);
    });
}

// Initialize lightbox functionality
function initLightbox() {
    // Create lightbox HTML structure
    const lightboxHTML = `
        <div class="lightbox" id="galleryLightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
            <div class="lightbox-overlay"></div>
            <div class="lightbox-container">
                <div class="lightbox-header">
                    <h3 id="lightbox-title" class="lightbox-title">Gallery Image</h3>
                    <button class="lightbox-close" aria-label="Close lightbox">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="lightbox-content">
                    <div class="lightbox-image-container">
                        <div class="lightbox-placeholder">
                            <i class="fas fa-image"></i>
                            <p class="lightbox-description">Loading image...</p>
                        </div>
                    </div>
                    <div class="lightbox-navigation">
                        <button class="lightbox-prev" aria-label="Previous image">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="lightbox-next" aria-label="Next image">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="lightbox-footer">
                    <div class="lightbox-counter">
                        <span class="current-image">1</span> / <span class="total-images">1</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add lightbox to body
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    // Add lightbox styles
    addLightboxStyles();
    
    // Initialize lightbox event handlers
    initLightboxEvents();
}

// Initialize lightbox event handlers
function initLightboxEvents() {
    const lightbox = document.getElementById('galleryLightbox');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    // Close lightbox events
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    
    // Navigation events
    prevBtn.addEventListener('click', showPreviousImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                showPreviousImage();
            } else {
                showNextImage();
            }
        }
    }
}

// Gallery filtering functionality
function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterBtns.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active filter button
            filterBtns.forEach(filterBtn => filterBtn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            filterGalleryItems(filter, galleryItems);
        });
    });
}

// Filter gallery items based on category
function filterGalleryItems(filter, items) {
    items.forEach((item, index) => {
        const category = item.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
            item.style.display = 'block';
            item.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
        } else {
            item.style.display = 'none';
        }
    });
}

// Lightbox functionality
let currentImageIndex = 0;
let galleryImages = [];

function openLightbox(index) {
    const lightbox = document.getElementById('galleryLightbox');
    const visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(item => 
        item.style.display !== 'none'
    );
    
    // Update gallery images array with visible items
    galleryImages = visibleItems.map(item => {
        const placeholder = item.querySelector('.gallery-placeholder');
        const icon = placeholder.querySelector('i').className;
        const text = placeholder.querySelector('p').textContent;
        
        return {
            title: text,
            description: text,
            icon: icon,
            category: item.getAttribute('data-category')
        };
    });
    
    currentImageIndex = index;
    
    // Show lightbox
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
    
    // Update lightbox content
    updateLightboxContent();
    
    // Focus management for accessibility
    lightbox.querySelector('.lightbox-close').focus();
    
    // Trap focus within lightbox
    trapFocus(lightbox);
}

function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
    
    // Return focus to the gallery item that opened the lightbox
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems[currentImageIndex]) {
        galleryItems[currentImageIndex].focus();
    }
}

function showNextImage() {
    if (currentImageIndex < galleryImages.length - 1) {
        currentImageIndex++;
        updateLightboxContent();
    }
}

function showPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateLightboxContent();
    }
}

function updateLightboxContent() {
    const lightbox = document.getElementById('galleryLightbox');
    const image = galleryImages[currentImageIndex];
    
    if (!image) return;
    
    // Update title
    lightbox.querySelector('.lightbox-title').textContent = image.title;
    
    // Update image placeholder
    const imageContainer = lightbox.querySelector('.lightbox-image-container');
    imageContainer.innerHTML = `
        <div class="lightbox-placeholder">
            <i class="${image.icon}"></i>
            <p class="lightbox-description">${image.description}</p>
            <span class="lightbox-category">${getCategoryName(image.category)}</span>
        </div>
    `;
    
    // Update counter
    lightbox.querySelector('.current-image').textContent = currentImageIndex + 1;
    lightbox.querySelector('.total-images').textContent = galleryImages.length;
    
    // Update navigation buttons
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === galleryImages.length - 1;
    
    // Add animation
    imageContainer.style.animation = 'fadeIn 0.3s ease';
}

// Helper function to get category display name
function getCategoryName(category) {
    const categoryNames = {
        'neet': 'NEET Achievement',
        'jee': 'JEE Success',
        'cet': 'CET Excellence',
        'events': 'Institute Events'
    };
    
    return categoryNames[category] || 'Gallery';
}

// Focus trap for accessibility
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });
}

// Add lightbox styles
function addLightboxStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .lightbox.active {
            opacity: 1;
            visibility: visible;
        }
        
        .lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            cursor: pointer;
        }
        
        .lightbox-container {
            position: relative;
            width: 90%;
            max-width: 800px;
            height: 90vh;
            margin: 5vh auto;
            background: white;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .lightbox.active .lightbox-container {
            transform: scale(1);
        }
        
        .lightbox-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .lightbox-title {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.5rem;
        }
        
        .lightbox-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.3s ease;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .lightbox-close:hover {
            background: var(--light-color);
            color: var(--text-primary);
        }
        
        .lightbox-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .lightbox-image-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .lightbox-placeholder {
            text-align: center;
            color: var(--primary-color);
            background: var(--gradient-bg);
            color: white;
            padding: 4rem 2rem;
            border-radius: 12px;
            width: 100%;
            max-width: 500px;
        }
        
        .lightbox-placeholder i {
            font-size: 4rem;
            margin-bottom: 1rem;
            display: block;
        }
        
        .lightbox-description {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: white;
        }
        
        .lightbox-category {
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            color: white;
        }
        
        .lightbox-navigation {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            transform: translateY(-50%);
            display: flex;
            justify-content: space-between;
            padding: 0 1rem;
            pointer-events: none;
        }
        
        .lightbox-prev,
        .lightbox-next {
            background: var(--primary-color);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .lightbox-prev:hover,
        .lightbox-next:hover {
            background: var(--primary-dark);
            transform: scale(1.1);
        }
        
        .lightbox-prev:disabled,
        .lightbox-next:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .lightbox-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid var(--border-color);
            text-align: center;
        }
        
        .lightbox-counter {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .current-image {
            color: var(--primary-color);
            font-weight: 600;
        }
        
        body.lightbox-open {
            overflow: hidden;
        }
        
        @media (max-width: 768px) {
            .lightbox-container {
                width: 95%;
                height: 95vh;
                margin: 2.5vh auto;
            }
            
            .lightbox-header {
                padding: 1rem;
            }
            
            .lightbox-title {
                font-size: 1.2rem;
            }
            
            .lightbox-image-container {
                padding: 1rem;
            }
            
            .lightbox-placeholder {
                padding: 2rem 1rem;
            }
            
            .lightbox-placeholder i {
                font-size: 3rem;
            }
            
            .lightbox-navigation {
                padding: 0 0.5rem;
            }
            
            .lightbox-prev,
            .lightbox-next {
                width: 40px;
                height: 40px;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Export for use in other files
window.gallery = {
    openLightbox,
    closeLightbox,
    showNextImage,
    showPreviousImage
};
