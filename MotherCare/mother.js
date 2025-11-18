// Product data - This will now be fetched from backend
let products = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// API Base URL
const MOTHER_API_BASE_URL = "http://localhost:8083/api/mb/products/get-all";

// Fetch products from backend
async function fetchProducts() {
  try {
    console.log('Fetching products from:', `${MOTHER_API_BASE_URL}`);
    const response = await fetch(`${MOTHER_API_BASE_URL}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const productsData = await response.json();
    console.log('Fetched products from backend:', productsData);
    
    if (!Array.isArray(productsData)) {
      throw new Error('Invalid response format: expected array');
    }
    
    // Transform backend data to frontend format
    products = productsData.map(product => {
      console.log('Processing product:', product);
      
      // Handle sizes - ensure it's always an array
      let sizes = ["One Size"];
      if (product.sizes) {
        if (Array.isArray(product.sizes)) {
          sizes = product.sizes;
        } else if (typeof product.sizes === 'string') {
          try {
            sizes = JSON.parse(product.sizes);
          } catch (e) {
            sizes = product.sizes.split(',').map(s => s.trim());
          }
        }
      }
      
      // Handle images - CORRECTED: Use mainImageUrl & subImageUrls
      let images = [];
      let mainImageUrl = getPlaceholderImage(); // fallback

      // Add main image URL
      if (product.mainImageUrl) {
        mainImageUrl = product.mainImageUrl.startsWith('http')
          ? product.mainImageUrl
          : `http://localhost:8083${product.mainImageUrl}`;
        console.log('Main image URL:', mainImageUrl);
        images.push(mainImageUrl);
      }

      // Add sub image URLs
      if (product.subImageUrls && Array.isArray(product.subImageUrls)) {
        product.subImageUrls.forEach(subImage => {
          const subImageUrl = subImage.startsWith('http')
            ? subImage
            : `http://localhost:8083${subImage}`;
          console.log('Sub image URL:', subImageUrl);
          images.push(subImageUrl);
        });
      }

      // Fallback if no images
      if (images.length === 0) {
        console.log('No images found, using placeholder');
        images = [getPlaceholderImage(product.title || 'Product Image')];
        mainImageUrl = images[0];
      }
      
      console.log('Final images for product:', images);
      
      return {
        id: product.id,
        title: product.title || 'No Title',
        description: product.description ? 
          (Array.isArray(product.description) ? product.description.join('. ') : product.description) 
          : "No description available",
        category: product.category || 'uncategorized',
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        discount: product.discount || 0,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        images: images,
        mainImageUrl: mainImageUrl, // ADD THIS FOR CART
        sizes: sizes,
        inStock: product.inStock !== undefined ? product.inStock : true,
        brand: product.brand || 'Unknown Brand',
        stockQuantity: product.stockQuantity || 0,
        specifications: product.specifications || ""
      };
    });
    
    console.log('Transformed products:', products);
    filteredProducts = [...products];
    renderProducts();
    updateResultsCount();
  } catch (error) {
    console.error('Error fetching products:', error);
    showNotification('Failed to load products. Please try again later.', 'error');
    products = [];
    filteredProducts = [];
    renderProducts();
    updateResultsCount();
  }
}

// Create a data URL placeholder image to avoid 404 errors
function getPlaceholderImage() {
  return 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Product+Image';
}

// Fallback local products
function loadLocalProducts() {
  console.log('Loading local products as fallback');
  products = [
    {
      id: 1,
      title: "Maternity Maxi Dress",
      description: "Comfortable and stylish maxi dress for expecting mothers",
      category: "maternity-wear",
      price: 3817.17,
      originalPrice: 4979.17,
      discount: 23,
      rating: 4.5,
      reviewCount: 128,
      images: [
        getPlaceholderImage('Maternity Dress'),
        getPlaceholderImage('Maternity Dress'),
        getPlaceholderImage('Maternity Dress'),
        getPlaceholderImage('Maternity Dress'),
      ],
      mainImageUrl: getPlaceholderImage('Maternity Dress'),
      sizes: ["S", "M", "L", "XL"],
      inStock: true,
      brand: "MomStyle",
    },
    {
      id: 2,
      title: "Prenatal Vitamins - 90 Count",
      description: "Essential vitamins for healthy pregnancy",
      category: "nutrition",
      price: 2489.17,
      originalPrice: 3319.17,
      discount: 25,
      rating: 4.8,
      reviewCount: 256,
      images: [
        getPlaceholderImage('Prenatal Vitamins'),
        getPlaceholderImage('Prenatal Vitamins'),
        getPlaceholderImage('Prenatal Vitamins'),
        getPlaceholderImage('Prenatal Vitamins'),
      ],
      mainImageUrl: getPlaceholderImage('Prenatal Vitamins'),
      inStock: true,
      brand: "VitaMom",
    },
    {
      id: 3,
      title: "Stretch Mark Prevention Cream",
      description: "Natural ingredients to prevent and reduce stretch marks",
      category: "skincare",
      price: 2074.17,
      originalPrice: 2904.17,
      discount: 29,
      rating: 4.3,
      reviewCount: 89,
      images: [
        getPlaceholderImage('Stretch Mark Cream'),
        getPlaceholderImage('Stretch Mark Cream'),
        getPlaceholderImage('Stretch Mark Cream'),
        getPlaceholderImage('Stretch Mark Cream'),
      ],
      mainImageUrl: getPlaceholderImage('Stretch Mark Cream'),
      inStock: true,
      brand: "Medaderma",
    }
  ];
  filteredProducts = [...products];
  renderProducts();
  updateResultsCount();
}

// Initialize mother page function
function initializeMotherPage() {
  console.log('Initializing mother page...');
  updateCartCount();
  updateWishlistCount();
  fetchProducts();
  setupEventListeners();
  initializeBanner();
}

// Initialize banner function
function initializeBanner() {
  const slides = document.querySelectorAll("#bannerWrapper .slide");
  const dots = document.querySelectorAll("section .absolute.bottom-4 button");
  
  if (slides.length === 0 || dots.length === 0) {
    console.log('Banner elements not found');
    return;
  }
  
  let current = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (slide) slide.style.opacity = (i === index) ? "1" : "0";
      if (dots[i]) {
        dots[i].classList.remove("active-dot");
        dots[i].classList.remove("bg-white");
        dots[i].classList.add("bg-white/50");
      }
    });
    if (dots[index]) {
      dots[index].classList.add("active-dot");
      dots[index].classList.add("bg-white");
      dots[index].classList.remove("bg-white/50");
    }
    current = index;
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 3000);
  }

  dots.forEach((dot, index) => {
    if (dot) {
      dot.addEventListener("click", () => {
        clearInterval(slideInterval);
        showSlide(index);
        startAutoSlide();
      });
    }
  });

  showSlide(current);
  startAutoSlide();
}

// HTML Template Functions
function getDiscountBadge(discount) {
  return discount > 0
    ? `<div class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
         ${discount}% OFF
       </div>`
    : "";
}

function getWishlistIcon(isInWishlist) {
  return isInWishlist ? "fas fa-heart text-pink-500" : "far fa-heart text-gray-400";
}

function getCarouselImages(images, title, productId, mainImageUrl) {
  let allImages = [];

  if (mainImageUrl && mainImageUrl.trim() !== '') {
    allImages.push(mainImageUrl);
  }

  if (images && Array.isArray(images)) {
    images.forEach(img => {
      if (img && img.trim() !== '' && img !== mainImageUrl) {
        allImages.push(img);
      }
    });
  }

  if (allImages.length === 0) {
    allImages = [getPlaceholderImage(title)];
  }

  return `
    <div id="carousel-${productId}" class="flex transition-transform duration-300 ease-in-out h-full">
      ${allImages
        .map(
          (image, index) => `
          <img 
            src="${image}" 
            alt="${title} - ${index + 1}" 
            class="w-full h-full object-contain flex-shrink-0 image-zoom"
            loading="lazy"
            onerror="this.onerror=null; this.src='${getPlaceholderImage(title)}'">
        `
        )
        .join("")}
    </div>
    <button id="prev-${productId}" class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <i class="fas fa-chevron-left text-gray-600"></i>
    </button>
    <button id="next-${productId}" class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <i class="fas fa-chevron-right text-gray-600"></i>
    </button>
    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
      ${allImages
        .map(
          (_, index) => `
          <button class="carousel-dot w-2 h-2 rounded-full bg-white/60 hover:bg-white transition-all" data-index="${index}"></button>
        `
        )
        .join("")}
    </div>
  `;
}

function getPriceDisplay(price, originalPrice) {
  return `
    <span class="text-xl font-bold text-pink-600">₹${price ? price.toFixed(2) : '0.00'}</span>
    ${
      originalPrice > price
        ? `<span class="ml-2 text-sm text-gray-500 line-through">₹${originalPrice.toFixed(2)}</span>`
        : ""
    }
  `;
}

function getSizesDisplay(sizes) {
  return sizes && sizes.length > 0
    ? `<div class="mb-3"><span class="text-sm text-gray-600">Sizes: ${sizes.join(", ")}</span></div>`
    : "";
}

// Create product card
function createProductCard(product) {
  const isInWishlist = wishlist.some((item) => item.id === product.id);
  return `
    <div class="product-card">
      <div class="relative group">
        ${getDiscountBadge(product.discount || 0)}
        <button id="wishlist-${product.id}" class="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
          <i class="${getWishlistIcon(isInWishlist)}"></i>
        </button>
        <div class="relative h-64 overflow-hidden">
          ${getCarouselImages(product.images || [], product.title, product.id, product.mainImageUrl)}
        </div>
      </div>
      <div class="content">
        <div class="text-content">
          <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">${product.title || 'No Title'}</h3>
          <p class="text-sm text-gray-600 line-clamp-2">${product.description || 'No description available'}</p>
          <div class="flex items-center">
            <div class="flex text-yellow-400">
              ${generateStarRating(product.rating || 0)}
            </div>
            <span class="ml-2 text-sm text-gray-600">(${product.reviewCount || 0})</span>
          </div>
          <div class="flex items-center">
            ${getPriceDisplay(product.price || 0, product.originalPrice || 0)}
          </div>
          ${getSizesDisplay(product.sizes || [])}
        </div>
        <div class="button-container">
          <button id="view-details-${product.id}" class="view-details">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
}

function getEmptyCartTemplate() {
  return `
    <div class="text-center py-8">
      <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
      <p class="text-gray-500">Add some products to get started!</p>
    </div>
  `;
}

function getCartItemTemplate(item) {
  const imageUrl = item.mainImageUrl || (item.images && item.images[0]) || getPlaceholderImage();
  return `
    <div class="flex items-center space-x-4 py-4 border-b last:border-b-0">
      <img src="${imageUrl}" alt="${item.title}" class="w-16 h-16 object-cover rounded-md">
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900">${item.title}</h4>
        <p class="text-sm text-gray-600">₹${item.price ? item.price.toFixed(2) : '0.00'}</p>
      </div>
      <div class="flex items-center space-x-2">
        <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300">
          <i class="fas fa-minus text-xs"></i>
        </button>
        <span class="w-8 text-center font-semibold">${item.quantity}</span>
        <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" 
                class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300">
          <i class="fas fa-plus text-xs"></i>
        </button>
      </div>
      <div class="text-right">
        <p class="font-semibold text-gray-900">₹${((item.price || 0) * item.quantity).toFixed(2)}</p>
        <button onclick="removeFromCart(${item.id})" 
                class="text-red-500 hover:text-red-700 text-sm">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    </div>
  `;
}

function getEmptyWishlistTemplate() {
  return `
    <div class="text-center py-8">
      <i class="fas fa-heart text-6xl text-gray-300 mb-4"></i>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
      <p class="text-gray-500">Save items you love for later!</p>
    </div>
  `;
}

function getWishlistItemTemplate(item) {
  return `
    <div class="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
      <img src="${item.mainImageUrl || (item.images && item.images[0]) || getPlaceholderImage('Product')}" alt="${item.title}" class="w-20 h-20 object-cover rounded-md">
      <div class="flex-1">
        <h4 class="font-semibold text-gray-900 mb-1">${item.title}</h4>
        <p class="text-sm text-gray-600 mb-2">${item.description}</p>
        <div class="flex items-center space-x-2">
          ${getPriceDisplay(item.price || 0, item.originalPrice || 0)}
        </div>
        <div class="flex text-yellow-400 text-sm mt-1">
          ${generateStarRating(item.rating || 0)}
          <span class="ml-2 text-gray-600">(${item.reviewCount || 0})</span>
        </div>
      </div>
      <div class="flex flex-col space-y-2">
        <button onclick="addToCart(${item.id})" 
                class="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors text-sm">
          <i class="fas fa-shopping-cart mr-1"></i> Add to Cart
        </button>
        <button onclick="removeFromWishlist(${item.id})" 
                class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm">
          <i class="fas fa-trash mr-1"></i> Remove
        </button>
      </div>
    </div>
  `;
}

function getEmptyProductsTemplate() {
  return `
    <div class="col-span-full text-center py-12">
      <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
      <p class="text-gray-500">Try adjusting your filters or search terms</p>
    </div>
  `;
}

function getPaginationButton(page, isActive, icon = "") {
  return `
    <button class="pagination-btn px-3 py-2 rounded-md transition-colors ${
      isActive ? "bg-pink-600 text-white" : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
    }" data-page="${page}">${icon || page}</button>
  `;
}

// Initialize the mother page
document.addEventListener("DOMContentLoaded", () => {
  initializeMotherPage();
});

// Event listeners setup
function setupEventListeners() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const filterOverlay = document.getElementById("filterOverlay");
  const searchInput = document.getElementById("searchInput");
  const mobileSearchInput = document.getElementById("mobileSearchInput");
  const sortSelect = document.getElementById("sortSelect");
  const clearFilters = document.getElementById("clearFilters");
  const cartBtn = document.getElementById("cartBtn");
  const wishlistBtn = document.getElementById("wishlistBtn");
  const closeCartModal = document.getElementById("closeCartModal");
  const closeWishlistModal = document.getElementById("closeWishlistModal");
  const clearCart = document.getElementById("clearCart");
  const clearWishlist = document.getElementById("clearWishlist");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const cartModal = document.getElementById("cartModal");
  const wishlistModal = document.getElementById("wishlistModal");

  if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  if (filterToggleBtn) filterToggleBtn.addEventListener("click", toggleFilterSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeFilterSidebar);
  if (filterOverlay) filterOverlay.addEventListener("click", closeFilterSidebar);
  if (searchInput) searchInput.addEventListener("input", handleSearch);
  if (mobileSearchInput) mobileSearchInput.addEventListener("input", handleSearch);
  if (sortSelect) sortSelect.addEventListener("change", handleSort);
  
  document.querySelectorAll(".category-filter").forEach((filter) => {
    filter.addEventListener("change", applyFilters);
  });
  document.querySelectorAll(".price-filter").forEach((filter) => {
    filter.addEventListener("change", applyFilters);
  });
  document.querySelectorAll(".rating-filter").forEach((filter) => {
    filter.addEventListener("change", applyFilters);
  });
  document.querySelectorAll(".discount-filter").forEach((filter) => {
    filter.addEventListener("change", applyFilters);
  });
  
  if (clearFilters) clearFilters.addEventListener("click", clearAllFilters);
  if (cartBtn) cartBtn.addEventListener("click", showCart);
  if (wishlistBtn) wishlistBtn.addEventListener("click", showWishlist);
  if (closeCartModal) closeCartModal.addEventListener("click", closeCartModal);
  if (closeWishlistModal) closeWishlistModal.addEventListener("click", closeWishlistModal);
  if (clearCart) clearCart.addEventListener("click", clearCart);
  if (clearWishlist) clearWishlist.addEventListener("click", clearWishlistItems);
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);
  
  if (cartModal) {
    cartModal.addEventListener("click", (e) => {
      if (e.target.id === "cartModal") closeCartModal();
    });
  }
  
  if (wishlistModal) {
    wishlistModal.addEventListener("click", (e) => {
      if (e.target.id === "wishlistModal") closeWishlistModal();
    });
  }
}

// Mobile menu functions
function toggleMobileMenu() {
  console.log("Mobile menu toggled");
}

function toggleFilterSidebar() {
  const sidebar = document.getElementById("filterSidebar");
  const overlay = document.getElementById("filterOverlay");
  if (sidebar && overlay) {
    sidebar.classList.remove("hidden-mobile");
    overlay.classList.remove("hidden");
    sidebar.style.position = "fixed";
    sidebar.style.top = "0";
    sidebar.style.left = "0";
    sidebar.style.height = "100vh";
    sidebar.style.zIndex = "50";
    sidebar.style.overflowY = "auto";
  }
}

function closeFilterSidebar() {
  const sidebar = document.getElementById("filterSidebar");
  const overlay = document.getElementById("filterOverlay");
  if (sidebar && overlay) {
    sidebar.classList.add("hidden-mobile");
    overlay.classList.add("hidden");
    sidebar.style.position = "";
    sidebar.style.top = "";
    sidebar.style.left = "";
    sidebar.style.height = "";
    sidebar.style.zIndex = "";
    sidebar.style.overflowY = "";
  }
}

// Search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          (product.title && product.title.toLowerCase().includes(searchTerm)) ||
          (product.description && product.description.toLowerCase().includes(searchTerm)) ||
          (product.category && product.category.toLowerCase().includes(searchTerm)),
      )
    : [...products];
  currentPage = 1;
  renderProducts();
  updateResultsCount();
}

// Sort functionality
function handleSort(e) {
  const sortValue = e.target.value;
  switch (sortValue) {
    case "price-low":
      filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price-high":
      filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "rating":
      filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "newest":
      filteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0));
      break;
    default:
      filteredProducts = [...products];
  }
  currentPage = 1;
  renderProducts();
}

// Filter functionality
function applyFilters() {
  let filtered = [...products];
  
  const selectedCategory = document.querySelector('input[name="category"]:checked');
  if (selectedCategory && selectedCategory.value !== "all") {
    const categoryMap = {
      'maternity-wear': 'Maternity Wear',
      'nutrition': 'Pregnancy Nutrition',
      'skincare': 'Skincare for Moms',
      'trimester-kits': 'Trimester Kits',
      'postpartum': 'Postpartum Recovery',
      'breastfeeding': 'Breastfeeding Essentials'
    };
    
    const backendCategory = categoryMap[selectedCategory.value] || selectedCategory.value;
    filtered = filtered.filter((product) => product.category === backendCategory);
  }
  
  const priceFilters = document.querySelectorAll(".price-filter:checked");
  if (priceFilters.length > 0) {
    filtered = filtered.filter((product) =>
      Array.from(priceFilters).some((filter) => {
        const min = Number.parseInt(filter.dataset.min);
        const max = Number.parseInt(filter.dataset.max);
        return (product.price || 0) >= min && (product.price || 0) <= max;
      }),
    );
  }
  
  const ratingFilters = document.querySelectorAll(".rating-filter:checked");
  if (ratingFilters.length > 0) {
    filtered = filtered.filter((product) =>
      Array.from(ratingFilters).some((filter) => {
        const minRating = Number.parseInt(filter.dataset.rating);
        return (product.rating || 0) >= minRating;
      }),
    );
  }
  
  const discountFilters = document.querySelectorAll(".discount-filter:checked");
  if (discountFilters.length > 0) {
    filtered = filtered.filter((product) =>
      Array.from(discountFilters).some((filter) => {
        const minDiscount = Number.parseInt(filter.dataset.discount);
        return (product.discount || 0) >= minDiscount;
      }),
    );
  }
  
  filteredProducts = filtered;
  currentPage = 1;
  renderProducts();
  updateResultsCount();
}

function clearAllFilters() {
  const allCategory = document.querySelector('input[name="category"][value="all"]');
  if (allCategory) allCategory.checked = true;
  document.querySelectorAll(".price-filter").forEach((filter) => (filter.checked = false));
  document.querySelectorAll(".rating-filter").forEach((filter) => (filter.checked = false));
  document.querySelectorAll(".discount-filter").forEach((filter) => (filter.checked = false));
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "default";
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  const mobileSearchInput = document.getElementById("mobileSearchInput");
  if (mobileSearchInput) mobileSearchInput.value = "";
  filteredProducts = [...products];
  currentPage = 1;
  renderProducts();
  updateResultsCount();
  
  const categoryTitle = document.getElementById('categoryTitle');
  if (categoryTitle) categoryTitle.textContent = 'All Products';
}

// Update results count
function updateResultsCount() {
  const resultsCount = document.getElementById("resultsCount");
  if (resultsCount) {
    const total = filteredProducts.length;
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, total);
    resultsCount.textContent = total === 0 ? "No products found" : `Showing ${start}-${end} of ${total} products`;
  }
}

// Cart and wishlist functions
function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.classList.toggle("hidden", count === 0);
  }
}

function updateWishlistCount() {
  const wishlistCount = document.getElementById("wishlistCount");
  if (wishlistCount) {
    const count = wishlist.length;
    wishlistCount.textContent = count;
    wishlistCount.classList.toggle("hidden", count === 0);
  }
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Product added to cart!", "success");
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
  showNotification("Item removed from cart", "info");
}

function updateCartQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
  }
}

function toggleWishlist(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  
  const existingIndex = wishlist.findIndex((item) => item.id === productId);
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
    showNotification("Removed from wishlist", "info");
  } else {
    wishlist.push(product);
    showNotification("Added to wishlist!", "success");
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
  renderProducts();
  if (!document.getElementById("wishlistModal").classList.contains("hidden")) {
    renderWishlistItems();
  }
}

function removeFromWishlist(productId) {
  wishlist = wishlist.filter((item) => item.id !== productId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
  renderWishlistItems();
  renderProducts();
  showNotification("Removed from wishlist", "info");
}

function showCart() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.classList.remove("hidden");
    renderCartItems();
  }
}

function closeCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) cartModal.classList.add("hidden");
}

function showWishlist() {
  const wishlistModal = document.getElementById("wishlistModal");
  if (wishlistModal) {
    wishlistModal.classList.remove("hidden");
    renderWishlistItems();
  }
}

function closeWishlistModal() {
  const wishlistModal = document.getElementById("wishlistModal");
  if (wishlistModal) wishlistModal.classList.add("hidden");
}

function renderCartItems() {
  const cartContent = document.getElementById("cartContent");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartContent || !cartTotal) return;
  
  if (cart.length === 0) {
    cartContent.innerHTML = getEmptyCartTemplate();
    cartTotal.textContent = "₹0.00";
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  cartTotal.textContent = `₹${total.toFixed(2)}`;
  cartContent.innerHTML = cart.map(getCartItemTemplate).join("");
}

function renderWishlistItems() {
  const wishlistContent = document.getElementById("wishlistContent");
  if (!wishlistContent) return;
  
  if (wishlist.length === 0) {
    wishlistContent.innerHTML = getEmptyWishlistTemplate();
    return;
  }
  wishlistContent.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${wishlist
    .map(getWishlistItemTemplate)
    .join("")}</div>`;
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    showNotification("Cart cleared", "info");
  }
}

function clearWishlistItems() {
  if (wishlist.length === 0) return;
  if (confirm("Are you sure you want to clear your wishlist?")) {
    wishlist = [];
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistCount();
    renderWishlistItems();
    renderProducts();
    showNotification("Wishlist cleared", "info");
  }
}

function checkout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty", "error");
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  alert(`Checkout functionality would be implemented here.\n\nOrder Summary:\n${cart.length} items\nTotal: ₹${total.toFixed(2)}`);
  if (confirm("Simulate successful checkout? This will clear your cart.")) {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    closeCartModal();
    showNotification("Order placed successfully! (Demo)", "success");
  }
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-md text-white transition-all duration-300 ${
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Render products function
function renderProducts() {
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;
  
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);
  productsGrid.innerHTML = productsToShow.length === 0 ? getEmptyProductsTemplate() : productsToShow.map(createProductCard).join("");
  productsToShow.forEach((product) => {
    const wishlistBtn = document.getElementById(`wishlist-${product.id}`);
    if (wishlistBtn) wishlistBtn.addEventListener("click", () => toggleWishlist(product.id));
    const viewDetailsBtn = document.getElementById(`view-details-${product.id}`);
    if (viewDetailsBtn) viewDetailsBtn.addEventListener("click", () => viewProductDetails(product.id));
    setupImageCarousel(product.id);
  });
  renderPagination();
  updateResultsCount();
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  let starsHTML = "";
  for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
  if (hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
  for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
  return starsHTML;
}

function setupImageCarousel(productId) {
  const carousel = document.getElementById(`carousel-${productId}`);
  const prevBtn = document.getElementById(`prev-${productId}`);
  const nextBtn = document.getElementById(`next-${productId}`);
  const dots = carousel ? carousel.parentElement.querySelectorAll(".carousel-dot") : [];
  
  if (!carousel || !prevBtn || !nextBtn) return;
  
  let currentIndex = 0;
  const totalImages = dots.length;
  
  function updateCarousel() {
    const translateX = -currentIndex * 100;
    carousel.style.transform = `translateX(${translateX}%)`;
    dots.forEach((dot, index) => {
      if (dot) {
        dot.classList.toggle("bg-opacity-100", index === currentIndex);
        dot.classList.toggle("bg-opacity-60", index !== currentIndex);
      }
    });
  }
  
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    updateCarousel();
  });
  
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    updateCarousel();
  });
  
  dots.forEach((dot, index) => {
    if (dot) {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = index;
        updateCarousel();
      });
    }
  });
  
  setInterval(() => {
    currentIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    updateCarousel();
  }, 5000);
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }
  
  let paginationHTML = "";
  if (currentPage > 1) {
    paginationHTML += getPaginationButton(currentPage - 1, false, '<i class="fas fa-chevron-left"></i>');
  }
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  if (startPage > 1) {
    paginationHTML += getPaginationButton(1, false);
    if (startPage > 2) paginationHTML += '<span class="px-2 text-gray-400">...</span>';
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += getPaginationButton(i, i === currentPage);
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) paginationHTML += '<span class="px-2 text-gray-400">...</span>';
    paginationHTML += getPaginationButton(totalPages, false);
  }
  
  if (currentPage < totalPages) {
    paginationHTML += getPaginationButton(currentPage + 1, false, '<i class="fas fa-chevron-right"></i>');
  }
  
  pagination.innerHTML = paginationHTML;
  
  document.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = Number.parseInt(btn.dataset.page);
      renderProducts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function viewProductDetails(productId) {
  localStorage.setItem("selectedProductId", productId);
  window.location.href = "mother-product-details.html";
}
