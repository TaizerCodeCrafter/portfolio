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

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAdminProducts();

    // Check auth status every 5 seconds to auto-lock if expired
    setInterval(() => {
        if (document.getElementById('admin-login-overlay').classList.contains('hidden')) {
            checkAuth();
        }
    }, 5000);
});

// --- Auth ---
const SESSION_DURATION_MS = 60 * 1000; // 1 minute

function checkAuth() {
    const authExp = localStorage.getItem('adminAuthExp');
    if (authExp && Date.now() < parseInt(authExp, 10)) {
        document.getElementById('admin-login-overlay').classList.add('hidden');
    } else {
        logoutAdmin(false); // Silent logout if expired
    }
}

// Keep tracking user activity to reset the 1 minute idle timer
function resetAuthTimer() {
    const authExp = localStorage.getItem('adminAuthExp');
    if (authExp && Date.now() < parseInt(authExp, 10)) {
        localStorage.setItem('adminAuthExp', Date.now() + SESSION_DURATION_MS);
    }
}

// Listen for mouse/keyboard activity to keep the session alive
window.addEventListener('mousemove', resetAuthTimer);
window.addEventListener('keydown', resetAuthTimer);
window.addEventListener('click', resetAuthTimer);

function handleLogin(e) {
    if (e) e.preventDefault();
    const pw = document.getElementById('admin-password').value;
    if (pw === '1234') {
        localStorage.setItem('adminAuthExp', Date.now() + SESSION_DURATION_MS);
        const overlay = document.getElementById('admin-login-overlay');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        document.getElementById('admin-password').value = '';
    } else {
        alert('Invalid password! Please try again.');
        document.getElementById('admin-password').value = '';
    }
}

function forgotPassword() {
    alert("Hint: The default administrator password is '1234'.");
}

function logoutAdmin(showConfirm = true) {
    if (!showConfirm || confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('adminAuthExp');
        document.getElementById('admin-password').value = '';
        const overlay = document.getElementById('admin-login-overlay');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    }
}

const formatCurrency = (amt) => `Rs ${parseFloat(amt || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

// --- Image Handling ---
function readImageURL(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        if (file.size > 2 * 1024 * 1024) {
            alert("File size exceeds 2MB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('admin-preview-img').src = e.target.result;
            document.getElementById('admin-prod-image-data').value = e.target.result; // Base64 data

            document.getElementById('image-upload-prompt').classList.add('hidden');
            document.getElementById('image-upload-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeUpload(e) {
    e.preventDefault();
    document.getElementById('admin-image-input').value = "";
    document.getElementById('admin-prod-image-data').value = "";
    document.getElementById('image-upload-prompt').classList.remove('hidden');
    document.getElementById('image-upload-preview').classList.add('hidden');
}

// --- Modals ---
function openAdminProductModal() {
    document.getElementById('admin-product-form').reset();
    document.getElementById('admin-prod-id').value = '';
    removeUpload({ preventDefault: () => { } });
    document.getElementById('admin-modal-title').innerText = 'Create New Product';

    const modal = document.getElementById('admin-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('admin-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeAdminProductModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('opacity-0');
    document.getElementById('admin-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// --- Data Fetching & Rendering ---
async function loadAdminProducts() {
    const search = document.getElementById('admin-search').value.toLowerCase();
    const category = document.getElementById('admin-category-filter').value;
    const tbody = document.getElementById('admin-product-tbody');
    const emptyMsg = document.getElementById('admin-empty-msg');

    const products = await db.products.toArray();
    const inventory = await db.inventory.toArray();

    let combined = products.map(p => {
        const inv = inventory.find(i => i.productId === p.id) || {};
        return { ...p, ...inv, invId: inv.id };
    });

    if (category !== 'All') {
        combined = combined.filter(c => c.category === category);
    }

    if (search) {
        combined = combined.filter(c =>
            c.name.toLowerCase().includes(search) ||
            (c.sku && c.sku.toLowerCase().includes(search))
        );
    }

    tbody.innerHTML = '';

    if (combined.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        combined.forEach(item => {
            const outOfStock = item.stockQuantity <= 0;
            const imgSrc = item.image || 'https://images.unsplash.com/photo-1606574929314-ecbd307c02b2?q=80&w=150&auto=format&fit=crop';

            tbody.innerHTML += `
                <tr class="hover:bg-indigo-50/50 transition-colors group">
                    <td class="px-6 py-3 whitespace-nowrap">
                        <div class="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shadow-inner">
                            <img src="${imgSrc}" class="h-full w-full object-cover" alt="img">
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-medium text-gray-900">${item.name}</div>
                        <div class="text-xs text-gray-400 mt-0.5">SKU: ${item.sku || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">${item.category}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="${outOfStock ? 'text-red-500 font-bold' : 'text-gray-900'}">${item.stockQuantity} in stock</div>
                        <div class="text-sm text-admin font-bold mt-0.5">${formatCurrency(item.sellPrice)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                        <button onclick="editAdminProduct(${item.id})" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors mr-2">
                            <i class="fa-solid fa-pen text-xs"></i> Edit
                        </button>
                        <button onclick="deleteAdminProduct(${item.id})" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

function showAdminToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : (type === 'error' ? 'bg-red-500' : 'bg-blue-500');

    toast.className = `${bgColor} text-white px-6 py-3 rounded shadow-lg transform transition-all duration-300 translate-y-full opacity-0 flex items-center gap-2 text-sm font-medium z-50`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-info-circle'}"></i> ${message}`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- CRUD ---
async function saveAdminProduct(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('admin-prod-id').value;
    const isEdit = !!id;

    // We get the base64 string from our hidden input
    const base64Image = document.getElementById('admin-prod-image-data').value;

    const prodData = {
        name: document.getElementById('admin-prod-name').value.trim(),
        sku: document.getElementById('admin-prod-sku').value.trim(),
        category: document.getElementById('admin-prod-category').value,
        chassisNumber: document.getElementById('admin-prod-chassis').value.trim()
    };

    // Save image directly to Dexie product table (Dexie is schema-free for non-indexed fields)
    if (base64Image) {
        prodData.image = base64Image;
    } else if (!isEdit) {
        // if creating new and no image, keep it empty
        prodData.image = "";
    }

    const invData = {
        costPrice: parseFloat(document.getElementById('admin-prod-cost').value) || 0,
        sellPrice: parseFloat(document.getElementById('admin-prod-sell').value) || 0,
        stockQuantity: parseInt(document.getElementById('admin-prod-stock').value) || 0,
        minStockLevel: parseInt(document.getElementById('admin-prod-min').value) || 0,
    };

    try {
        if (isEdit) {
            const prodIdNum = parseInt(id);
            await db.products.update(prodIdNum, prodData);
            const inv = await db.inventory.where('productId').equals(prodIdNum).first();
            if (inv) {
                await db.inventory.update(inv.id, invData);
            } else {
                await db.inventory.add({ ...invData, productId: prodIdNum });
            }
            showAdminToast("Product updated successfully!", "success");
        } else {
            const newProdId = await db.products.add(prodData);
            await db.inventory.add({ ...invData, productId: newProdId });
            showAdminToast("New product created successfully!", "success");
        }
        closeAdminProductModal();
        loadAdminProducts();
    } catch (err) {
        console.error("Dexie Insert Error:", err);
        showAdminToast('Error saving product: ' + err.message, 'error');
    }
}

async function editAdminProduct(id) {
    const product = await db.products.get(id);
    let inventory = await db.inventory.where('productId').equals(id).first();

    // Fallback if inventory row is missing somehow
    if (!inventory) {
        inventory = { costPrice: 0, sellPrice: 0, stockQuantity: 0, minStockLevel: 5 };
    }

    if (product) {
        document.getElementById('admin-prod-id').value = id;
        document.getElementById('admin-prod-name').value = product.name || '';
        document.getElementById('admin-prod-sku').value = product.sku || '';
        document.getElementById('admin-prod-category').value = product.category || 'Engine';
        document.getElementById('admin-prod-chassis').value = product.chassisNumber || '';

        document.getElementById('admin-prod-cost').value = inventory.costPrice;
        document.getElementById('admin-prod-sell').value = inventory.sellPrice;
        document.getElementById('admin-prod-stock').value = inventory.stockQuantity;
        document.getElementById('admin-prod-min').value = inventory.minStockLevel;

        // Load image if exists
        if (product.image) {
            document.getElementById('admin-preview-img').src = product.image;
            document.getElementById('admin-prod-image-data').value = product.image;
            document.getElementById('image-upload-prompt').classList.add('hidden');
            document.getElementById('image-upload-preview').classList.remove('hidden');
        } else {
            removeUpload({ preventDefault: () => { } });
        }

        document.getElementById('admin-modal-title').innerText = 'Edit Product';

        const modal = document.getElementById('admin-modal');
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            document.getElementById('admin-modal-content').classList.remove('scale-95');
        }, 10);
    }
}

async function deleteAdminProduct(id) {
    if (confirm('Are you sure you want to delete this product? It will be removed from the POS and the Website.')) {
        try {
            await db.products.delete(id);
            const inv = await db.inventory.where('productId').equals(id).first();
            if (inv) await db.inventory.delete(inv.id);
            showAdminToast("Product deleted successfully!", "success");
            loadAdminProducts();
        } catch (err) {
            console.error(err);
            showAdminToast("Failed to delete product.", "error");
        }
    }
}
