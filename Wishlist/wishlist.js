
        // Configuration
        const CONFIG = {
            userId: 2, // Matches babycare.js
            apiBaseUrl: 'http://localhost:8080/api', // Updated to match babycare.js
            products: [
                {
                    id: 1,
                    title: "Premium Diapers (60-Pack)",
                    description: "Ultra-absorbent diapers for all-day comfort",
                    price: 1249.17,
                    originalPrice: 1659.17,
                    discount: 25,
                    rating: 4.7,
                    reviewCount: 150,
                    images: ["../Babycare-subpages/images/diapers/diaper.jpeg"], // Adjusted path
                    category: "diapers-wipes",
                    brand: "BabySoft",
                    inStock: true
                },
                {
                    id: 2,
                    title: "Baby Shampoo",
                    description: "Gentle, tear-free shampoo for babies",
                    price: 829.17,
                    originalPrice: 1079.17,
                    discount: 23,
                    rating: 4.5,
                    reviewCount: 120,
                    images: ["/placeholder.svg?height=300&width=300"],
                    category: "skin-hair-care",
                    brand: "GentleCare",
                    inStock: true
                },
                {
                    id: 3,
                    title: "Bottle Feeding Set",
                    description: "Complete set for safe and easy feeding",
                    price: 2074.17,
                    originalPrice: 2574.17,
                    discount: 20,
                    rating: 4.6,
                    reviewCount: 89,
                    images: ["/placeholder.svg?height=300&width=300"],
                    category: "feeding-nursing",
                    brand: "NurtureWell",
                    inStock: true
                },
                {
                    id: 4,
                    title: "Baby Monitor",
                    description: "High-definition baby monitor with night vision",
                    price: 8299.17,
                    originalPrice: 10789.17,
                    discount: 23,
                    rating: 4.8,
                    reviewCount: 67,
                    images: ["/placeholder.svg?height=300&width=300"],
                    category: "health-safety",
                    brand: "SafeWatch",
                    inStock: true
                },
                {
                    id: 5,
                    title: "Interactive Learning Toy",
                    description: "Educational toy to stimulate baby's senses",
                    price: 1659.17,
                    originalPrice: 2074.17,
                    discount: 20,
                    rating: 4.4,
                    reviewCount: 143,
                    images: ["/placeholder.svg?height=300&width=300"],
                    category: "toys-learning",
                    brand: "PlaySmart",
                    inStock: true
                },
                {
                    id: 6,
                    title: "Organic Cotton Onesie",
                    description: "Soft and breathable onesie for babies",
                    price: 1249.17,
                    originalPrice: 1659.17,
                    discount: 25,
                    rating: 4.6,
                    reviewCount: 234,
                    images: ["/placeholder.svg?height=300&width=300"],
                    category: "clothing-accessories",
                    brand: "CozyBaby",
                    inStock: true
                }
            ]
        };

        // Toast notification system
        const toast = {
            show: function(message, type = 'success') {
                const toastElement = document.getElementById('toast');
                toastElement.textContent = message;
                toastElement.className = `toast ${type}`;
                
                setTimeout(() => {
                    toastElement.classList.add('show');
                }, 100);
                
                setTimeout(() => {
                    this.hide();
                }, 3000);
            },
            
            hide: function() {
                const toastElement = document.getElementById('toast');
                toastElement.classList.remove('show');
            }
        };

        // API functions
        const api = {
            // Fetch user's wishlist
            getWishlist: async function(userId) {
                try {
                    const response = await fetch(`${CONFIG.apiBaseUrl}/wishlists/get-wishlist-by-user-Id/${userId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error('Error fetching wishlist:', error);
                    toast.show('Failed to load wishlist', 'error');
                    return [];
                }
            },
            
            // Remove item from wishlist
            removeFromWishlist: async function(userId, productId) {
                try {
                    const response = await fetch(`${CONFIG.apiBaseUrl}/wishlists/remove-from-wishlist/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ productId })
                        });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    return true;
                } catch (error) {
                    console.error('Error removing from wishlist:', error);
                    toast.show('Failed to remove item', 'error');
                    return false;
                }
            }
        };

        // Cart functionality (shared with babycare page)
        const cart = {
            items: JSON.parse(localStorage.getItem('cart')) || [],
            
            addItem: function(product) {
                const existingItem = this.items.find(item => item.id === product.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.items.push({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        images: product.images,
                        quantity: 1
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(this.items));
                this.updateCartCount();
                return true;
            },
            
            getCount: function() {
                return this.items.reduce((total, item) => total + item.quantity, 0);
            },
            
            updateCartCount: function() {
                const cartCountElements = document.querySelectorAll('.cart-count');
                if (cartCountElements.length > 0) {
                    cartCountElements.forEach(element => {
                        element.textContent = this.getCount();
                        element.classList.toggle('hidden', this.getCount() === 0);
                    });
                }
            }
        };

        // Wishlist management functions
        const wishlistManager = {
            items: [],
            
            // Initialize wishlist
            init: async function() {
                this.items = await api.getWishlist(CONFIG.userId);
                this.render();
            },
            
            // Remove item from wishlist
            removeItem: async function(productId) {
                const success = await api.removeFromWishlist(CONFIG.userId, productId);
                
                if (success) {
                    // Remove from local array
                    this.items = this.items.filter(item => item.productId !== productId);
                    
                    // Re-render the wishlist
                    this.render();
                    
                    // Show success message
                    toast.show('Item removed from wishlist');
                }
            },
            
            // Navigate to product details
            navigateToProductDetails: function(productId) {
                localStorage.setItem('selectedProductId', productId);
                window.location.href = 'product-details.html';
            },
            
            // Add item to cart from wishlist
            addToCart: function(productId) {
                const product = CONFIG.products.find(p => p.id === productId);
                
                if (product) {
                    const success = cart.addItem(product);
                    
                    if (success) {
                        toast.show('Item added to cart!');
                    }
                }
            },
            
            // Render wishlist items
            render: function() {
                const loadingState = document.getElementById('loading-state');
                const emptyState = document.getElementById('empty-state');
                const wishlistItems = document.getElementById('wishlist-items');
                
                // Hide loading state
                loadingState.classList.add('hidden');
                
                if (this.items.length === 0) {
                    // Show empty state
                    emptyState.classList.remove('hidden');
                    wishlistItems.classList.add('hidden');
                    return;
                }
                
                // Show wishlist items
                emptyState.classList.add('hidden');
                wishlistItems.classList.remove('hidden');
                
                // Clear current items
                wishlistItems.innerHTML = '';
                
                // Render each wishlist item
                this.items.forEach(item => {
                    const product = CONFIG.products.find(p => p.id === item.productId);
                    
                    if (product) {
                        const itemElement = this.createWishlistItem(product);
                        wishlistItems.appendChild(itemElement);
                    } else {
                        console.warn(`Product with ID ${item.productId} not found in CONFIG.products`);
                    }
                });
            },
            
            // Create HTML for a wishlist item
            createWishlistItem: function(product) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'wishlist-item bg-white rounded-lg shadow-md overflow-hidden fade-in';
                itemDiv.innerHTML = `
                    <div class="relative">
                        <img src="${product.images[0]}" alt="${product.title}" 
                             class="w-full h-48 object-cover cursor-pointer" 
                             onclick="wishlistManager.navigateToProductDetails(${product.id})">
                        <button class="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md remove-btn hover:bg-gray-100 transition-colors" 
                                data-product-id="${product.id}">
                            <i class="fas fa-times text-gray-600"></i>
                        </button>
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2 cursor-pointer" 
                            onclick="wishlistManager.navigateToProductDetails(${product.id})">
                            ${product.title}
                        </h3>
                        <p class="text-sm text-gray-600 mb-2 line-clamp-2">${product.description}</p>
                        
                        <div class="flex items-center mb-2">
                            <div class="flex text-yellow-400 text-sm">
                                ${this.generateStarRating(product.rating)}
                            </div>
                            <span class="ml-2 text-gray-600 text-sm">(${product.reviewCount})</span>
                        </div>
                        
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-lg font-bold text-blue-600">₹${product.price.toFixed(2)}</span>
                            ${product.originalPrice > product.price ? 
                                `<span class="text-sm text-gray-500 line-through">₹${product.originalPrice.toFixed(2)}</span>` : ''}
                        </div>
                        
                        <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn" 
                                data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                        </button>
                    </div>
                `;
                
                // Add event listeners
                const removeButton = itemDiv.querySelector('.remove-btn');
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeItem(parseInt(removeButton.getAttribute('data-product-id')));
                });
                
                const addToCartButton = itemDiv.querySelector('.add-to-cart-btn');
                addToCartButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addToCart(parseInt(addToCartButton.getAttribute('data-product-id')));
                });
                
                return itemDiv;
            },
            
            // Generate star rating HTML
            generateStarRating: function(rating) {
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 !== 0;
                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                
                let starsHTML = '';
                for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
                if (hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
                for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
                
                return starsHTML;
            }
        };

        // Initialize the wishlist when the page loads
        document.addEventListener('DOMContentLoaded', function() {
            wishlistManager.init();
            cart.updateCartCount();
        });
