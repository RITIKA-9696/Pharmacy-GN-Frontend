/* ==============================
   cart.js - SIMPLIFIED WORKING VERSION
   ============================== */
console.log("🛒 cart.js loaded");

// Global cart state
let cart = [];
let cartInitialized = false;

// DOM Elements
let cartCountEl, cartItemsContainer, subtotalElement, taxElement, totalElement, discountElement;

// Initialize cart
window.initCart = async function() {
    console.log('🛒 Initializing cart...');
    
    if (cartInitialized) {
        console.log('🛒 Cart already initialized');
        return;
    }
    
    try {
        // Cache DOM elements
        cartCountEl = document.getElementById('cart-count');
        cartItemsContainer = document.getElementById('cart-items-container');
        subtotalElement = document.getElementById('subtotal');
        taxElement = document.getElementById('tax');
        totalElement = document.getElementById('total');
        discountElement = document.getElementById('discount');
        
        // Load cart data
        await loadCartData();
        
        // Update UI
        updateCartUI();
        
        cartInitialized = true;
        console.log('✅ Cart initialized successfully');
        
    } catch (error) {
        console.error('❌ Cart initialization failed:', error);
        // Fallback: show empty cart
        showEmptyCart();
    } finally {
        // Hide loading spinner
        const loadingEl = document.getElementById('cart-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
};

// Load cart data from localStorage or server
async function loadCartData() {
    console.log('📥 Loading cart data...');
    
    const token = localStorage.getItem('token');
    
    if (token) {
        // Logged in user - try to load from server
        try {
            const serverCart = await fetchCartFromServer();
            if (serverCart && serverCart.length > 0) {
                cart = serverCart;
                console.log('✅ Loaded cart from server:', cart);
                return;
            }
        } catch (error) {
            console.log('⚠️ Failed to load from server, using local storage');
        }
    }
    
    // Guest user or server failed - use local storage
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = localCart;
    console.log('✅ Loaded cart from local storage:', cart);
}

// Fetch cart from server (simplified)
async function fetchCartFromServer() {
    // This is a simplified version - implement your actual API call here
    return [];
}

// Update the entire cart UI
function updateCartUI() {
    updateCartCount();
    renderCartItems();
    calculatePrices();
    updateEmptyState();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        cartCountEl.parentElement.classList.toggle('hidden', totalItems === 0);
    }
    
    // Update item count in cart page
    const itemCountEl = document.getElementById('item-count');
    if (itemCountEl) {
        itemCountEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
    
    // Update cart count badge
    const cartCountBadge = document.getElementById('cart-count-badge');
    if (cartCountBadge) {
        cartCountBadge.classList.toggle('hidden', totalItems === 0);
        const badgeCount = document.getElementById('cart-count');
        if (badgeCount) {
            badgeCount.textContent = totalItems;
        }
    }
}

// ADD THIS FUNCTION TO YOUR CART LOGIC
function updateCartAndHeader() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  // Update localStorage
  localStorage.setItem('cartCount', totalCount);
  
  // Update header badge
  if (typeof updateCartCountInHeader === 'function') {
    updateCartCountInHeader(totalCount);
  }
}


// Render cart items
function renderCartItems() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No items in cart</p>';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center space-x-4">
                <!-- Product Image -->
                <img src="${item.image || item.mainImageUrl || 'https://via.placeholder.com/80'}" 
                     alt="${item.name || item.title || 'Product'}" 
                     class="w-16 h-16 object-cover rounded-lg border">
                
                <!-- Product Details -->
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800">${item.name || item.title || 'Unknown Product'}</h3>
                    <p class="text-sm text-gray-600">₹${(item.price || 0).toFixed(2)} each</p>
                    ${item.selectedSize ? `<p class="text-xs text-gray-500">Size: ${item.selectedSize}</p>` : ''}
                </div>
                
                <!-- Quantity Controls -->
                <div class="flex items-center space-x-2">
                    <button onclick="updateQty(${index}, ${(item.quantity || 1) - 1})" 
                            class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50">
                        <i class="fas fa-minus text-xs text-gray-600"></i>
                    </button>
                    
                    <span class="w-8 text-center font-medium">${item.quantity || 1}</span>
                    
                    <button onclick="updateQty(${index}, ${(item.quantity || 1) + 1})" 
                            class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50">
                        <i class="fas fa-plus text-xs text-gray-600"></i>
                    </button>
                </div>
                
                <!-- Price -->
                <div class="text-right">
                    <p class="font-semibold text-gray-800">
                        ₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </p>
                    <button onclick="removeItem(${index})" 
                            class="text-red-500 hover:text-red-700 text-sm mt-1">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Calculate prices
function calculatePrices() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const tax = subtotal * 0.18; // 18% tax
    const discount = 0; // You can implement discount logic here
    const shipping = 49;
    const total = subtotal + tax + shipping - discount;
    
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `₹${tax.toFixed(2)}`;
    if (discountElement) discountElement.textContent = `-₹${discount.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
}

// Update empty state visibility
function updateEmptyState() {
    const emptyCartEl = document.getElementById('empty-cart-fullscreen');
    const cartWithItemsEl = document.getElementById('cart-with-items');
    
    if (emptyCartEl && cartWithItemsEl) {
        const isEmpty = cart.length === 0;
        emptyCartEl.classList.toggle('hidden', !isEmpty);
        cartWithItemsEl.classList.toggle('hidden', isEmpty);
    }
}

// Show empty cart state
function showEmptyCart() {
    const emptyCartEl = document.getElementById('empty-cart-fullscreen');
    const cartWithItemsEl = document.getElementById('cart-with-items');
    
    if (emptyCartEl) emptyCartEl.classList.remove('hidden');
    if (cartWithItemsEl) cartWithItemsEl.classList.add('hidden');
}

// Update quantity
window.updateCartItem = function(index, newQuantity) {
    if (newQuantity < 1) {
        removeItem(index);
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart();
    updateCartUI();
    showNotification('Quantity updated', 'success');
};

// Remove item
window.removeCartItem = function(index) {
    if (confirm('Are you sure you want to remove this item?')) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
        showNotification('Item removed from cart', 'success');
    }
};

// Example: Add to cart
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existing = cart.find(p => p.id === product.id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartAndHeader(); // CALL HERE
}

// Example: Remove item
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = cart.filter(p => p.id !== productId);
  
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartAndHeader(); // CALL HERE
}

// Example: Empty cart
function emptyCart() {
  localStorage.setItem("cart", "[]");
  updateCartAndHeader(); // CALL HERE → Shows 0
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Global functions for HTML onclick
window.updateQty = function(index, newQuantity) {
    window.updateCartItem(index, newQuantity);
};

window.removeItem = function(index) {
    window.removeCartItem(index);
};

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Export for product pages
window.addToCartGlobal = function(product) {
    // Add item to cart
    const existingItemIndex = cart.findIndex(item => 
        item.id === product.id && item.selectedSize === product.selectedSize
    );
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += product.quantity || 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            name: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.mainImageUrl,
            mainImageUrl: product.mainImageUrl,
            selectedSize: product.selectedSize,
            quantity: product.quantity || 1,
            prescriptionRequired: product.prescriptionRequired || false
        });
    }
    
    saveCart();
    updateCartUI();
    showNotification('Added to cart!', 'success');
};