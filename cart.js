/* ==============================
   cart.js – FINAL FIX: NO NaN PRICES
   Works with "₹189" or 189 format
   ============================== */

console.log("cart.js loaded");

// Safely initialize cart
if (typeof cart === 'undefined') {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
}

// Helper: Convert "₹189" or "189" → real number
function cleanPrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        return parseFloat(price.replace(/[^0-9.-]/g, '')) || 0;
    }
    return 0;
}

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items-container');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const shippingTextEl = document.getElementById('shipping-text');
const cartCountEl = document.getElementById('cart-count');
const itemCountEl = document.getElementById('item-count');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Update counts
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        cartCountEl.parentElement.classList.toggle('hidden', totalItems === 0);
    }
    if (itemCountEl) itemCountEl.textContent = totalItems + ' item' + (totalItems !== 1 ? 's' : '');

    // Empty cart
    if (cart.length === 0) {
        document.getElementById('empty-cart-fullscreen').classList.remove('hidden');
        document.getElementById('cart-with-items').classList.add('hidden');
        return;
    }

    document.getElementById('empty-cart-fullscreen').classList.add('hidden');
    document.getElementById('cart-with-items').classList.remove('hidden');

    // Render items
    cartItemsContainer.innerHTML = cart.map((item, index) => {
        const price = cleanPrice(item.price);
        const qty = item.quantity || 1;
        const lineTotal = price * qty;

        return `
        <div class="cart-item bg-white border rounded-lg p-5 flex gap-5 items-center hover:shadow-md transition">
            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
            <div class="flex-1">
                <h3 class="font-bold text-lg">${item.name}</h3>
                <p class="text-gray-600">₹${price.toFixed(2)} each</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="updateQty(${index}, ${qty - 1})" class="w-10 h-10 rounded-lg border hover:bg-gray-100 text-lg">-</button>
                <span class="w-12 text-center font-bold text-xl">${qty}</span>
                <button onclick="updateQty(${index}, ${qty + 1})" class="w-10 h-10 rounded-lg border hover:bg-gray-100 text-lg">+</button>
            </div>
            <div class="text-right">
                <p class="font-bold text-xl">₹${lineTotal.toFixed(2)}</p>
                <button onclick="removeItem(${index})" class="text-red-600 text-sm hover:underline">Remove</button>
            </div>
        </div>`;
    }).join('');

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + cleanPrice(item.price) * (item.quantity || 1), 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal >= 499 ? 0 : 49;
    const total = subtotal + tax + shipping;

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    totalEl.textContent = `₹${total.toFixed(2)}`;
    shippingTextEl.textContent = shipping === 0 ? 'Free' : '₹49.00';

    // Prescription notice
    const hasRx = cart.some(item => item.prescriptionRequired);
    document.getElementById('prescription-notice')?.classList.toggle('hidden', !hasRx);
}

// Global functions
window.updateQty = function(index, newQty) {
    if (newQty < 1) return removeItem(index);
    cart[index].quantity = newQty;
    saveCart();
    updateCartUI();
};

window.removeItem = function(index) {
    if (confirm('Remove this item?')) {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    }
};

window.proceedToCheckout = function() {
    if (cart.length === 0) return alert('Cart is empty!');
    location.href = 'checkout.html';
};

// Auto-run
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateCartUI, 100);
});