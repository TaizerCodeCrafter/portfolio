const db = new Dexie("AutoPartsDB");

db.version(20).stores({
    products: "++id, name, category, chassisNumber, sku",
    inventory: "++id, productId, costPrice, sellPrice, stockQuantity, minStockLevel",
    sales: "++id, timestamp, totalAmount, discount, paymentMethod",
    saleItems: "++id, saleId, productId, quantity, unitPrice"
});

// Update for Credit/Installments features
db.version(21).stores({
    customers: "++id, name, phone, nic, address",
    credits: "++id, customerId, saleId, totalAmount, extraCharge, paidAmount, balance, status, dueDate", // status: 'pending', 'completed'
    installments: "++id, creditId, amount, paymentDate, paymentMethod"
}).upgrade(tx => {
    // Modify sales table to add customerId optionally
    return tx.table("sales").toCollection().modify(sale => {
        sale.customerId = sale.customerId || null;
        sale.extraCharge = sale.extraCharge || 0;
    });
});
// Dexie allows adding arbitrary properties to records, so `image` will be successfully saved without a schema migration.

let websiteProducts = [];
let websiteCart = [];
let currentWebCategory = 'All';

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadWebsiteData();
    initHeroSlider();
    initWaChat();
});

// ----- WhatsApp Chat Widget -----
function initWaChat() {
    const popup = document.getElementById('wa-popup');
    setTimeout(() => {
        popup.classList.remove('scale-0', 'opacity-0');
        popup.classList.add('scale-100', 'opacity-100');
    }, 3000);
}

function toggleWaPopup() {
    const popup = document.getElementById('wa-popup');
    if (popup.classList.contains('scale-0')) {
        popup.classList.remove('scale-0', 'opacity-0');
        popup.classList.add('scale-100', 'opacity-100');
    } else {
        closeWaPopup();
    }
}

function closeWaPopup() {
    const popup = document.getElementById('wa-popup');
    popup.classList.add('scale-0', 'opacity-0');
    popup.classList.remove('scale-100', 'opacity-100');
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('opacity-100');
        slides[currentSlide].classList.add('opacity-0');

        currentSlide = (currentSlide + 1) % slides.length;

        slides[currentSlide].classList.remove('opacity-0');
        slides[currentSlide].classList.add('opacity-100');
    }, 4000);
}

function showWebToast(message) {
    const container = document.getElementById('website-toast-container');
    const toast = document.createElement('div');
    toast.className = `bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl transform transition-all duration-300 translate-y-full opacity-0 flex items-center gap-3 text-sm font-medium z-50`;
    toast.innerHTML = `<i class="fa-solid fa-check-circle text-green-400"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

const formatCurrency = (amt) => `Rs ${parseFloat(amt || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

async function loadWebsiteData() {
    const products = await db.products.toArray();
    const inventory = await db.inventory.toArray();

    websiteProducts = products.map(p => {
        const inv = inventory.find(i => i.productId === p.id) || {};
        return { ...p, ...inv };
    });

    renderWebCategories();
    filterWebsiteProducts();
}

function renderWebCategories() {
    const categories = ['All', ...new Set(websiteProducts.map(p => p.category))];
    const catContainer = document.getElementById('web-categories');
    catContainer.innerHTML = '';

    categories.forEach(cat => {
        const isActive = cat === currentWebCategory
            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 font-medium'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300';

        catContainer.innerHTML += `
            <button class="px-6 py-2 rounded-full text-sm whitespace-nowrap transition-all ${isActive}" 
                    onclick="setWebCategory('${cat}')">${cat}</button>
        `;
    });
}

function setWebCategory(cat) {
    currentWebCategory = cat;
    document.getElementById('current-category-title').innerText = cat === 'All' ? 'Featured Products' : `${cat} Parts`;
    renderWebCategories();
    filterWebsiteProducts();
}

function filterWebsiteProducts() {
    const search = document.getElementById('web-search').value.toLowerCase();
    const container = document.getElementById('web-products-grid');
    const noMsg = document.getElementById('no-products-msg');

    let filtered = websiteProducts;

    if (currentWebCategory !== 'All') {
        filtered = filtered.filter(p => p.category === currentWebCategory);
    }

    if (search) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.category && p.category.toLowerCase().includes(search)) ||
            (p.sku && p.sku.toLowerCase().includes(search))
        );
    }

    document.getElementById('product-count').innerText = `${filtered.length} items`;
    container.innerHTML = '';

    if (filtered.length === 0) {
        noMsg.classList.remove('hidden');
    } else {
        noMsg.classList.add('hidden');
        filtered.forEach(p => {
            const isOutOfStock = p.stockQuantity <= 0;
            const imgSrc = p.image || 'https://images.unsplash.com/photo-1606574929314-ecbd307c02b2?q=80&w=400&auto=format&fit=crop';

            container.innerHTML += `
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full product-card relative overflow-hidden group">
                    
                    ${isOutOfStock ? `<div class="absolute top-2 left-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded z-10 uppercase tracking-wider">Out of Stock</div>` : ''}
                    ${p.stockQuantity > 0 && p.stockQuantity <= 3 ? `<div class="absolute top-2 left-2 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded z-10 uppercase tracking-wider">Only ${p.stockQuantity} Left</div>` : ''}
                    
                    <div class="h-40 w-full rounded-xl overflow-hidden bg-gray-50 mb-4 relative flex items-center justify-center">
                        <img src="${imgSrc}" class="product-img w-full h-full object-cover" alt="${p.name}">
                    </div>
                    
                    <div class="flex-1 flex flex-col">
                        <span class="text-xs text-brand-500 font-medium mb-1">${p.category}</span>
                        <h3 class="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2" title="${p.name}">${p.name}</h3>
                        
                        <div class="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                            <span class="font-bold text-lg text-gray-900">${formatCurrency(p.sellPrice)}</span>
                            <button onclick="${isOutOfStock ? '' : `addToWebCart(${p.id})`}" 
                               class="h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
                }">
                                <i class="fa-solid ${isOutOfStock ? 'fa-ban' : 'fa-plus'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

// ----- Shopping Cart Logic -----

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function addToWebCart(productId) {
    const product = websiteProducts.find(p => p.id === productId);
    if (!product || product.stockQuantity <= 0) return;

    const existing = websiteCart.find(item => item.id === productId);
    if (existing) {
        if (existing.quantity >= product.stockQuantity) {
            alert('Maximum available stock reached.');
            return;
        }
        existing.quantity += 1;
    } else {
        websiteCart.push({
            id: product.id,
            name: product.name,
            price: product.sellPrice,
            image: product.image,
            quantity: 1,
            maxStock: product.stockQuantity
        });
    }

    renderWebCart();
    showWebToast(`${product.name} added to cart!`);

    if (document.getElementById('cart-sidebar').classList.contains('translate-x-full')) {
        toggleCart();
    }
}

function updateWebCartQty(id, delta) {
    const item = websiteCart.find(i => i.id === id);
    if (item) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
            if (newQty > item.maxStock) {
                alert('Cannot exceed available stock.');
                return;
            }
            item.quantity = newQty;
        } else {
            websiteCart = websiteCart.filter(i => i.id !== id);
        }
        renderWebCart();
    }
}

function renderWebCart() {
    const container = document.getElementById('web-cart-items');
    document.getElementById('cart-count').innerText = websiteCart.reduce((sum, item) => sum + item.quantity, 0);

    container.innerHTML = '';
    let total = 0;

    if (websiteCart.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-400 mt-10">
                <i class="fa-solid fa-basket-shopping text-4xl mb-3"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
    } else {
        websiteCart.forEach(item => {
            total += (item.price * item.quantity);
            const imgSrc = item.image || 'https://images.unsplash.com/photo-1606574929314-ecbd307c02b2?q=80&w=150&auto=format&fit=crop';
            container.innerHTML += `
                <div class="flex gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm relative pr-8">
                    <button onclick="updateWebCartQty(${item.id}, -1000)" class="absolute top-2 right-2 text-gray-300 hover:text-red-500"><i class="fa-solid fa-xmark"></i></button>
                    
                    <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                        <img src="${imgSrc}" class="w-full h-full object-cover">
                    </div>
                    
                    <div class="flex-1 flex flex-col justify-between py-1">
                        <h4 class="text-sm font-medium text-gray-900 leading-tight line-clamp-2">${item.name}</h4>
                        <div class="flex justify-between items-center mt-1">
                            <span class="text-sm font-bold text-gray-900">${formatCurrency(item.price)}</span>
                            
                            <div class="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 px-1">
                                <button class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-brand-600" onclick="updateWebCartQty(${item.id}, -1)"><i class="fa-solid fa-minus text-[10px]"></i></button>
                                <span class="text-xs font-medium w-4 text-center">${item.quantity}</span>
                                <button class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-brand-600" onclick="updateWebCartQty(${item.id}, 1)"><i class="fa-solid fa-plus text-[10px]"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('web-cart-total').innerText = formatCurrency(total);
}

function checkoutWebCart() {
    if (websiteCart.length === 0) return;

    let text = "Hello! I would like to order the following items:\n\n";
    let total = 0;
    websiteCart.forEach(item => {
        text += `- ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
        total += (item.price * item.quantity);
    });
    text += `\n*Total: ${formatCurrency(total)}*\n\nPlease let me know how to proceed with payment.`;

    const whatsappUrl = `https://wa.me/94705770398?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}
