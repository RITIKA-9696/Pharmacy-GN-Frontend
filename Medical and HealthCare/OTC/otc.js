// ==================== otc.js – WITH CATEGORIZED PRODUCTS ====================

// Global State
let filteredProducts = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentPage = 1;
const pageSize = 12;

// Persistent Filter State - MOVE THIS TO TOP
let filterState = {
  category: 'all',
  brand: 'all',
  discount: 0,
  minPrice: 0,
  maxPrice: 2000,
  sort: 'default'
};

const allProducts = [
  // Ayurvedic Medicines
  { 
    id: 1, 
    title: "Dabur Chyawanprash 1kg", 
    price: 450, 
    originalPrice: 550, 
    discount: 18, 
    rating: 4.7, 
    reviewCount: 2350,
    category: "ayurvedic", 
    brand: "Dabur", 
    image: "https://images.unsplash.com/photo-1599932887768-d6cb80133949?w=400&h=400&fit=crop",
    description: "Immunity booster with natural herbs",
    inStock: true 
  },
  { 
    id: 2, 
    title: "Himalaya Liv.52 DS", 
    price: 135, 
    originalPrice: 180, 
    discount: 25, 
    rating: 4.5, 
    reviewCount: 2780,
    category: "ayurvedic", 
    brand: "Himalaya", 
    image: "https://images.unsplash.com/photo-1550572017-4876b7788da6?w=400&h=400&fit=crop",
    description: "Liver protection formula",
    inStock: true 
  },
  { 
    id: 3, 
    title: "Zandu Balm 10g", 
    price: 65, 
    originalPrice: 85, 
    discount: 24, 
    rating: 4.6, 
    reviewCount: 1890,
    category: "ayurvedic", 
    brand: "Zandu", 
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    description: "Ayurvedic pain relief balm",
    inStock: true 
  },
  { 
    id: 4, 
    title: "Baidyanath Ashwagandha", 
    price: 320, 
    originalPrice: 400, 
    discount: 20, 
    rating: 4.4, 
    reviewCount: 1250,
    category: "ayurvedic", 
    brand: "Baidyanath", 
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop",
    description: "Stress relief and energy booster",
    inStock: false 
  },

  // Allergy
  { 
    id: 5, 
    title: "Cetirizine 10mg (10 tablets)", 
    price: 45, 
    originalPrice: 60, 
    discount: 25, 
    rating: 4.3, 
    reviewCount: 980,
    category: "allergy", 
    brand: "Micro Labs", 
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=400&fit=crop",
    description: "Fast relief from allergy symptoms",
    inStock: true 
  },
  { 
    id: 6, 
    title: "Allegra 120mg (10 tablets)", 
    price: 280, 
    originalPrice: 350, 
    discount: 20, 
    rating: 4.6, 
    reviewCount: 1670,
    category: "allergy", 
    brand: "Sun Pharma", 
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop",
    description: "Non-drowsy allergy relief",
    inStock: true 
  },
  { 
    id: 7, 
    title: "Eno Lemon 5g x30", 
    price: 135, 
    originalPrice: 180, 
    discount: 25, 
    rating: 4.4, 
    reviewCount: 1560,
    category: "allergy", 
    brand: "GSK", 
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
    description: "Instant relief from acidity and heartburn",
    inStock: true 
  },

  // Fever & Flu
  { 
    id: 8, 
    title: "Dolo 650 Tablet (15 strips)", 
    price: 32, 
    originalPrice: 45, 
    discount: 29, 
    rating: 4.5, 
    reviewCount: 1250,
    category: "fever", 
    brand: "Micro Labs", 
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    description: "Paracetamol 650mg for fever and pain relief",
    inStock: true 
  },
  { 
    id: 9, 
    title: "Crocin Advance (10 tablets)", 
    price: 28, 
    originalPrice: 40, 
    discount: 30, 
    rating: 4.6, 
    reviewCount: 2100,
    category: "fever", 
    brand: "GSK", 
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop",
    description: "Optizorb technology for fast relief",
    inStock: true 
  },
  { 
    id: 10, 
    title: "Vicks VapoRub 25ml", 
    price: 98, 
    originalPrice: 125, 
    discount: 22, 
    rating: 4.8, 
    reviewCount: 3450,
    category: "fever", 
    brand: "P&G", 
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
    description: "Relief from cold, cough and congestion",
    inStock: true 
  },

  // Pain Relief
  { 
    id: 11, 
    title: "Saridon Tablet (10 tablets)", 
    price: 42, 
    originalPrice: 55, 
    discount: 24, 
    rating: 4.3, 
    reviewCount: 890,
    category: "pain", 
    brand: "Piramal", 
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop",
    description: "Fast-acting headache relief",
    inStock: true 
  },
  { 
    id: 12, 
    title: "Volini Gel 30g", 
    price: 115, 
    originalPrice: 150, 
    discount: 23, 
    rating: 4.7, 
    reviewCount: 1890,
    category: "pain", 
    brand: "Sun Pharma", 
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop",
    description: "Pain relief gel for joint and muscle pain",
    inStock: true 
  },
  { 
    id: 13, 
    title: "Moov Cream 35g", 
    price: 105, 
    originalPrice: 140, 
    discount: 25, 
    rating: 4.4, 
    reviewCount: 1420,
    category: "pain", 
    brand: "Paras", 
    image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop",
    description: "Instant relief from back pain and sprains",
    inStock: false 
  },

  // Ointments
  { 
    id: 14, 
    title: "Boroline Antiseptic Cream 20g", 
    price: 35, 
    originalPrice: 45, 
    discount: 22, 
    rating: 4.8, 
    reviewCount: 4560,
    category: "ointments", 
    brand: "GSK", 
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop",
    description: "Multi-purpose antiseptic cream",
    inStock: true 
  },
  { 
    id: 15, 
    title: "Baby Diaper Rash Cream", 
    price: 180, 
    originalPrice: 250, 
    discount: 28, 
    rating: 4.7, 
    reviewCount: 2340,
    category: "ointments", 
    brand: "BabyHug", 
    image: "https://images.unsplash.com/photo-1620485843666-c561c49f1c17?w=400&h=400&fit=crop",
    description: "Gentle cream for diaper rash",
    inStock: true 
  },
  { 
    id: 16, 
    title: "Burnol Antiseptic Cream", 
    price: 65, 
    originalPrice: 85, 
    discount: 24, 
    rating: 4.5, 
    reviewCount: 1890,
    category: "ointments", 
    brand: "GSK", 
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
    description: "For burns and minor cuts",
    inStock: true 
  },

  // Health Supplements
  { 
    id: 17, 
    title: "Multivitamin Tablets (60 tablets)", 
    price: 320, 
    originalPrice: 450, 
    discount: 29, 
    rating: 4.8, 
    reviewCount: 1890,
    category: "health-supp", 
    brand: "MeeMee", 
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop",
    description: "Complete daily nutrition supplement",
    inStock: true 
  },
  { 
    id: 18, 
    title: "Vitamin C 500mg (30 tablets)", 
    price: 180, 
    originalPrice: 240, 
    discount: 25, 
    rating: 4.6, 
    reviewCount: 1670,
    category: "health-supp", 
    brand: "Himalaya", 
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop",
    description: "Immunity booster with antioxidants",
    inStock: true 
  },
  { 
    id: 19, 
    title: "Calcium + Vitamin D3 (60 tablets)", 
    price: 290, 
    originalPrice: 380, 
    discount: 24, 
    rating: 4.5, 
    reviewCount: 1450,
    category: "health-supp", 
    brand: "Dabur", 
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
    description: "Bone health supplement",
    inStock: false 
  },
  { 
    id: 20, 
    title: "Omega-3 Fish Oil Capsules (60 caps)", 
    price: 450, 
    originalPrice: 600, 
    discount: 25, 
    rating: 4.7, 
    reviewCount: 1230,
    category: "health-supp", 
    brand: "Sun Pharma", 
    image: "https://images.unsplash.com/photo-1550572017-4876b7788da6?w=400&h=400&fit=crop",
    description: "Heart and brain health supplement",
    inStock: true 
  }
];

// Initialize filteredProducts with all products
filteredProducts = [...allProducts];

// Category Display Names
const categoryDisplayNames = {
  'all': 'All OTC Products',
  'ayurvedic': 'Ayurvedic Medicines',
  'allergy': 'Allergy Relief',
  'fever': 'Fever & Flu Medicines',
  'pain': 'Pain Relief',
  'ointments': 'Ointments & Creams',
  'health-supp': 'Health Supplements'
};

// Helper: Safe text update
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Update page title based on category
function updatePageTitle() {
  const titleEl = document.getElementById('pageTitle');
  if (titleEl && categoryDisplayNames[filterState.category]) {
    titleEl.textContent = categoryDisplayNames[filterState.category];
  }
}

// ==================== UPDATE HEADER COUNTS ====================
function updateHeaderCounts() {
  const updateBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = count;
      el.classList.toggle("hidden", count === 0);
    }
  };
  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  updateBadge("cartCount", cartTotal);
  updateBadge("wishlistCount", wishlist.length);
}

// ==================== WISHLIST ====================
function toggleWishlist(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const index = wishlist.findIndex(item => item.id === id);

  if (index > -1) {
    // Remove from wishlist
    wishlist.splice(index, 1);
    showToast("Removed from wishlist ♥");
  } else {
    // Add with correct format
    const wishlistItem = {
      id: product.id,
      name: product.title.split(' (')[0].trim(),
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.image
    };
    wishlist.push(wishlistItem);
    showToast("Added to wishlist ♥");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateHeaderCounts();
  renderProducts(); // Update heart icon
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full z-50 shadow-lg";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ==================== ORDER ON WHATSAPP FUNCTION ====================
function orderOnWhatsApp(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  if (!product.inStock) {
    alert('This product is currently out of stock. Please check back later.');
    return;
  }
  
  // WhatsApp business number (replace with actual number)
  const phoneNumber = "919876543210";
  
  // Create the message
  const message = `Hello! I would like to order:\n\n` +
                  `*${product.title}*\n` +
                  `Price: ₹${product.price}\n` +
                  (product.originalPrice ? `Original: ₹${product.originalPrice} (${product.discount}% OFF)\n` : '') +
                  `Brand: ${product.brand}\n` +
                  `Category: ${categoryDisplayNames[product.category] || product.category}\n\n` +
                  `Please let me know about availability and delivery options.`;
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  // Open in new tab
  window.open(whatsappURL, '_blank');
  
  // Optional: Track this action
  console.log(`WhatsApp order initiated for: ${product.title}`);
}

// ==================== PRODUCT CARD ====================
function createProductCard(p) {
  const inWishlist = wishlist.some(x => x.id === p.id);
  const isOutOfStock = !p.inStock;

  return `
    <div class="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-100">
      <div class="relative bg-blue-50 aspect-[6/4] overflow-hidden">
        <img src="${p.image}" alt="${p.title}"
             class="w-full h-full object-contain p-5 transition-transform duration-500 ${!isOutOfStock ? 'group-hover:scale-110' : ''}">

        <div class="absolute top-2 left-2 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10
                    ${isOutOfStock ? 'bg-red-600' : 'bg-green-600'}">
          ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </div>

        <button onclick="event.stopPropagation(); toggleWishlist(${p.id})"
                class="absolute top-2 right-2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center 
                       ${isOutOfStock ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10">
          <i class="${inWishlist ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-600'} text-lg"></i>
        </button>
      </div>

      <div class="p-3">
        <p class="text-xs text-gray-500 uppercase font-medium truncate">${p.brand || 'Brand'}</p>
        <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mt-1">${p.title}</h3>

        <div class="mt-2 flex items-center gap-2">
          <span class="text-lg font-bold text-green-600">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice > p.price ? `
            <span class="text-sm text-gray-500 line-through">₹${p.originalPrice.toLocaleString()}</span>
          ` : ''}
          ${p.discount ? `<span class="text-sm font-medium text-red-500">${p.discount}% OFF</span>` : ''}
        </div>

        <button onclick="event.stopPropagation(); orderOnWhatsApp(${p.id})"
                class="whatsapp-order-btn mt-3 w-full font-medium text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2
                        ${isOutOfStock 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : ''}">
          <i class="fab fa-whatsapp"></i>
          ${isOutOfStock ? 'Out of Stock' : 'Order on WhatsApp'}
        </button>
      </div>
    </div>
  `;
}

// ==================== RENDERING ====================
function renderProducts() {
  const start = (currentPage - 1) * pageSize;
  const paginated = filteredProducts.slice(start, start + pageSize);
  const grid = document.getElementById("productsGrid");

  if (grid) {
    grid.innerHTML = paginated.length 
      ? paginated.map(createProductCard).join("")
      : `<p class="col-span-full text-center text-gray-500 py-10">No products found</p>`;
  }

  setText("resultsCount", `Showing ${filteredProducts.length} products`);
  updatePageTitle();
  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-4 py-2 rounded border mx-1 ${i === currentPage ? 'bg-[#36C2CE] text-white' : 'bg-white text-blue-600 border-blue-300'}`;
    btn.onclick = () => { currentPage = i; renderProducts(); };
    container.appendChild(btn);
  }
}

// ==================== FILTER & SORT ====================
function applyFilters() {
  filteredProducts = allProducts.filter(p => {
    const catMatch = filterState.category === 'all' || p.category === filterState.category;
    const brandMatch = filterState.brand === 'all' || p.brand === filterState.brand;
    const discMatch = p.discount >= filterState.discount;
    const priceMatch = p.price >= filterState.minPrice && p.price <= filterState.maxPrice;
    return catMatch && brandMatch && discMatch && priceMatch;
  });

  sortProducts(filterState.sort);
  currentPage = 1;
  renderProducts();
  saveFiltersToStorage();
}

function sortProducts(type) {
  switch (type) {
    case 'price-low': filteredProducts.sort((a, b) => a.price - b.price); break;
    case 'price-high': filteredProducts.sort((a, b) => b.price - a.price); break;
    case 'rating': filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    case 'newest': filteredProducts.sort((a, b) => b.id - a.id); break;
    default: break;
  }
}

function loadFiltersFromStorage() {
  try {
    const saved = localStorage.getItem('otcFilters');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all properties exist
      filterState = {
        category: parsed.category || 'all',
        brand: parsed.brand || 'all',
        discount: parsed.discount || 0,
        minPrice: parsed.minPrice || 0,
        maxPrice: parsed.maxPrice || 2000,
        sort: parsed.sort || 'default'
      };
    }
  } catch (e) { 
    console.error("Failed to load filters", e);
    // Reset to defaults on error
    filterState = {
      category: 'all',
      brand: 'all',
      discount: 0,
      minPrice: 0,
      maxPrice: 2000,
      sort: 'default'
    };
  }
}

function saveFiltersToStorage() {
  localStorage.setItem('otcFilters', JSON.stringify(filterState));
}

// ==================== PRICE SLIDERS ====================
function initPriceSliders() {
  // Desktop sliders
  const desktopContainer = document.querySelector("#filterSidebar .price-slider-container");
  if (desktopContainer) {
    const minThumb = desktopContainer.querySelector('#minThumb');
    const maxThumb = desktopContainer.querySelector('#maxThumb');
    const fill = desktopContainer.querySelector('#desktopFill');
    const minVal = desktopContainer.querySelector('#minValue');
    const maxVal = desktopContainer.querySelector('#maxValue');
    
    const updateDesktop = (minP, maxP) => {
      const minPct = (minP / 2000) * 100;
      const maxPct = (maxP / 2000) * 100;
      if (fill) {
        fill.style.left = minPct + "%";
        fill.style.width = (maxPct - minPct) + "%";
      }
      if (minVal) minVal.textContent = `₹${minP.toLocaleString()}`;
      if (maxVal) maxVal.textContent = `₹${maxP.toLocaleString()}`;
      filterState.minPrice = minP;
      filterState.maxPrice = maxP;
    };

    if (minThumb && maxThumb) {
      minThumb.addEventListener("input", () => {
        let val = parseInt(minThumb.value);
        if (val > parseInt(maxThumb.value)) val = parseInt(maxThumb.value);
        updateDesktop(val, parseInt(maxThumb.value));
        applyFilters();
      });

      maxThumb.addEventListener("input", () => {
        let val = parseInt(maxThumb.value);
        if (val < parseInt(minThumb.value)) val = parseInt(minThumb.value);
        updateDesktop(parseInt(minThumb.value), val);
        applyFilters();
      });

      updateDesktop(filterState.minPrice, filterState.maxPrice);
    }
  }

  // Mobile sliders
  const mobileContainer = document.querySelector("#filterSheet .price-slider-container");
  if (mobileContainer) {
    const minThumb = mobileContainer.querySelector('#mobileMinThumb');
    const maxThumb = mobileContainer.querySelector('#mobileMaxThumb');
    const fill = mobileContainer.querySelector('#mobileFill');
    const minVal = mobileContainer.querySelector('#mobileMinValue');
    const maxVal = mobileContainer.querySelector('#mobileMaxValue');
    
    const updateMobile = (minP, maxP) => {
      const minPct = (minP / 2000) * 100;
      const maxPct = (maxP / 2000) * 100;
      if (fill) {
        fill.style.left = minPct + "%";
        fill.style.width = (maxPct - minPct) + "%";
      }
      if (minVal) minVal.textContent = `₹${minP.toLocaleString()}`;
      if (maxVal) maxVal.textContent = `₹${maxP.toLocaleString()}`;
      filterState.minPrice = minP;
      filterState.maxPrice = maxP;
    };

    if (minThumb && maxThumb) {
      minThumb.addEventListener("input", () => {
        let val = parseInt(minThumb.value);
        if (val > parseInt(maxThumb.value)) val = parseInt(maxThumb.value);
        updateMobile(val, parseInt(maxThumb.value));
      });

      maxThumb.addEventListener("input", () => {
        let val = parseInt(maxThumb.value);
        if (val < parseInt(minThumb.value)) val = parseInt(minThumb.value);
        updateMobile(parseInt(minThumb.value), val);
      });

      updateMobile(filterState.minPrice, filterState.maxPrice);
    }
  }
}

// ==================== FILTER INITIALIZATION ====================
function initFiltersAndUI() {
  loadFiltersFromStorage();

  // Desktop filters
  document.querySelectorAll('#filterForm input[name="category"], #filterForm input[name="brand"], #filterForm input[name="discount"]').forEach(input => {
    if ((input.name === "category" && input.value === filterState.category) ||
        (input.name === "brand" && input.value === filterState.brand) ||
        (input.name === "discount" && parseInt(input.value) === filterState.discount)) {
      input.checked = true;
    }

    input.addEventListener('change', () => {
      if (input.name === "category") filterState.category = input.value;
      if (input.name === "brand") filterState.brand = input.value;
      if (input.name === "discount") filterState.discount = parseInt(input.value);
      applyFilters();
    });
  });

  // Mobile filters change listeners
  document.querySelectorAll('#mobileFilterForm input[name="mobileCategory"], #mobileFilterForm input[name="mobileBrand"], #mobileFilterForm input[name="mobileDiscount"]').forEach(input => {
    if ((input.name === "mobileCategory" && input.value === filterState.category) ||
        (input.name === "mobileBrand" && input.value === filterState.brand) ||
        (input.name === "mobileDiscount" && parseInt(input.value) === filterState.discount)) {
      input.checked = true;
    }
  });

  // Apply desktop filters button
  document.getElementById("applyDesktopFilters")?.addEventListener("click", () => {
    const cat = document.querySelector('#filterForm input[name="category"]:checked')?.value || 'all';
    const brd = document.querySelector('#filterForm input[name="brand"]:checked')?.value || 'all';
    const disc = parseInt(document.querySelector('#filterForm input[name="discount"]:checked')?.value || 0);
    filterState.category = cat; filterState.brand = brd; filterState.discount = disc;
    applyFilters();
  });

  // Apply mobile filters button
  document.getElementById("applyMobileFilters")?.addEventListener("click", () => {
    const cat = document.querySelector('#filterSheet input[name="mobileCategory"]:checked')?.value || 'all';
    const brd = document.querySelector('#filterSheet input[name="mobileBrand"]:checked')?.value || 'all';
    const disc = parseInt(document.querySelector('#filterSheet input[name="mobileDiscount"]:checked')?.value || 0);
    filterState.category = cat; filterState.brand = brd; filterState.discount = disc;
    applyFilters();
    document.getElementById("filterSheet").classList.add("translate-y-full");
    document.getElementById("mobileSheetBackdrop").classList.add("hidden");
  });

  // Clear filters
  document.getElementById("clearMobileFilters")?.addEventListener("click", () => {
    filterState = { category: 'all', brand: 'all', discount: 0, minPrice: 0, maxPrice: 2000, sort: 'default' };
    localStorage.removeItem("otcFilters");
    
    // Reset all radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(r => {
      r.checked = (r.value === 'all' || r.value === '0');
    });
    
    // Reset sort select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = 'default';
    
    // Reset slider values
    initPriceSliders();
    applyFilters();
  });

  // Sort select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.value = filterState.sort;
    sortSelect.addEventListener("change", (e) => {
      filterState.sort = e.target.value;
      sortProducts(filterState.sort);
      renderProducts();
      saveFiltersToStorage();
    });
  }

  // Apply sort button (mobile)
  document.getElementById("applySortBtn")?.addEventListener("click", () => {
    const selectedSort = document.querySelector('input[name="mobileSort"]:checked')?.value || 'default';
    if (sortSelect) {
      sortSelect.value = selectedSort;
      filterState.sort = selectedSort;
      sortProducts(filterState.sort);
      renderProducts();
      saveFiltersToStorage();
    }
    document.getElementById("sortSheet").classList.add("translate-y-full");
    document.getElementById("mobileSheetBackdrop").classList.add("hidden");
  });

  applyFilters();
}

// ==================== BANNER ====================
function initBanner() {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  let i = 0;
  
  const go = (n) => {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active');
    dots[i].classList.add('active');
  };
  
  dots.forEach((d, idx) => d.onclick = () => go(idx));
  setInterval(() => go(i + 1), 5000);
}

// ==================== MOBILE SHEETS ====================
function initMobileSheets() {
  const backdrop = document.getElementById("mobileSheetBackdrop");
  
  // Open Filter Sheet
  document.getElementById("openFilterSheet")?.addEventListener("click", () => {
    document.getElementById("filterSheet").classList.remove("translate-y-full");
    backdrop.classList.remove("hidden");
  });
  
  // Open Sort Sheet
  document.getElementById("openSortSheet")?.addEventListener("click", () => {
    document.getElementById("sortSheet").classList.remove("translate-y-full");
    backdrop.classList.remove("hidden");
  });
  
  // Close sheets
  document.querySelectorAll("#closeFilterSheet, #closeSortSheet, #mobileSheetBackdrop").forEach(el => {
    el?.addEventListener("click", () => {
      document.getElementById("filterSheet").classList.add("translate-y-full");
      document.getElementById("sortSheet").classList.add("translate-y-full");
      backdrop.classList.add("hidden");
    });
  });
}

// ==================== ON LOAD ====================
document.addEventListener("DOMContentLoaded", () => {
  initBanner();
  initMobileSheets();
  initPriceSliders();
  initFiltersAndUI();
  renderProducts();
  updateHeaderCounts();
});