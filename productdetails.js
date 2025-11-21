// Base API URL - adjust based on your environment
const API_BASE_URL = 'http://localhost:8083/api/products';

// Initialize cart from localStorage or create an empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Logging utility function
function logInfo(message, data = null) {
    console.log(`[INFO] ${message}`, data || '');
}

function logError(message, error = null) {
    console.error(`[ERROR] ${message}`, error || '');
}

function logWarn(message, data = null) {
    console.warn(`[WARN] ${message}`, data || '');
}

// Function to update cart count in the UI
// Update Cart Count in Header (Desktop + Mobile)
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Update both desktop and mobile cart badges
    const desktopCount = document.getElementById('desktop-cart-count');
    const mobileCount = document.getElementById('mobile-cart-count');

    if (desktopCount) desktopCount.textContent = totalItems;
    if (mobileCount) mobileCount.textContent = totalItems;

    // Hide badge if count is 0
    [desktopCount, mobileCount].forEach(el => {
        if (el) {
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
}

// Function to add product to cart
function addToCart(product) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingItem = cart.find(item => 
            item.id === product.id && 
            item.variant === product.variant && 
            item.size === product.size
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();  // This line updates the header badge

        console.log('Added to cart:', product.name);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Function to get URL parameters
// Function to get URL parameters
function getUrlParams() {
    try {
        const params = {};
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams) {
            try {
                // Try to decode, but if it fails, use the raw value
                params[key] = decodeURIComponent(value);
            } catch (e) {
                // If decoding fails, use the value as-is
                logWarn(`Could not decode parameter ${key}, using raw value`);
                params[key] = value;
            }
        }
        
        logInfo('URL parameters parsed:', params);
        return params;
        
    } catch (error) {
        logError('Error parsing URL parameters:', error);
        return {};
    }
}

// Function to render thumbnails
function renderThumbnails(thumbnails, productId) {
    try {
        const thumbnailContainer = document.getElementById('thumbnail-container');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = '';
            logInfo(`Rendering ${thumbnails.length} thumbnails for product ${productId}`);
            
            thumbnails.forEach((thumbSrc, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = thumbSrc;
                thumbnail.alt = `Thumbnail ${index + 1}`;
                thumbnail.className = 'w-20 h-20 object-contain border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-pharmacy-blue hover:shadow-md';
                thumbnail.classList.add(index === 0 ? 'border-pharmacy-blue' : 'border-gray-200');
                
                thumbnail.addEventListener('click', () => {
                    document.getElementById('main-product-image').src = thumbnail.src;
                    document.querySelectorAll('#thumbnail-container img').forEach(img => {
                        img.classList.remove('border-pharmacy-blue');
                        img.classList.add('border-gray-200');
                    });
                    thumbnail.classList.add('border-pharmacy-blue');
                    thumbnail.classList.remove('border-gray-200');
                    logInfo(`Switched to thumbnail ${index}`);
                });
                
                thumbnailContainer.appendChild(thumbnail);
            });
        } else {
            logWarn('Thumbnail container not found');
        }
    } catch (error) {
        logError('Error rendering thumbnails:', error);
    }
}

// Function to render variants
function renderVariants(variants) {
    try {
        const variantOptions = document.getElementById('variant-options');
        if (variantOptions && variants && variants.length > 0) {
            variantOptions.innerHTML = '';
            logInfo(`Rendering ${variants.length} variants`);
            
            variants.forEach((variant, index) => {
                const button = document.createElement('button');
                button.className = `variant-btn px-4 py-2 border ${index === 0 ? 'border-2 border-pharmacy-blue bg-pharmacy-light-blue text-pharmacy-blue font-semibold' : 'border-gray-300 bg-white text-gray-700'} rounded-lg transition-all duration-200 hover:border-pharmacy-blue hover:shadow-md`;
                button.textContent = variant;
                button.addEventListener('click', () => {
                    document.querySelectorAll('.variant-btn').forEach(btn => {
                        btn.classList.remove('border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold', 'border-2');
                        btn.classList.add('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                    });
                    button.classList.add('border-2', 'border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold');
                    button.classList.remove('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                    logInfo(`Variant selected: ${variant}`);
                });
                variantOptions.appendChild(button);
            });
        } else {
            logWarn('Variant options container not found or no variants available');
        }
    } catch (error) {
        logError('Error rendering variants:', error);
    }
}

// Function to render size options
function renderSizes(sizes) {
    try {
        const motherCareSection = document.getElementById('mother-care-section');
        if (motherCareSection && sizes && sizes.length > 0) {
            motherCareSection.classList.remove('hidden');
            const sizeOptionsContainer = motherCareSection.querySelector('.flex.gap-3');
            if (sizeOptionsContainer) {
                sizeOptionsContainer.innerHTML = '';
                logInfo(`Rendering ${sizes.length} sizes`);
                
                sizes.forEach((size, index) => {
                    const button = document.createElement('button');
                    button.className = `size-btn px-4 py-2 border ${index === 0 ? 'border-2 border-pharmacy-blue bg-pharmacy-light-blue text-pharmacy-blue font-semibold' : 'border-gray-300 bg-white text-gray-700'} rounded-lg transition-all duration-200 hover:border-pharmacy-blue hover:shadow-md`;
                    button.textContent = size;
                    button.addEventListener('click', () => {
                        document.querySelectorAll('.size-btn').forEach(btn => {
                            btn.classList.remove('border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold', 'border-2');
                            btn.classList.add('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                        });
                        button.classList.add('border-2', 'border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold');
                        button.classList.remove('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                        logInfo(`Size selected: ${size}`);
                    });
                    sizeOptionsContainer.appendChild(button);
                });
            }
        } else {
            logWarn('Size options container not found or no sizes available');
        }
    } catch (error) {
        logError('Error rendering sizes:', error);
    }
}

// Function to load related products (placeholder for URL params mode)
function loadRelatedProductsPlaceholder() {
    const relatedProductsContainer = document.getElementById('related-products');
    if (relatedProductsContainer) {
        const placeholderProducts = [
            { name: 'Similar Product 1', price: '₹299', image: 'https://via.placeholder.com/200', id: 'p1' },
            { name: 'Similar Product 2', price: '₹399', image: 'https://via.placeholder.com/200', id: 'p2' },
            { name: 'Similar Product 3', price: '₹499', image: 'https://via.placeholder.com/200', id: 'p3' },
            { name: 'Similar Product 4', price: '₹599', image: 'https://via.placeholder.com/200', id: 'p4' }
        ];
        
        relatedProductsContainer.innerHTML = '';
        placeholderProducts.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer';
            card.innerHTML = `
                <img src="${prod.image}" alt="${prod.name}" class="w-full h-40 object-contain mb-3">
                <h4 class="font-semibold text-gray-800 mb-2">${prod.name}</h4>
                <p class="text-pharmacy-blue font-bold mb-3">${prod.price}</p>
                <button class="w-full bg-pharmacy-blue text-white py-2 rounded-lg hover:bg-pharmacy-dark-blue transition-colors">
                    Add to Cart
                </button>
            `;
            relatedProductsContainer.appendChild(card);
        });
        logInfo('Related products placeholder loaded');
    }
}

// Function to fetch related products from backend
async function loadRelatedProducts(category, currentProductId) {
    const relatedProductsContainer = document.getElementById('related-products');
    if (relatedProductsContainer) {
        relatedProductsContainer.innerHTML = '<p class="text-center text-gray-500">Loading related products...</p>';
        
        try {
            logInfo(`Loading related products for category: ${category}`);
            
            // Fetch products by category from backend
            const encodedCategory = encodeURIComponent(category);
            const response = await fetch(`${API_BASE_URL}/get-by-category/${encodedCategory}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const relatedProducts = await response.json();
            logInfo(`Found ${relatedProducts.length} products in category`);
            
            // Filter out current product and limit to 4
            const filteredProducts = relatedProducts
                .filter(p => p.productId != currentProductId)
                .slice(0, 4);
            
            logInfo(`Filtered to ${filteredProducts.length} related products`);
            
            // If we don't have enough products, fetch some from other categories
            if (filteredProducts.length < 4) {
                try {
                    logInfo('Fetching additional products from other categories');
                    const allResponse = await fetch(`${API_BASE_URL}/get-all-products?page=0&size=10`);
                    if (allResponse.ok) {
                        const allProductsData = await allResponse.json();
                        const otherProducts = allProductsData.content
                            .filter(p => p.productCategory !== category && p.productId != currentProductId)
                            .slice(0, 4 - filteredProducts.length);
                        
                        filteredProducts.push(...otherProducts);
                        logInfo(`Added ${otherProducts.length} additional products`);
                    }
                } catch (error) {
                    logError('Error fetching additional products:', error);
                }
            }
            
            // Render the products
            relatedProductsContainer.innerHTML = '';
            filteredProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group';
                
                // Use the backend image URL
                const imageUrl = product.productMainImage 
                    ? `${API_BASE_URL}/${product.productId}/image`
                    : 'https://via.placeholder.com/300x300?text=No+Image';
                
                productCard.innerHTML = `
                    <div class="relative">
                        <img src="${imageUrl}" alt="${product.productName}" class="w-full h-48 object-contain p-4 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-gray-900 mb-1 group-hover:text-pharmacy-blue transition-colors duration-200">${product.productName}</h4>
                        <p class="text-gray-600 text-sm mb-3">${product.brandName || 'Generic'}</p>
                        <div class="flex items-center gap-2">
                            <span class="text-pharmacy-blue font-bold">₹${product.productPrice}</span>
                            ${product.productOldPrice && product.productOldPrice > product.productPrice ? 
                                `<span class="text-gray-400 line-through text-sm">₹${product.productOldPrice}</span>` : ''}
                            ${product.productOldPrice && product.productOldPrice > product.productPrice ? 
                                `<span class="text-sm font-semibold text-green-600">${Math.round((1 - product.productPrice/product.productOldPrice) * 100)}% off</span>` : ''}
                        </div>
                        ${product.prescriptionRequired ? '<div class="text-red-500 text-xs mt-2 font-medium">Prescription Required</div>' : ''}
                        <button class="btn-add-to-cart mt-2 w-full bg-gradient-to-r from-pharmacy-blue to-pharmacy-dark-blue hover:from-pharmacy-dark-blue hover:to-pharmacy-blue text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                `;
                productCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.btn-add-to-cart')) {
                        logInfo(`Navigating to product details: ${product.productId}`);
                        window.location.href = `productdetails.html?id=${product.productId}`;
                    }
                });
                relatedProductsContainer.appendChild(productCard);
            });
            
            if (filteredProducts.length === 0) {
                relatedProductsContainer.innerHTML = '<p class="text-center text-gray-500">No related products available.</p>';
                logWarn('No related products found');
            }
            
            logInfo('Related products loaded successfully');
            
        } catch (error) {
            logError('Error loading related products from backend:', error);
            // Fallback to placeholder
            loadRelatedProductsPlaceholder();
        }
    }
}

// Function to initialize tabs
function initTabs() {
    try {
        const tabs = document.querySelectorAll('.tab');
        logInfo(`Initializing ${tabs.length} tabs`);
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('border-pharmacy-blue', 'text-pharmacy-blue', 'bg-pharmacy-light-blue');
                    t.classList.add('border-transparent', 'text-gray-600');
                });
                document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
                tab.classList.add('border-pharmacy-blue', 'text-pharmacy-blue', 'bg-pharmacy-light-blue');
                tab.classList.remove('border-transparent', 'text-gray-600');
                document.getElementById(tab.dataset.tab).classList.remove('hidden');
                logInfo(`Tab switched to: ${tab.dataset.tab}`);
            });
        });
    } catch (error) {
        logError('Error initializing tabs:', error);
    }
}

// Function to initialize selection buttons (variants, age, size)
function initSelectionButtons() {
    try {
        // Initialize variant buttons
        const variantButtons = document.querySelectorAll('.variant-btn');
        logInfo(`Initializing ${variantButtons.length} variant buttons`);
        
        variantButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.variant-btn').forEach(b => {
                    b.classList.remove('border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold', 'border-2');
                    b.classList.add('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                });
                btn.classList.add('border-2', 'border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold');
                btn.classList.remove('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                logInfo(`Variant selected: ${btn.textContent}`);
            });
        });
        
        // Initialize age buttons
        const ageButtons = document.querySelectorAll('.age-btn');
        logInfo(`Initializing ${ageButtons.length} age buttons`);
        
        ageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.age-btn').forEach(b => {
                    b.classList.remove('border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold', 'border-2');
                    b.classList.add('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                });
                btn.classList.add('border-2', 'border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold');
                btn.classList.remove('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                logInfo(`Age group selected: ${btn.textContent}`);
            });
        });
        
        // Initialize size buttons
        const sizeButtons = document.querySelectorAll('.size-btn');
        logInfo(`Initializing ${sizeButtons.length} size buttons`);
        
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.remove('border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold', 'border-2');
                    b.classList.add('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                });
                btn.classList.add('border-2', 'border-pharmacy-blue', 'bg-pharmacy-light-blue', 'text-pharmacy-blue', 'font-semibold');
                btn.classList.remove('border', 'border-gray-300', 'bg-white', 'text-gray-700');
                logInfo(`Size selected: ${btn.textContent}`);
            });
        });
    } catch (error) {
        logError('Error initializing selection buttons:', error);
    }
}

// Function to initialize cart functionality
function initCart() {
    try {
        logInfo('Initializing cart functionality');
        updateCartCount();
        
        const addToCartButton = document.querySelector('.btn-add-to-cart');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', () => {
                try {
                    const params = getUrlParams();
                    const productId = params.id;
                    logInfo(`Add to cart clicked for product: ${productId}`);
                    
                    // Get product data from the page
                    const productName = document.getElementById('product-name').textContent;
                    const productPrice = parseFloat(document.getElementById('selling-price').textContent.replace('₹', '').replace(',', ''));
                    const productImage = document.getElementById('main-product-image').src;
                    const prescriptionBadge = document.getElementById('prescription-badge');
                    const prescriptionRequired = prescriptionBadge && !prescriptionBadge.classList.contains('hidden');
                    
                    const selectedVariant = document.querySelector('.variant-btn.border-pharmacy-blue')?.textContent || 'Default';
                    const selectedAge = document.querySelector('.age-btn.border-pharmacy-blue')?.textContent || null;
                    const selectedSize = document.querySelector('.size-btn.border-pharmacy-blue')?.textContent || null;
                    
                    const cartItem = {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImage,
                        variant: selectedVariant,
                        age: selectedAge,
                        size: selectedSize,
                        prescriptionRequired: prescriptionRequired,
                        quantity: 1
                    };
                    
                    addToCart(cartItem);
                    alert(`${productName}${selectedSize ? ' (' + selectedSize + ')' : ''} added to cart!`);
                    logInfo('Product added to cart successfully', cartItem);
                    
                } catch (error) {
                    logError('Error in add to cart click handler:', error);
                    alert('Error adding product to cart. Please try again.');
                }
            });
        } else {
            logError('Add to Cart button not found');
        }
        
        const buyNowButton = document.querySelector('.btn-buy-now');
        if (buyNowButton) {
            buyNowButton.addEventListener('click', () => {
                try {
                    const params = getUrlParams();
                    const productId = params.id;
                    logInfo(`Buy now clicked for product: ${productId}`);
                    
                    // Get product data from the page
                    const productName = document.getElementById('product-name').textContent;
                    const productPrice = parseFloat(document.getElementById('selling-price').textContent.replace('₹', '').replace(',', ''));
                    const productImage = document.getElementById('main-product-image').src;
                    const prescriptionBadge = document.getElementById('prescription-badge');
                    const prescriptionRequired = prescriptionBadge && !prescriptionBadge.classList.contains('hidden');
                    
                    const selectedVariant = document.querySelector('.variant-btn.border-pharmacy-blue')?.textContent || 'Default';
                    const selectedAge = document.querySelector('.age-btn.border-pharmacy-blue')?.textContent || null;
                    const selectedSize = document.querySelector('.size-btn.border-pharmacy-blue')?.textContent || null;
                    
                    const cartItem = {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImage,
                        variant: selectedVariant,
                        age: selectedAge,
                        size: selectedSize,
                        prescriptionRequired: prescriptionRequired,
                        quantity: 1
                    };
                    
                    addToCart(cartItem); // Add to cart before redirecting
                    logInfo('Product added to cart for buy now', cartItem);
                    window.location.href = 'checkout.html';
                    
                } catch (error) {
                    logError('Error in buy now click handler:', error);
                    alert('Error processing buy now. Please try again.');
                }
            });
        } else {
            logWarn('Buy now button not found');
        }
    } catch (error) {
        logError('Error initializing cart functionality:', error);
    }
}

// NEW FUNCTION: Load product from URL parameters (for your card clicks)
function loadProductFromUrlParams() {
    try {
        const params = getUrlParams();
        
        if (!params.name || !params.price) {
            logWarn('Insufficient product data in URL parameters');
            return false;
        }

        // Update product details
        document.getElementById('product-name').textContent = params.name;
        document.getElementById('selling-price').textContent = params.price;

        if (params.originalPrice && params.discount) {
            document.getElementById('original-price').textContent = params.originalPrice;
            document.getElementById('discount').textContent = params.discount;
            document.getElementById('original-price').style.display = 'inline';
            document.getElementById('discount').style.display = 'inline';
        } else {
            document.getElementById('original-price').style.display = 'none';
            document.getElementById('discount').style.display = 'none';
        }

        if (params.description) {
            document.getElementById('product-description').textContent = params.description;
        }

        const mainImage = document.getElementById('main-product-image');
        if (params.image) {
            mainImage.src = params.image;
            mainImage.alt = params.name;
            renderThumbnails([params.image, params.image, params.image], params.id);
        }

        // KEY PART: Show only related products from same category
        const relatedContainer = document.getElementById('related-products');
        if (relatedContainer && params.category) {
            let relatedList = [];
            if (params.category === 'feminine') {
                relatedList = productsData.filter(p => p.id != params.id);
            } else if (params.category === 'medicine') {
                relatedList = medicinesData.filter(p => p.id != params.id);
            }

            // Limit to 4
            relatedList = relatedList.slice(0, 4);

            relatedContainer.innerHTML = '';
            if (relatedList.length === 0) {
                relatedContainer.innerHTML = '<p class="text-center text-gray-500 col-span-4">No related products found.</p>';
            } else {
                relatedList.forEach(prod => {
                    const card = document.createElement('div');
                    card.className = 'bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer';
                    card.innerHTML = `
                        <img src="${prod.image}" alt="${prod.name}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h4 class="font-semibold text-gray-800 truncate">${prod.name}</h4>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-pharmacy-blue font-bold">${prod.price}</span>
                                ${prod.originalPrice ? `<span class="text-sm text-gray-500 line-through">${prod.originalPrice}</span>` : ''}
                            </div>
                            <button onclick="openProductDetails(${prod.id}); event.stopPropagation();" 
                                    class="mt-3 w-full bg-pharmacy-blue text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                                View Details
                            </button>
                        </div>
                    `;
                    card.addEventListener('click', () => openProductDetails(prod.id));
                    relatedContainer.appendChild(card);
                });
            }
        }

        logInfo('Product loaded from URL params with correct related products');
        return true;

    } catch (error) {
        logError('Error loading from URL params:', error);
        return false;
    }
}

// Function to load product data from backend
async function loadProductData() {
    try {
        const params = getUrlParams();
        const productId = params.id;
        
        logInfo(`Loading product data for ID: ${productId}`);
        
        if (!productId) {
            logWarn('No product ID found in URL parameters');
            showProductNotFound();
            return;
        }
        
        // First, try to load from URL parameters (from your card click)
        const loadedFromParams = loadProductFromUrlParams();
        
        if (loadedFromParams) {
            logInfo('Product loaded from URL parameters successfully');
            // Still try to fetch from backend for additional data, but don't fail if it doesn't work
            try {
                logInfo(`Attempting to fetch additional data from backend: ${API_BASE_URL}/get-product/${productId}`);
                const response = await fetch(`${API_BASE_URL}/get-product/${productId}`);
                
                if (response.ok) {
                    const product = await response.json();
                    logInfo('Additional product data fetched from backend', { 
                        id: product.productId, 
                        name: product.productName 
                    });
                    
                    // Update with backend data if available
                    if (product.productSubImages && product.productSubImages.length > 0) {
                        const thumbnails = [`${API_BASE_URL}/${productId}/image`];
                        for (let i = 0; i < product.productSubImages.length; i++) {
                            thumbnails.push(`${API_BASE_URL}/${productId}/subimage/${i}`);
                        }
                        renderThumbnails(thumbnails, productId);
                    }
                    
                    // Load related products from backend
                    if (product.productCategory) {
                        loadRelatedProducts(product.productCategory, productId);
                    }
                }
            } catch (error) {
                logWarn('Could not fetch additional data from backend, using URL params only', error);
            }
            return;
        }
        
        // If URL params failed, try backend API
        logInfo('Falling back to backend API');
        
        // Show loading state
        document.getElementById('product-name').textContent = 'Loading...';
        document.getElementById('selling-price').textContent = '';
        
        // Fetch product data from backend
        logInfo(`Fetching product data from: ${API_BASE_URL}/get-product/${productId}`);
        const response = await fetch(`${API_BASE_URL}/get-product/${productId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                logWarn(`Product not found with ID: ${productId}`);
                showProductNotFound();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }
        
        const product = await response.json();
        logInfo('Product data fetched successfully from backend', { 
            id: product.productId, 
            name: product.productName,
            category: product.productCategory 
        });
        
        // Update product details with proper field mapping
        document.getElementById('product-name').textContent = product.productName;
        document.getElementById('selling-price').textContent = `₹${product.productPrice}`;
        
        if (product.productOldPrice && product.productOldPrice > product.productPrice) {
            document.getElementById('original-price').textContent = `₹${product.productOldPrice}`;
            const discountPercent = Math.round((1 - product.productPrice/product.productOldPrice) * 100);
            document.getElementById('discount').textContent = `${discountPercent}% off`;
            document.getElementById('original-price').style.display = 'inline';
            document.getElementById('discount').style.display = 'inline';
            logInfo(`Price discount applied: ${discountPercent}%`);
        } else {
            document.getElementById('original-price').style.display = 'none';
            document.getElementById('discount').style.display = 'none';
            logInfo('No discount available for this product');
        }
        
        // Update product information sections
        document.getElementById('product-description').textContent = product.productDescription || 'No description available.';
        
        // Handle ingredients - convert array to string if needed
        let ingredientsText = 'Not specified.';
        if (product.ingredientsList && Array.isArray(product.ingredientsList)) {
            ingredientsText = product.ingredientsList.join(', ');
        } else if (product.ingredientsList) {
            ingredientsText = product.ingredientsList;
        }
        document.getElementById('product-ingredients').textContent = ingredientsText;
        
        // Handle benefits - convert array to string if needed
        let benefitsText = 'Not specified.';
        if (product.benefitsList && Array.isArray(product.benefitsList)) {
            benefitsText = product.benefitsList.join(', ');
        } else if (product.benefitsList) {

            benefitsText = product.benefitsList;
        }
        document.getElementById('product-benefits').textContent = benefitsText;
        
        // Set main product image
        const mainImage = document.getElementById('main-product-image');
        if (product.productMainImage) {
            mainImage.src = `${API_BASE_URL}/${productId}/image`;
            logInfo('Main product image set');
        } else {
            mainImage.src = 'https://via.placeholder.com/500x400?text=No+Image';
            logWarn('No main product image available, using placeholder');
        }
        mainImage.alt = product.productName;

        // Handle prescription badge
        const prescriptionBadge = document.getElementById('prescription-badge');
        if (prescriptionBadge) {
            if (product.prescriptionRequired) {
                prescriptionBadge.classList.remove('hidden');
                logInfo('Prescription required badge shown');
            } else {
                prescriptionBadge.classList.add('hidden');
                logInfo('Prescription not required, badge hidden');
            }
        }

        // Handle conditional sections
        const babyCareSection = document.getElementById('baby-care-section');
        const motherCareSection = document.getElementById('mother-care-section');
        if (babyCareSection && motherCareSection) {
            if (product.productCategory === 'Baby Care') {
                babyCareSection.classList.remove('hidden');
                motherCareSection.classList.add('hidden');
                logInfo('Baby care section shown');
            } else if (product.productCategory === 'Mother Care' || product.productCategory === 'Feminine Care') {
                motherCareSection.classList.remove('hidden');
                babyCareSection.classList.add('hidden');
                logInfo('Mother care section shown');
            } else {
                babyCareSection.classList.add('hidden');
                motherCareSection.classList.add('hidden');
                logInfo('No special care sections shown');
            }
        }

        // Prepare thumbnails - main image + sub images
        const thumbnails = [`${API_BASE_URL}/${productId}/image`];
        
        // Add sub-images if available
        if (product.productSubImages && product.productSubImages.length > 0) {
            for (let i = 0; i < product.productSubImages.length; i++) {
                thumbnails.push(`${API_BASE_URL}/${productId}/subimage/${i}`);
            }
            logInfo(`Added ${product.productSubImages.length} sub-images`);
        } else {
            logInfo('No sub-images available');
        }
        
        // Render thumbnails
        renderThumbnails(thumbnails, productId);

        // Render variants if available
        if (product.productVariants && product.productVariants.length > 0) {
            renderVariants(product.productVariants);
            logInfo(`Rendered ${product.productVariants.length} variant options`);
        } else {
            // Default variants
            const defaultVariants = ['30 tablets', '60 tablets', '90 tablets'];
            renderVariants(defaultVariants);
            logInfo('Rendered default variant options');
        }
        
        // Use productSizes from backend entity
        const sizes = product.productSizes || [];
        if (sizes.length > 0) {
            renderSizes(sizes);
            logInfo(`Rendered ${sizes.length} size options`);
        } else {
            logInfo('No size options available');
        }
        
        // Load related products
        if (product.productCategory) {
            logInfo(`Loading related products for category: ${product.productCategory}`);
            loadRelatedProducts(product.productCategory, productId);
        } else {
            logWarn('No product category found for related products');
            loadRelatedProductsPlaceholder();
        }
        
        logInfo('Product data loaded successfully');
        
    } catch (error) {
        logError('Error loading product:', error);
        // Try to load from URL params as fallback
        const loadedFromParams = loadProductFromUrlParams();
        if (!loadedFromParams) {
            showProductNotFound();
        }
    }
}

// Function to show product not found message
function showProductNotFound() {
    try {
        logWarn('Showing product not found message');
        document.getElementById('product-name').textContent = 'Product Not Found';
        document.getElementById('product-description').textContent = 'The requested product could not be found. Please check the product ID and try again.';
        document.getElementById('selling-price').textContent = '';
        document.getElementById('original-price').style.display = 'none';
        document.getElementById('discount').style.display = 'none';
        document.getElementById('main-product-image').src = 'https://via.placeholder.com/500x400?text=Not+Found';
        document.getElementById('thumbnail-container').innerHTML = '';
        document.getElementById('related-products').innerHTML = '<p class="text-center text-gray-500">No related products available.</p>';
    } catch (error) {
        logError('Error showing product not found message:', error);
    }
}

// Initialize everything when DOM is ready (this is called by init() from onload)
function init() {
    try {
        logInfo('Initializing product details page (called from onload)');
        loadProductData();
        updateCartCount();
        initTabs();
        initSelectionButtons();
        initCart();
        logInfo('Product details page initialized successfully');
    } catch (error) {
        logError('Error during page initialization:', error);
    }
}

// Also initialize on DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', () => {
    try {
        logInfo('DOM Content Loaded event fired');
        // Check if init was already called by onload
        if (document.getElementById('product-name').textContent === 'Product Name Here') {
            logInfo('Init not called yet, initializing now');
            init();
        } else {
            logInfo('Init already called by onload, skipping DOMContentLoaded init');
        }
    } catch (error) {
        logError('Error during DOMContentLoaded initialization:', error);
    }
});

// Export for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCartCount,
        addToCart,
        getUrlParams,
        loadProductData,
        showProductNotFound,
        init
    };
}