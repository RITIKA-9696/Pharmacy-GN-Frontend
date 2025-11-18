// baby.js - COMPLETE CORRECTED VERSION WITH PROPER FUNCTION ORDERING
let products = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Use a different name to avoid conflict with header.js
const BABY_API_BASE_URL = 'http://localhost:8083/api/mb/products';

// Banner Carousel Variables
let currentBannerSlide = 0;
let bannerInterval;

// ==================== UTILITY FUNCTIONS ====================
function getPlaceholderImage(text = 'Product') {
    return `https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=${encodeURIComponent(text)}`;
}

function generateStarRating(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    
    let stars = '';
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

function showNotification(msg, type = "info") {
    // Remove existing notifications
    document.querySelectorAll('.custom-notification').forEach(n => n.remove());
    
    const notification = document.createElement("div");
    notification.className = `custom-notification fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
        type === "success" ? "bg-green-500" : 
        type === "error" ? "bg-red-500" : 
        "bg-blue-500"
    }`;
    notification.textContent = msg;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== PRODUCT RENDERING FUNCTIONS ====================
function createProductCard(product) {
    
    const mainImage = product.mainImageUrl || (product.images && product.images[0]) || 
                     product.image || 
                     getPlaceholderImage(product.title);
    const images = product.images && product.images.length > 0
                   ? product.images
                   : [mainImage];

    const hasMultipleImages = images.length > 1;
    const isInWishlist = wishlist.some(p => p.id === product.id);
             

    return `
        <div class="product-card group">
            <div class="relative">
                ${product.discount > 0 ? `
                    <div class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                        ${product.discount}% OFF
                    </div>
                ` : ''}
                
                <button id="wishlist-${product.id}" class="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-200">
                    <i class="${isInWishlist ? 'fas fa-heart text-pink-500' : 'far fa-heart text-gray-400'}"></i>
                </button>
                
                <div class="relative h-64 overflow-hidden rounded-t-lg">
                    <div id="carousel-${product.id}" class="flex product-carousel h-full" style="width: ${images.length * 100}%">
                        ${images.map((img, index) => `
                            <div class="w-full h-full flex-shrink-0" style="width: ${100 / images.length}%">
                                <img src="${img}" alt="${product.title}" 
                                     class="w-full h-full object-cover image-zoom"
                                     onerror="this.src='${getPlaceholderImage(product.title)}'">
                            </div>
                        `).join("")}
                    </div>
                    
                    ${hasMultipleImages ? `
                        <button id="prev-${product.id}" class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <i class="fas fa-chevron-left text-gray-600 text-sm"></i>
                        </button>
                        <button id="next-${product.id}" class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <i class="fas fa-chevron-right text-gray-600 text-sm"></i>
                        </button>
                        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                            ${images.map((_, i) => `
                                <button class="carousel-dot w-2 h-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-white active' : 'bg-white/60'}" 
                                        data-index="${i}" data-carousel="${product.id}"></button>
                            `).join("")}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="content p-4">
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">${product.title}</h3>
                <p class="text-sm text-gray-600 line-clamp-2 mb-3">${product.description || 'No description available'}</p>
                
                <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 text-sm">${generateStarRating(product.rating)}</div>
                    <span class="ml-2 text-sm text-gray-600">(${product.reviewCount || 0})</span>
                </div>
                
                <div class="flex items-center mb-3">
                    <span class="text-xl font-bold text-pink-600">₹${(product.price || 0).toFixed(2)}</span>
                    ${product.originalPrice > product.price ? `
                        <span class="ml-2 text-sm text-gray-500 line-through">₹${(product.originalPrice || 0).toFixed(2)}</span>
                    ` : ''}
                </div>
                
                <div class="mt-3">
                    <button id="view-details-${product.id}" class="view-details">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupProductCarousel(productId, totalImages) {
    let currentIndex = 0;
    const carousel = document.getElementById(`carousel-${productId}`);
    const prevBtn = document.getElementById(`prev-${productId}`);
    const nextBtn = document.getElementById(`next-${productId}`);
    const dots = document.querySelectorAll(`[data-carousel="${productId}"]`);

    if (!carousel) return;

    function updateCarousel() {
        const translateX = -currentIndex * (100 / totalImages);
        carousel.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            updateCarousel();
        });
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % totalImages;
            updateCarousel();
        });
    }

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = parseInt(dot.dataset.index);
            updateCarousel();
        });
    });

    // Auto slide (only if more than 1 image)
    if (totalImages > 1) {
        let autoSlide = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateCarousel();
        }, 4000);

        // Pause on hover
        const productCard = carousel.closest('.product-card');
        if (productCard) {
            productCard.addEventListener('mouseenter', () => clearInterval(autoSlide));
            productCard.addEventListener('mouseleave', () => {
                autoSlide = setInterval(() => {
                    currentIndex = (currentIndex + 1) % totalImages;
                    updateCarousel();
                }, 4000);
            });
        }
    }
}

function showLoading() {
    const grid = document.getElementById("productsGrid");
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="mt-2 text-gray-600">Loading products...</p>
            </div>
        `;
    }
}

function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) {
        console.error('❌ Products grid element not found');
        return;
    }

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const pageItems = filteredProducts.slice(start, end);

    if (pageItems.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p class="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
        `;
    } else {
        grid.innerHTML = pageItems.map(product => createProductCard(product)).join("");
        
        // Add event listeners to the newly rendered products
        pageItems.forEach(product => {
            // Wishlist button
            const wishlistBtn = document.getElementById(`wishlist-${product.id}`);
            if (wishlistBtn) {
                wishlistBtn.addEventListener("click", () => toggleWishlist(product.id));
            }
            
            // View details button
            const viewDetailsBtn = document.getElementById(`view-details-${product.id}`);
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener("click", () => viewProductDetails(product.id));
            }
            
            // Setup carousel if product has multiple images
            if (product.images && product.images.length > 1) {
                setupProductCarousel(product.id, product.images.length);
            }
        });
    }

    renderPagination();
    updateResultsCount();
}

function updateResultsCount() {
    const el = document.getElementById("resultsCount");
    if (el) {
        const total = filteredProducts.length;
        const start = (currentPage - 1) * productsPerPage + 1;
        const end = Math.min(currentPage * productsPerPage, total);
        el.textContent = total === 0 ? "No products found" : `Showing ${start}-${end} of ${total} products`;
    }
}

function renderPagination() {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) { 
        pagination.innerHTML = ""; 
        return; 
    }

    let html = "";
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="pagination-btn px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all" data-page="${currentPage-1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn px-3 py-2 rounded-md border transition-all ${
                i === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all" data-page="${currentPage+1}">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    pagination.innerHTML = html;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll(".pagination-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentPage = parseInt(btn.dataset.page);
            renderProducts();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

// ==================== PRODUCT DATA FUNCTIONS ====================
function loadSampleProducts() {
    console.log('📦 Loading sample products...');
    
    // Sample products data
    products = [
        {
            id: 1,
            title: "Premium Baby Diapers",
            description: "Soft and absorbent diapers for your baby's comfort",
            category: "diapers-wipes",
            price: 899,
            originalPrice: 1199,
            discount: 25,
            rating: 4.5,
            reviewCount: 128,
            mainImageUrl: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Baby+Diapers",
            brand: "BabyComfort",
            inStock: true,
            stockQuantity: 50,
            images: [
                "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Baby+Diapers+1",
                "https://via.placeholder.com/300x300/60A5FA/FFFFFF?text=Baby+Diapers+2"
            ]
        },
        {
            id: 2,
            title: "Organic Baby Shampoo",
            description: "Gentle shampoo made with natural ingredients for sensitive skin",
            category: "skin-hair-care",
            price: 349,
            originalPrice: 499,
            discount: 30,
            rating: 4.8,
            reviewCount: 89,
            mainImageUrl: "https://via.placeholder.com/300x300/10B981/FFFFFF?text=Baby+Shampoo",
            brand: "NatureBaby",
            inStock: true,
            stockQuantity: 30,
            images: [
                "https://via.placeholder.com/300x300/10B981/FFFFFF?text=Shampoo+1",
                "https://via.placeholder.com/300x300/34D399/FFFFFF?text=Shampoo+2"
            ]
        },
        {
            id: 3,
            title: "Baby Feeding Bottle Set",
            description: "BPA-free feeding bottles with anti-colic technology",
            category: "feeding-nursing",
            price: 1299,
            originalPrice: 1599,
            discount: 19,
            rating: 4.3,
            reviewCount: 204,
            mainImageUrl: "https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Feeding+Bottle",
            brand: "FeedWell",
            inStock: true,
            stockQuantity: 25,
            images: [
                "https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Bottle+1",
                "https://via.placeholder.com/300x300/FBBF24/FFFFFF?text=Bottle+2"
            ]
        }
    ];
    
    filteredProducts = [...products];
    renderProducts();
    console.log(`✅ ${products.length} sample products loaded`);
}



// ==================== BANNER CAROUSEL ====================
function initializeBannerCarousel() {
    console.log("🖼️ Initializing banner carousel...");
    
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    console.log(`Found ${slides.length} slides and ${dots.length} dots`);
    
    if (slides.length === 0) {
        console.log('❌ No banner slides found');
        return;
    }
    
    // Show first slide
    showBannerSlide(0);
    
    // Set up automatic slideshow
    startBannerAutoSlide();
    
    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            console.log(`📍 Dot ${index} clicked`);
            currentBannerSlide = index;
            showBannerSlide(currentBannerSlide);
            resetBannerAutoSlide();
        });
    });
    
    // Pause on hover
    const bannerWrapper = document.getElementById('bannerWrapper');
    if (bannerWrapper) {
        bannerWrapper.addEventListener('mouseenter', pauseBannerAutoSlide);
        bannerWrapper.addEventListener('mouseleave', startBannerAutoSlide);
    }
    
    console.log("✅ Banner carousel initialized successfully");
}

function showBannerSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    
    // Update dots
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    currentBannerSlide = index;
    console.log(`🔄 Showing banner slide: ${index}`);
}

function nextBannerSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    currentBannerSlide = (currentBannerSlide + 1) % slides.length;
    showBannerSlide(currentBannerSlide);
}

function startBannerAutoSlide() {
    // Clear existing interval
    if (bannerInterval) {
        clearInterval(bannerInterval);
    }
    
    // Start new interval (change slide every 5 seconds)
    bannerInterval = setInterval(nextBannerSlide, 5000);
    console.log("▶️ Banner auto-slide started");
}

function pauseBannerAutoSlide() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        console.log("⏸️ Banner auto-slide paused");
    }
}

function resetBannerAutoSlide() {
    pauseBannerAutoSlide();
    startBannerAutoSlide();
}

// ==================== EVENT HANDLERS ====================
function toggleWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = wishlist.findIndex(p => p.id === productId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification("Removed from wishlist", "info");
    } else {
        wishlist.push(product);
        showNotification("Added to wishlist!", "success");
    }
    
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
    renderProducts(); // Re-render to update wishlist icons
}

function viewProductDetails(productId) {
    localStorage.setItem("selectedProductId", productId);
    window.location.href = "product-details.html";
}

function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (!el) {
        console.log('Cart count element not found');
        return;
    }
    
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    el.textContent = count;
    el.classList.toggle("hidden", count === 0);
}

function updateWishlistCount() {
    const el = document.getElementById("wishlistCount");
    if (!el) {
        console.log('Wishlist count element not found');
        return;
    }
    
    const count = wishlist.length;
    el.textContent = count;
    el.classList.toggle("hidden", count === 0);
}

// ==================== FILTERS & SORTING ====================
function setupEventListeners() {
    console.log("🔧 Setting up event listeners...");
    
    // Filter sidebar toggle
    const filterToggleBtn = document.getElementById("filterToggleBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");
    const filterOverlay = document.getElementById("filterOverlay");

    if (filterToggleBtn) {
        filterToggleBtn.addEventListener("click", toggleFilterSidebar);
    }
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener("click", toggleFilterSidebar);
    }
    if (filterOverlay) {
        filterOverlay.addEventListener("click", toggleFilterSidebar);
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById("clearFilters");
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", clearFilters);
    }

    // Sort select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", applySorting);
    }

    console.log("✅ Event listeners setup complete");
}

function toggleFilterSidebar() {
    const sidebar = document.getElementById("filterSidebar");
    const overlay = document.getElementById("filterOverlay");
    
    if (sidebar && overlay) {
        sidebar.classList.toggle("hidden-mobile");
        overlay.classList.toggle("hidden");
        document.body.classList.toggle("overflow-hidden");
    }
}

function clearFilters() {
    // Reset category
    const allCategory = document.querySelector('input[name="category"][value="all"]');
    if (allCategory) allCategory.checked = true;
    
    // Reset all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset sort
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = "default";
    
    // Reset products
    filteredProducts = [...products];
    currentPage = 1;
    renderProducts();
}

function applySorting() {
    const sortSelect = document.getElementById("sortSelect");
    if (!sortSelect) return;

    const sortValue = sortSelect.value;
    
    filteredProducts.sort((a, b) => {
        switch (sortValue) {
            case "price-low":
                return a.price - b.price;
            case "price-high":
                return b.price - a.price;
            case "rating":
                return b.rating - a.rating;
            case "newest":
                return b.id - a.id;
            default:
                return 0;
        }
    });

    currentPage = 1;
    renderProducts();
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Initializing Baby Care page...");
    
    // Initialize banner carousel FIRST
    initializeBannerCarousel();
    
    // Then load products and setup other functionality
    loadSampleProducts(); // CHANGED: Use sample data directly instead of API
    setupEventListeners();
    updateCartCount();
    updateWishlistCount();
    
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Clean up intervals when page unloads
window.addEventListener('beforeunload', () => {
    if (bannerInterval) {
        clearInterval(bannerInterval);
    }
});