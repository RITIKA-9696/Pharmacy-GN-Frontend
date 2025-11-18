


/*=====================================================================
  product-details.js
  - Loads product from Spring Boot API (byte[] images)
  - Handles main image carousel, thumbnails, dots
  - Size selector, quantity, stock status
  - Add to cart / wishlist (localStorage)
  - Cart & Wishlist modals with full CRUD
  - Related products (same category)
  - Mobile menu, search redirect, notifications
=====================================================================*/

(() => {
  // -----------------------------------------------------------------
  // CONFIG & STATE
  // -----------------------------------------------------------------
  const API_BASE_URL = 'http://localhost:8083/api/mb/products';
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  let selectedProduct = null;
  let allProducts = [];
  let currentImageIndex = 0;
  let quantity = 1;
  let selectedSize = null;

  // -----------------------------------------------------------------
  // DOM ELEMENTS (cached once)
  // -----------------------------------------------------------------
  const els = {
    mainImage: document.getElementById('mainImage'),
    thumbnailImages: document.getElementById('thumbnailImages'),
    carouselDots: document.getElementById('carouselDots'),
    productTitle: document.getElementById('productTitle'),
    productRating: document.getElementById('productRating'),
    reviewCount: document.getElementById('reviewCount'),
    productPrice: document.getElementById('productPrice'),
    originalPrice: document.getElementById('originalPrice'),
    discountBadge: document.getElementById('discountBadge'),
    productDescription: document.getElementById('productDescription'),
    productSizes: document.getElementById('productSizes'),
    stockStatus: document.getElementById('stockStatus'),
    quantitySpan: document.getElementById('quantity'),
    productBrand: document.getElementById('productBrand'),
    productCategory: document.getElementById('productCategory'),
    breadcrumbCategory: document.getElementById('breadcrumbCategory'),
    relatedProducts: document.getElementById('relatedProducts'),
    addToCartBtn: document.getElementById('addToCart'),
    addToWishlistBtn: document.getElementById('addToWishlist'),
    decreaseQtyBtn: document.getElementById('decreaseQty'),
    increaseQtyBtn: document.getElementById('increaseQty'),
    prevImageBtn: document.getElementById('prevImage'),
    nextImageBtn: document.getElementById('nextImage'),

    // Modals
    cartBtn: document.getElementById('cartBtn'),
    wishlistBtn: document.getElementById('wishlistBtn'),
    cartModal: document.getElementById('cartModal'),
    wishlistModal: document.getElementById('wishlistModal'),
    closeCartModal: document.getElementById('closeCartModal'),
    closeWishlistModal: document.getElementById('closeWishlistModal'),
    cartContent: document.getElementById('cartContent'),
    cartTotal: document.getElementById('cartTotal'),
    cartFooter: document.getElementById('cartFooter'),
    wishlistContent: document.getElementById('wishlistContent'),
    wishlistFooter: document.getElementById('wishlistFooter'),
    clearCartBtn: document.getElementById('clearCart'),
    clearWishlistBtn: document.getElementById('clearWishlist'),
    checkoutBtn: document.getElementById('checkoutBtn'),

    // Navbar
    cartCount: document.getElementById('cartCount'),
    wishlistCount: document.getElementById('wishlistCount'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    searchInput: document.getElementById('searchInput'),
    mobileSearchInput: document.getElementById('mobileSearchInput')
  };

  // -----------------------------------------------------------------
  // API SERVICE
  // -----------------------------------------------------------------
  const api = {
    async getProduct(id) {
      try {
        const res = await fetch(`${API_BASE_URL}/${id}`);
        if (!res.ok) throw new Error('Not found');
        const p = await res.json();

        const base = `${API_BASE_URL}/${id}`;
        const main = `${base}/image`;
        const subs = [];
        for (let i = 0; i < (p.subImageCount || 0); i++) subs.push(`${base}/subimage/${i}`);

        return { ...p, images: [main, ...subs] };
      } catch (e) {
        console.error(e);
        return null;
      }
    },

    async getAllProducts() {
      try {
        const res = await fetch(`${API_BASE_URL}/get-all`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();

        return data.map(p => {
          const base = `${API_BASE_URL}/${p.id}`;
          const main = `${base}/image`;
          const subs = [];
          for (let i = 0; i < (p.subImageCount || 0); i++) subs.push(`${base}/subimage/${i}`);
          return { ...p, images: [main, ...subs] };
        });
      } catch (e) {
        console.error(e);
        return [];
      }
    }
  };

  // -----------------------------------------------------------------
  // INITIAL LOAD
  // -----------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', async () => {
    await loadAllProducts();
    const id = parseInt(localStorage.getItem('selectedProductId'));
    if (!id) return redirectToHome();

    selectedProduct = await api.getProduct(id);
    if (!selectedProduct) return showErrorState();

    renderProduct();
    renderRelatedProducts();
    updateCounts();
    setupEventListeners();
  });

  function redirectToHome() {
    alert('No product selected');
    window.location.href = 'babycare.html';
  }

  function showErrorState() {
    els.productTitle.textContent = 'Product Not Found';
    els.productDescription.textContent = 'Please select a valid product.';
    els.addToCartBtn.disabled = true;
    els.addToWishlistBtn.disabled = true;
    els.relatedProducts.innerHTML = '<p class="text-center text-gray-500">No related products.</p>';
  }

  async function loadAllProducts() {
    allProducts = await api.getAllProducts();
  }

  // -----------------------------------------------------------------
  // RENDER PRODUCT
  // -----------------------------------------------------------------
  function renderProduct() {
    // Text
    els.productTitle.textContent = selectedProduct.title || 'Untitled';
    els.productDescription.textContent = selectedProduct.description || 'No description';
    els.productPrice.textContent = `₹${(selectedProduct.price || 0).toFixed(2)}`;
    els.originalPrice.textContent = selectedProduct.originalPrice > selectedProduct.price
      ? `₹${selectedProduct.originalPrice.toFixed(2)}` : '';
    els.discountBadge.textContent = selectedProduct.discount > 0 ? `${selectedProduct.discount}% OFF` : '';
    els.reviewCount.textContent = `(${selectedProduct.reviewCount || 0} reviews)`;
    els.productBrand.innerHTML = `<span class="font-medium">Brand:</span> ${selectedProduct.brand || 'Unknown'}`;
    els.productCategory.innerHTML = `<span class="font-medium">Category:</span> ${formatCategory(selectedProduct.category)}`;
    els.breadcrumbCategory.textContent = selectedProduct.title || 'Product';

    // Rating
    els.productRating.innerHTML = generateStars(selectedProduct.rating || 0);

    // Stock
    const stock = selectedProduct.stockQuantity ?? Infinity;
    if (selectedProduct.inStock) {
      if (stock > 10) {
        els.stockStatus.textContent = 'In Stock';
        els.stockStatus.className = 'in-stock';
      } else if (stock > 0) {
        els.stockStatus.textContent = `Only ${stock} left`;
        els.stockStatus.className = 'low-stock';
      } else {
        els.stockStatus.textContent = 'Out of Stock';
        els.stockStatus.className = 'out-of-stock';
        els.addToCartBtn.disabled = true;
        els.addToCartBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    } else {
      els.stockStatus.textContent = 'Out of Stock';
      els.stockStatus.className = 'out-of-stock';
      els.addToCartBtn.disabled = true;
    }

    // Sizes
    const sizes = selectedProduct.sizes || [];
    if (sizes.length) {
      els.productSizes.innerHTML = sizes.map(s =>
        `<button class="size-option" data-size="${s}">${s}</button>`
      ).join('');
      document.querySelectorAll('.size-option').forEach(btn =>
        btn.addEventListener('click', () => selectSize(btn))
      );
    } else {
      els.productSizes.innerHTML = '<p class="text-gray-600">One Size</p>';
      selectedSize = 'One Size';
    }

    renderImageCarousel();
    updateWishlistButton();
  }

  // -----------------------------------------------------------------
  // IMAGE CAROUSEL
  // -----------------------------------------------------------------
  function renderImageCarousel() {
    const images = selectedProduct.images?.length ? selectedProduct.images : ['/placeholder.svg?height=400&width=400'];

    // Main
    els.mainImage.innerHTML = `<img src="${images[currentImageIndex]}" alt="Main" class="w-full h-full object-contain" onerror="this.src='/placeholder.svg?height=400&width=400'">`;

    // Thumbnails
    els.thumbnailImages.innerHTML = images.map((src, i) =>
      `<img src="${src}" alt="Thumb ${i+1}" class="thumbnail ${i===currentImageIndex?'active':''}" data-index="${i}" onerror="this.src='/placeholder.svg?height=100&width=100'">`
    ).join('');

    // Dots
    els.carouselDots.innerHTML = images.map((_, i) =>
      `<div class="carousel-dot ${i===currentImageIndex?'active':''}" data-index="${i}"></div>`
    ).join('');

    // Listeners
    els.thumbnailImages.querySelectorAll('.thumbnail').forEach(t =>
      t.addEventListener('click', () => changeImage(+t.dataset.index))
    );
    els.carouselDots.querySelectorAll('.carousel-dot').forEach(d =>
      d.addEventListener('click', () => changeImage(+d.dataset.index))
    );
  }

  function changeImage(idx) {
    const total = selectedProduct.images?.length || 1;
    currentImageIndex = (idx + total) % total;
    renderImageCarousel();
  }

  // -----------------------------------------------------------------
  // SIZE, QUANTITY
  // -----------------------------------------------------------------
  function selectSize(btn) {
    document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSize = btn.dataset.size;
  }

  function updateQuantity(delta) {
    const max = selectedProduct.stockQuantity ?? Infinity;
    quantity = Math.max(1, Math.min(max, quantity + delta));
    els.quantitySpan.textContent = quantity;
  }

  // -----------------------------------------------------------------
  // CART & WISHLIST
  // -----------------------------------------------------------------
  function addToCart() {
    if (!selectedProduct.inStock) return notify('Out of stock', 'error');
    if (selectedProduct.sizes?.length && !selectedSize) return notify('Select a size', 'error');

    const item = {
      id: selectedProduct.id,
      title: selectedProduct.title,
      price: selectedProduct.price,
      images: selectedProduct.images,
      size: selectedSize || 'One Size',
      quantity
    };

    const existing = cart.find(i => i.id === item.id && i.size === item.size);
    if (existing) existing.quantity += quantity;
    else cart.push(item);

    saveCart();
    updateCounts();
    notify('Added to cart!');
  }

  function toggleWishlist() {
    const idx = wishlist.findIndex(i => i.id === selectedProduct.id);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      notify('Removed from wishlist');
    } else {
      wishlist.push({
        id: selectedProduct.id,
        title: selectedProduct.title,
        price: selectedProduct.price,
        images: selectedProduct.images
      });
      notify('Added to wishlist!');
    }
    saveWishlist();
    updateCounts();
    updateWishlistButton();
  }

  function updateWishlistButton() {
    const inList = wishlist.some(i => i.id === selectedProduct.id);
    els.addToWishlistBtn.innerHTML = inList
      ? `<i class="fas fa-heart mr-2"></i>Added to Wishlist`
      : `<i class="far fa-heart mr-2"></i>Add to Wishlist`;
    els.addToWishlistBtn.classList.toggle('active', inList);
  }

  function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }
  function saveWishlist() { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }

  function updateCounts() {
    const cartTotal = cart.reduce((s, i) => s + i.quantity, 0);
    els.cartCount.textContent = cartTotal;
    els.cartCount.classList.toggle('hidden', cartTotal === 0);

    els.wishlistCount.textContent = wishlist.length;
    els.wishlistCount.classList.toggle('hidden', wishlist.length === 0);
  }

  // -----------------------------------------------------------------
  // MODALS
  // -----------------------------------------------------------------
  function openCartModal() {
    els.cartModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderCart();
  }

  function openWishlistModal() {
    els.wishlistModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderWishlist();
  }

  function closeCartModal() {
    els.cartModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  function closeWishlistModal() {
    els.wishlistModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  function renderCart() {
    if (!cart.length) return renderEmptyCart();

    let total = 0;
    els.cartContent.innerHTML = '';
    cart.forEach((item, idx) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-4 py-4 border-b last:border-b-0';
      div.innerHTML = `
        <img src="${item.images?.[0] || '/placeholder.svg'}" alt="${item.title}" class="w-16 h-16 object-cover rounded">
        <div class="flex-1">
          <h4 class="font-semibold">${item.title}</h4>
          <p class="text-sm text-gray-600">Size: ${item.size}</p>
          <p class="text-sm text-gray-600">₹${item.price.toFixed(2)}</p>
        </div>
        <div class="flex items-center space-x-1">
          <button class="w-8 h-8 bg-gray-200 rounded-full dec" data-idx="${idx}">-</button>
          <span class="w-8 text-center">${item.quantity}</span>
          <button class="w-8 h-8 bg-gray-200 rounded-full inc" data-idx="${idx}">+</button>
        </div>
        <div class="text-right">
          <p class="font-semibold">₹${itemTotal.toFixed(2)}</p>
          <button class="text-red-500 text-sm remove" data-idx="${idx}">Remove</button>
        </div>
      `;
      els.cartContent.appendChild(div);
    });

    els.cartTotal.textContent = `₹${total.toFixed(2)}`;
    els.cartFooter.classList.remove('hidden');

    // Bind buttons
    els.cartContent.querySelectorAll('.dec').forEach(b =>
      b.addEventListener('click', () => { if (cart[+b.dataset.idx].quantity > 1) { cart[+b.dataset.idx].quantity--; saveCart(); renderCart(); updateCounts(); } })
    );
    els.cartContent.querySelectorAll('.inc').forEach(b =>
      b.addEventListener('click', () => { cart[+b.dataset.idx].quantity++; saveCart(); renderCart(); updateCounts(); })
    );
    els.cartContent.querySelectorAll('.remove').forEach(b =>
      b.addEventListener('click', () => { cart.splice(+b.dataset.idx, 1); saveCart(); renderCart(); updateCounts(); notify('Removed'); })
    );
  }

  function renderEmptyCart() {
    els.cartContent.innerHTML = `<div class="text-center py-8"><i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i><p>Your cart is empty</p></div>`;
    els.cartFooter.classList.add('hidden');
  }

  function renderWishlist() {
    if (!wishlist.length) return renderEmptyWishlist();

    els.wishlistContent.innerHTML = '';
    wishlist.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'flex items-center space-x-4 p-4 border rounded hover:shadow transition';
      div.innerHTML = `
        <img src="${item.images?.[0] || '/placeholder.svg'}" alt="${item.title}" class="w-20 h-20 object-cover rounded">
        <div class="flex-1">
          <h4 class="font-semibold">${item.title}</h4>
          <p class="text-sm text-gray-600">₹${item.price.toFixed(2)}</p>
        </div>
        <div class="flex flex-col space-y-1">
          <button class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm add-cart" data-idx="${idx}">Add to Cart</button>
          <button class="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm remove-wish" data-idx="${idx}">Remove</button>
        </div>
      `;
      els.wishlistContent.appendChild(div);
    });

    els.wishlistFooter.classList.remove('hidden');

    document.querySelectorAll('.add-cart').forEach(b => b.addEventListener('click', () => {
      const p = wishlist[+b.dataset.idx];
      const existing = cart.find(i => i.id === p.id);
      if (existing) existing.quantity += 1;
      else cart.push({ ...p, quantity: 1, size: 'One Size' });
      saveCart(); updateCounts(); renderCart(); notify('Added from wishlist');
    }));
    document.querySelectorAll('.remove-wish').forEach(b => b.addEventListener('click', () => {
      wishlist.splice(+b.dataset.idx, 1);
      saveWishlist(); renderWishlist(); updateCounts(); notify('Removed');
    }));
  }

  function renderEmptyWishlist() {
    els.wishlistContent.innerHTML = `<div class="text-center py-8"><i class="fas fa-heart text-6xl text-gray-300 mb-4"></i><p>Your wishlist is empty</p></div>`;
    els.wishlistFooter.classList.add('hidden');
  }

  // -----------------------------------------------------------------
  // RELATED PRODUCTS
  // -----------------------------------------------------------------
  function renderRelatedProducts() {
    const related = allProducts
      .filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category)
      .slice(0, 4);

    if (!related.length) {
      els.relatedProducts.innerHTML = '<p class="text-center text-gray-500">No related products.</p>';
      return;
    }

    els.relatedProducts.innerHTML = related.map(p => `
      <div class="related-product-card">
        <img src="${p.images?.[0] || '/placeholder.svg'}" alt="${p.title}" class="w-full h-48 object-contain">
        <div class="p-4">
          <h3 class="font-semibold truncate">${p.title}</h3>
          <div class="flex text-yellow-400 text-sm">${generateStars(p.rating || 0)}</div>
          <p class="font-bold text-blue-600">₹${p.price.toFixed(2)}</p>
          <button onclick="viewProduct(${p.id})" class="mt-2 w-full bg-blue-100 text-blue-600 py-2 rounded text-sm hover:bg-blue-200">View Details</button>
        </div>
      </div>
    `).join('');
  }

  window.viewProduct = id => {
    localStorage.setItem('selectedProductId', id);
    location.reload();
  };

  // -----------------------------------------------------------------
  // EVENT LISTENERS
  // -----------------------------------------------------------------
  function setupEventListeners() {
    els.prevImageBtn.addEventListener('click', () => changeImage(currentImageIndex - 1));
    els.nextImageBtn.addEventListener('click', () => changeImage(currentImageIndex + 1));
    els.decreaseQtyBtn.addEventListener('click', () => updateQuantity(-1));
    els.increaseQtyBtn.addEventListener('click', () => updateQuantity(1));
    els.addToCartBtn.addEventListener('click', addToCart);
    els.addToWishlistBtn.addEventListener('click', toggleWishlist);

    els.cartBtn.addEventListener('click', openCartModal);
    els.wishlistBtn.addEventListener('click', openWishlistModal);
    els.closeCartModal.addEventListener('click', closeCartModal);
    els.closeWishlistModal.addEventListener('click', closeWishlistModal);
    els.cartModal.addEventListener('click', e => e.target === els.cartModal && closeCartModal());
    els.wishlistModal.addEventListener('click', e => e.target === els.wishlistModal && closeWishlistModal());

    els.clearCartBtn.addEventListener('click', () => confirm('Clear cart?') && (cart = [], saveCart(), renderCart(), updateCounts(), notify('Cart cleared')));
    els.clearWishlistBtn.addEventListener('click', () => confirm('Clear wishlist?') && (wishlist = [], saveWishlist(), renderWishlist(), updateCounts(), notify('Wishlist cleared')));
    els.checkoutBtn.addEventListener('click', () => cart.length ? notify('Redirecting to checkout...') : notify('Cart empty', 'error'));

    els.mobileMenuBtn.addEventListener('click', () => {
      els.mobileMenu.classList.toggle('open');
      const i = els.mobileMenuBtn.querySelector('i');
      i.classList.toggle('fa-bars');
      i.classList.toggle('fa-times');
    });

    els.searchInput.addEventListener('input', redirectSearch);
    els.mobileSearchInput.addEventListener('input', redirectSearch);
  }

  function redirectSearch(e) {
    if (e.target.value.trim()) {
      localStorage.setItem('searchTerm', e.target.value.trim());
      window.location.href = 'babycare.html';
    }
  }

  // -----------------------------------------------------------------
  // UTILS
  // -----------------------------------------------------------------
  function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '<i class="fas fa-star"></i>'.repeat(full) +
           (half ? '<i class="fas fa-star-half-alt"></i>' : '') +
           '<i class="far fa-star"></i>'.repeat(empty);
  }

  function formatCategory(cat) {
    return (cat || '').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' & ');
  }

  function notify(msg, type = 'success') {
    const n = document.createElement('div');
    n.textContent = msg;
    n.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white transition-transform transform translate-x-full ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    document.body.appendChild(n);
    setTimeout(() => n.classList.remove('translate-x-full'), 10);
    setTimeout(() => {
      n.classList.add('translate-x-full');
      setTimeout(() => n.remove(), 300);
    }, 3000);
  }
})();

