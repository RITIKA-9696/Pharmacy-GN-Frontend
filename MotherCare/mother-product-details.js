const MOTHER_API_BASE_URL = "http://localhost:8083/api/mb/products";

let currentProduct = null;
let selectedSize = null;
let quantity = 1;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Mock reviews (replace with backend later)
const reviewsData = {
  1: [
    {
      id: 1,
      name: "Sarah M.",
      rating: 5,
      date: "2024-01-15",
      title: "Perfect maternity dress!",
      comment: "This dress is so comfortable and flattering. I wore it throughout my entire pregnancy and even after. The fabric is soft and stretchy, and the style is very elegant.",
      verified: true,
    },
    {
      id: 2,
      name: "Jennifer L.",
      rating: 4,
      date: "2024-01-10",
      title: "Great quality",
      comment: "Love the material and fit. The only reason I'm giving 4 stars instead of 5 is that I wish it came in more colors. But overall, very happy with this purchase.",
      verified: true,
    }
  ],
  2: [
    {
      id: 1,
      name: "Amanda K.",
      rating: 5,
      date: "2024-01-20",
      title: "Best prenatal vitamins",
      comment: "My doctor recommended these and I'm so glad I tried them. Easy to swallow and no nausea. My blood work has been perfect throughout my pregnancy.",
      verified: true,
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const productId = localStorage.getItem("selectedProductId");
  if (productId) {
    fetchProductDetails(parseInt(productId));
    setupEventListenersOnce();
    updateCartCount();
    updateWishlistCount();
  } else {
    window.location.href = "mother.html";
  }
});

async function fetchProductDetails(productId) {
  try {
    console.log('Fetching product details for:', productId);
    const response = await fetch(`${MOTHER_API_BASE_URL}/${productId}`);
   
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
   
    const productData = await response.json();
    console.log('Fetched product:', productData);
   
    currentProduct = transformProductData(productData);
    loadProductDetails();
    setupMagnifier();
    setupAccordion();
   
  } catch (error) {
    console.error('Fetch error:', error);
    showNotification('Failed to load product.', 'error');
    setTimeout(() => window.location.href = "./mother.html", 2000);
  }
}

function transformProductData(productData) {
  console.log('Transforming:', productData);
  // Sizes
  let sizes = ["One Size"];
  if (productData.sizes) {
    if (Array.isArray(productData.sizes)) {
      sizes = productData.sizes;
    } else if (typeof productData.sizes === 'string') {
      try {
        sizes = JSON.parse(productData.sizes);
      } catch {
        sizes = productData.sizes.split(',').map(s => s.trim()).filter(s => s);
      }
    }
  }

  // Images - FIXED: Use mainImageUrl & subImageUrls
  let images = [];
  let mainImageUrl = getPlaceholderImage();
  if (productData.mainImageUrl) {
    mainImageUrl = productData.mainImageUrl.startsWith('http')
      ? productData.mainImageUrl
      : `http://localhost:8083${productData.mainImageUrl}`;
    images.push(mainImageUrl);
  }
  if (productData.subImageUrls && Array.isArray(productData.subImageUrls)) {
    productData.subImageUrls.forEach(sub => {
      const url = sub.startsWith('http') ? sub : `http://localhost:8083${sub}`;
      images.push(url);
    });
  }
  if (images.length === 0) {
    images = [getPlaceholderImage(productData.title || 'Product')];
    mainImageUrl = images[0];
  }

  // Features
  let features = [];
  if (productData.features && Array.isArray(productData.features)) {
    features = productData.features;
  } else if (productData.description && Array.isArray(productData.description)) {
    features = productData.description.slice(0, 4);
  } else {
    features = ["High-quality materials", "Designed for comfort", "Safe for pregnancy", "Easy to use"];
  }

  // Specifications
  let specifications = {};
  if (productData.specifications) {
    if (typeof productData.specifications === 'string') {
      try {
        specifications = JSON.parse(productData.specifications);
      } catch {
        specifications = { "Details": productData.specifications };
      }
    } else if (typeof productData.specifications === 'object') {
      specifications = productData.specifications;
    }
  }
  if (Object.keys(specifications).length === 0) {
    specifications = {
      "Connectivity": "N/A",
      "Battery": "N/A",
      "Weight": "N/A"
    };
  }

  // Discount
  let discount = productData.discount || 0;
  if (!discount && productData.originalPrice && productData.price) {
    discount = Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100);
  }

  return {
    id: productData.id,
    title: productData.title || 'No Title',
    description: Array.isArray(productData.description)
      ? productData.description.join('. ')
      : (productData.description || "No description available"),
    category: productData.category || 'uncategorized',
    price: productData.price || 0,
    originalPrice: productData.originalPrice || productData.price,
    discount: discount,
    rating: productData.rating || 4.0,
    reviewCount: productData.reviewCount || 0,
    images: images,
    mainImageUrl: mainImageUrl,
    sizes: sizes,
    inStock: productData.inStock !== false,
    brand: productData.brand || 'Unknown Brand',
    stockQuantity: productData.stockQuantity || 0,
    specifications: specifications,
    features: features
  };
}

function getPlaceholderImage(text = 'Product') {
  return `https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(text)}`;
}

function loadProductDetails() {
  if (!currentProduct) return;
  document.getElementById("breadcrumbCategory").textContent = formatCategory(currentProduct.category);
  document.getElementById("breadcrumbProduct").textContent = currentProduct.title;
  document.getElementById("productTitle").textContent = currentProduct.title;
  document.getElementById("productDescription").textContent = currentProduct.description;
  document.getElementById("productPrice").textContent = `₹${currentProduct.price.toFixed(2)}`;
  document.getElementById("productBrand").textContent = `by ${currentProduct.brand}`;
  document.getElementById("productRating").innerHTML = generateStarRating(currentProduct.rating);
  document.getElementById("productReviewCount").textContent = `(${currentProduct.reviewCount} reviews)`;

  if (currentProduct.originalPrice > currentProduct.price) {
    document.getElementById("productOriginalPrice").textContent = `₹${currentProduct.originalPrice.toFixed(2)}`;
    document.getElementById("productOriginalPrice").classList.remove("hidden");
    document.getElementById("productDiscount").textContent = `${currentProduct.discount}% OFF`;
    document.getElementById("productDiscount").classList.remove("hidden");
  }

  updateStockStatus();
  loadProductImages();
  if (currentProduct.sizes.length > 0 && currentProduct.sizes[0] !== "One Size") {
    loadSizeOptions();
  }
  loadProductFeatures();
  loadProductSpecifications();
  loadProductReviews();
  updateWishlistButton();
}

function updateStockStatus() {
  const el = document.getElementById("stockStatus");
  const btn = document.getElementById("addToCartBtn");
  if (currentProduct.inStock && currentProduct.stockQuantity > 0) {
    el.textContent = `${currentProduct.stockQuantity} items left`;
    el.className = "text-green-600 font-medium";
    if (btn) {
      btn.disabled = false;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  } else {
    el.textContent = "Out of Stock";
    el.className = "text-red-600 font-medium";
    if (btn) {
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
}

function loadProductImages() {
  const mainImg = document.getElementById("mainImage");
  const magImg = document.getElementById("magnifiedImage");
  const thumbContainer = document.getElementById("thumbnailContainer");
  if (!mainImg || !magImg || !thumbContainer) return;

  if (!currentProduct.images?.length) {
    const placeholder = getPlaceholderImage(currentProduct.title);
    mainImg.src = placeholder;
    magImg.src = placeholder;
    thumbContainer.innerHTML = `<img src="${placeholder}" class="thumbnail thumbnail-active" loading="lazy">`;
    return;
  }

  const first = currentProduct.images[0];
  mainImg.src = first;
  magImg.src = first;
  mainImg.alt = currentProduct.title;

  thumbContainer.innerHTML = currentProduct.images.map((img, i) => `
    <img
      src="${img}"
      alt="${currentProduct.title} ${i+1}"
      class="thumbnail ${i===0?'thumbnail-active':''}"
      data-index="${i}"
      loading="lazy"
      onerror="this.src='${getPlaceholderImage(currentProduct.title)}'">
  `).join("");

  document.querySelectorAll(".thumbnail").forEach(thumb => {
    thumb.addEventListener("click", () => {
      const idx = thumb.dataset.index;
      mainImg.src = currentProduct.images[idx];
      magImg.src = currentProduct.images[idx];
      document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("thumbnail-active"));
      thumb.classList.add("thumbnail-active");
    });
  });

  mainImg.onerror = () => {
    mainImg.src = getPlaceholderImage(currentProduct.title);
    magImg.src = getPlaceholderImage(currentProduct.title);
  };
}

function setupMagnifier() {
  const main = document.getElementById("mainImage");
  const lens = document.getElementById("magnifierLens");
  const view = document.getElementById("magnifierView");
  const magImg = document.getElementById("magnifiedImage");
  if (!main || !lens || !view || !magImg) return;

  const ZOOM = 2.5;
  const LENS_SIZE = 120;
  const show = () => { if (window.innerWidth >= 1024) { lens.style.display = "block"; view.style.display = "block"; } };
  const hide = () => { lens.style.display = "none"; view.style.display = "none"; };

  main.addEventListener("mouseenter", show);
  main.addEventListener("mouseleave", hide);
  main.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 1024) return;
    const r = main.getBoundingClientRect();
    let x = e.clientX - r.left - LENS_SIZE/2;
    let y = e.clientY - r.top - LENS_SIZE/2;
    x = Math.max(0, Math.min(x, r.width - LENS_SIZE));
    y = Math.max(0, Math.min(y, r.height - LENS_SIZE));
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;
    magImg.style.width = `${r.width * ZOOM}px`;
    magImg.style.height = `${r.height * ZOOM}px`;
    magImg.style.left = `-${x * ZOOM}px`;
    magImg.style.top = `-${y * ZOOM}px`;
  });
}

function loadSizeOptions() {
  const sizeSelection = document.getElementById("sizeSelection");
  const sizeOptions = document.getElementById("sizeOptions");
  if (!sizeSelection || !sizeOptions) return;
  sizeSelection.classList.remove("hidden");
  sizeOptions.innerHTML = currentProduct.sizes.map(size => `
    <button class="size-option px-4 py-2 border border-gray-300 rounded-md hover:border-pink-500 hover:text-pink-600 transition-colors"
            data-size="${size}">
      ${size}
    </button>
  `).join("");
  document.querySelectorAll(".size-option").forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(".size-option").forEach(o => {
        o.classList.remove("bg-pink-600", "text-white", "border-pink-600");
        o.classList.add("border-gray-300");
      });
      option.classList.add("bg-pink-600", "text-white", "border-pink-600");
      option.classList.remove("border-gray-300");
      selectedSize = option.dataset.size;
    });
  });
}

function loadProductFeatures() {
  const container = document.getElementById("productFeatures");
  if (!container) return;
  container.innerHTML = currentProduct.features.map(f => `
    <li class="flex items-center text-gray-700">
      <i class="fas fa-check text-green-500 mr-2"></i>
      ${f}
    </li>
  `).join("");
}

function loadProductSpecifications() {
  const list = document.getElementById("specificationsList");
  if (!list) return;
  list.innerHTML = Object.entries(currentProduct.specifications).map(([k, v]) => `
    <div class="spec-row">
      <span class="font-medium text-gray-900">${k}</span>
      <span class="text-gray-700">${v}</span>
    </div>
  `).join("");
}

function loadProductReviews() {
  const reviews = reviewsData[currentProduct.id] || [];
  const avgRating = document.getElementById("avgRating");
  const avgRatingStars = document.getElementById("avgRatingStars");
  const totalReviews = document.getElementById("totalReviews");
  const ratingBreakdown = document.getElementById("ratingBreakdown");
  const reviewsList = document.getElementById("reviewsList");
  if (!avgRating || !avgRatingStars || !totalReviews || !ratingBreakdown || !reviewsList) return;

  avgRating.textContent = currentProduct.rating.toFixed(1);
  avgRatingStars.innerHTML = generateStarRating(currentProduct.rating);
  totalReviews.textContent = `Based on ${currentProduct.reviewCount} reviews`;

  const breakdown = calculateRatingBreakdown(reviews, currentProduct.reviewCount);
  ratingBreakdown.innerHTML = [5, 4, 3, 2, 1].map(stars => {
    const pct = breakdown[stars] || 0;
    return `
      <div class="flex items-center">
        <span class="text-sm text-gray-600 w-8">${stars} stars</span>
        <div class="flex-1 mx-2 rating-bar">
          <div class="rating-bar-fill" style="width: ${pct}%"></div>
        </div>
        <span class="text-sm text-gray-600 w-8">${pct}%</span>
      </div>
    `;
  }).join("");

  if (reviews.length === 0) {
    reviewsList.innerHTML = `<div class="text-center py-8 text-gray-500">No reviews yet. Be the first!</div>`;
  } else {
    reviewsList.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="flex items-center mb-2">
              <span class="font-semibold text-gray-900 mr-2">${r.name}</span>
              ${r.verified ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>' : ""}
            </div>
            <div class="flex items-center">
              <div class="flex text-yellow-400 mr-2">${generateStarRating(r.rating)}</div>
              <span class="text-sm text-gray-500">${formatDate(r.date)}</span>
            </div>
          </div>
        </div>
        <h4 class="font-semibold text-gray-900 mb-2">${r.title}</h4>
        <p class="text-gray-700">${r.comment}</p>
      </div>
    `).join("");
  }
}

function setupEventListeners() {
  document.getElementById("decreaseQty")?.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      document.getElementById("quantity").textContent = quantity;
    }
  });
  
  document.getElementById("increaseQty")?.addEventListener("click", () => {
    if (currentProduct.stockQuantity && quantity >= currentProduct.stockQuantity) {
      showNotification(`Only ${currentProduct.stockQuantity} left`, "error");
      return;
    }
    quantity++;
    document.getElementById("quantity").textContent = quantity;
  });
  
  // FIXED: Better event listener with error handling
  const addToCartBtn = document.getElementById("addToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function(e) {
      console.log("Add to cart button clicked - direct event");
      e.preventDefault();
      e.stopPropagation();
      addToCart();
    });
  } else {
    console.error("Add to cart button not found!");
  }
  
  document.getElementById("addToWishlistBtn")?.addEventListener("click", toggleWishlist);
  
  document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn, btn.id.replace("Tab", "Content")));
  });
  
  document.getElementById("cartBtn")?.addEventListener("click", showCartModal);
  document.getElementById("wishlistBtn")?.addEventListener("click", showWishlistModal);
}

// FIXED: Complete working addToCart function
function addToCart() {
  console.log("addToCart function called");
  
  if (!currentProduct) {
    console.error("No current product available");
    showNotification("Product not loaded", "error");
    return;
  }
  
  // Validation checks
  if (currentProduct.sizes && currentProduct.sizes.length > 0 && currentProduct.sizes[0] !== "One Size" && !selectedSize) {
    showNotification("Please select a size", "error");
    return;
  }
  
  if (!currentProduct.inStock || currentProduct.stockQuantity <= 0) {
    showNotification("Out of stock", "error");
    return;
  }

  const cartItem = {
    id: currentProduct.id,
    title: currentProduct.title,
    price: currentProduct.price,
    originalPrice: currentProduct.originalPrice || currentProduct.price,
    mainImageUrl: currentProduct.mainImageUrl,
    selectedSize: selectedSize || "One Size",
    quantity: quantity,
    prescriptionRequired: currentProduct.prescriptionRequired || false
  };

  console.log("Adding to cart:", cartItem);

  // Add to cart using the working method
  addToLocalCart(cartItem);

  // Reset quantity
  quantity = 1;
  document.getElementById("quantity").textContent = "1";
  
  console.log("Add to cart completed");
}

// FIXED: Complete working addToLocalCart function
function addToLocalCart(item) {
  console.log("addToLocalCart called with:", item);
  
  let localCart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Check if item already exists in cart (same ID and same size)
  const existingIndex = localCart.findIndex(i => 
    i.id === item.id && i.selectedSize === item.selectedSize
  );
  
  if (existingIndex > -1) {
    // Update quantity if item exists
    localCart[existingIndex].quantity += item.quantity;
    console.log("Updated existing item quantity:", localCart[existingIndex]);
  } else {
    // Add new item
    localCart.push(item);
    console.log("Added new item to cart");
  }
  
  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(localCart));
  
  // Update global cart variable
  cart = localCart;
  
  // Update UI
  updateCartCount();
  
  // Show success notification
  showNotificationWithAction(`Added ${item.quantity} ${item.quantity > 1 ? 'items' : 'item'} to cart!`, "success");
  
  console.log("Cart after addition:", localCart);
}

function showCartModal() {
    const modal = document.createElement("div");
    modal.id = "cartModal";
    modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b">
                <h2 class="text-2xl font-bold">Shopping Cart</h2>
                <button id="closeCartModal" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>
            </div>
            <div id="cartContent" class="p-6 overflow-y-auto max-h-96">
                ${cart.length === 0 ? `<p class="text-center text-gray-500">Your cart is empty</p>` : cart.map(item => `
                    <div class="flex items-center justify-between py-2 border-b">
                        <div>
                            <h4 class="text-sm font-semibold">${item.title}</h4>
                            <p class="text-sm text-gray-600">${item.selectedSize ? `Size: ${item.selectedSize}, ` : ''}₹${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <p class="text-sm font-bold">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `).join("")}
            </div>
            <div class="border-t p-6">
                <div class="flex justify-between mb-4">
                    <span class="text-lg font-semibold">Total:</span>
                    <span class="text-2xl font-bold text-pink-600">₹${cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
                <div class="flex space-x-4">
                    <button id="clearCart" class="flex-1 bg-gray-200 py-3 rounded-md hover:bg-gray-300">Clear Cart</button>
                    <button id="checkoutBtn" class="flex-1 bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector("#closeCartModal").onclick = () => modal.remove();
    
    modal.querySelector("#clearCart").onclick = () => { 
        cart.length = 0; 
        localStorage.setItem("cart", "[]"); 
        updateCartCount(); 
        modal.remove(); 
        showNotification("Cart cleared", "info"); 
    };
    
    modal.querySelector("#checkoutBtn").onclick = () => { 
        modal.remove(); 
        window.location.href = '../cart.html';
    };
    
    modal.onclick = e => { 
        if (e.target.id === "cartModal") modal.remove(); 
    };
}

function showWishlistModal() {
  const modal = document.createElement("div");
  modal.id = "wishlistModal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold">My Wishlist</h2>
        <button id="closeWishlistModal" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>
      </div>
      <div id="wishlistContent" class="p-6 overflow-y-auto max-h-96">
        ${wishlist.length === 0 ? `<p class="text-center text-gray-500">Your wishlist is empty</p>` : wishlist.map(item => `
          <div class="flex items-center justify-between py-2 border-b">
            <div>
              <h4 class="text-sm font-semibold">${item.title}</h4>
              <p class="text-sm text-gray-600">₹${item.price.toFixed(2)}</p>
            </div>
            <button class="text-pink-600 hover:text-pink-800" onclick="toggleWishlist(${item.id}); this.closest('#wishlistModal').remove(); showWishlistModal();">Remove</button>
          </div>
        `).join("")}
      </div>
      <div class="border-t p-6">
        <button id="clearWishlist" class="bg-gray-200 py-2 px-4 rounded-md hover:bg-gray-300">Clear Wishlist</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("#closeWishlistModal").onclick = () => modal.remove();
  modal.querySelector("#clearWishlist").onclick = () => { wishlist.length = 0; localStorage.setItem("wishlist", "[]"); updateWishlistCount(); modal.remove(); showNotification("Wishlist cleared", "info"); };
  modal.onclick = e => { if (e.target.id === "wishlistModal") modal.remove(); };
}

function setupAccordion() {
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector("i");
      const active = content.classList.contains("active");
      document.querySelectorAll(".accordion-content").forEach(c => {
        c.classList.remove("active");
        const prevIcon = c.previousElementSibling?.querySelector("i");
        if (prevIcon) prevIcon.classList.replace("fa-chevron-up", "fa-chevron-down");
      });
      if (!active) {
        content.classList.add("active");
        if (icon) icon.classList.replace("fa-chevron-down", "fa-chevron-up");
      }
    });
  });
}

// New function to show notification with action
function showNotificationWithAction(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-md text-white transition-all duration-300 ${
        type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="goToCart()" class="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition">
                View Cart
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Function to navigate to cart
window.goToCart = () => {
    window.location.href = '../cart.html';
};

function toggleWishlist() {
  const idx = wishlist.findIndex(i => i.id === currentProduct.id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showNotification("Removed from wishlist", "info");
  } else {
    wishlist.push(currentProduct);
    showNotification("Added to wishlist!", "success");
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
  updateWishlistButton();
}

function updateWishlistButton() {
  const btn = document.getElementById("addToWishlistBtn");
  if (!btn) return;
  const inWishlist = wishlist.some(i => i.id === currentProduct.id);
  btn.innerHTML = inWishlist ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
  btn.className = inWishlist ? "px-6 py-3 bg-pink-50 text-pink-600 rounded-md" : "px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-md hover:bg-pink-50";
}

function switchTab(btn, contentId) {
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
  document.getElementById(contentId)?.classList.remove("hidden");
}

function updateCartCount() {
    // Calculate total items from actual cart data
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = localCart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    console.log("Cart count updated:", count, "Items in cart:", localCart);
    
    // Update global cart variable
    cart = localCart;
    
    // Update localStorage with calculated count
    localStorage.setItem('cartCount', count.toString());
    
    // Update header cart count
    if (typeof window.updateCartCountInHeader === 'function') {
        window.updateCartCountInHeader(count);
    } else {
        // Fallback: update header directly
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.classList.toggle('hidden', count === 0);
        }
    }
    
    return count;
}

function updateWishlistCount() {
  const el = document.getElementById("wishlistCount");
  if (!el) return;
  const count = wishlist.length;
  el.textContent = count;
  el.classList.toggle("hidden", count === 0);
}

function generateStarRating(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '<i class="fas fa-star text-yellow-400"></i>'.repeat(full) +
         (half ? '<i class="fas fa-star-half-alt text-yellow-400"></i>' : '') +
         '<i class="far fa-star text-yellow-400"></i>'.repeat(empty);
}

function formatCategory(str) {
  return str.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function calculateRatingBreakdown(reviews, total) {
  const map = {};
  reviews.forEach(r => map[r.rating] = (map[r.rating] || 0) + 1);
  Object.keys(map).forEach(k => map[k] = Math.round((map[k] / total) * 100));
  return map;
}

function showNotification(msg, type = "info") {
  const n = document.createElement("div");
  n.className = `fixed top-20 right-4 z-50 px-4 py-2 rounded-md text-white transition-all ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"}`;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// Debug function to check cart state
window.debugCart = function() {
  console.log("Current cart:", cart);
  console.log("LocalStorage cart:", JSON.parse(localStorage.getItem("cart") || "[]"));
  alert(`Cart items: ${cart.length}\nLocalStorage: ${localStorage.getItem("cart")}`);
};

// Add this temporary debug function to test the button
window.testButton = function() {
  console.log("Test button function called");
  const btn = document.getElementById("addToCartBtn");
  console.log("Button element:", btn);
  if (btn) {
    btn.addEventListener("click", function() {
      console.log("Button click event fired!");
    });
  }
};

