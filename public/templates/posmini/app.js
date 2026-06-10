// Database Setup
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

// App State
let cart = [];
let currentPaymentMethod = 'Cash';
let currentCategoryFilter = 'All';

// Formatting & Utils
const formatCurrency = (amt) => `Rs ${parseFloat(amt || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
const formatDate = (date) => new Date(date).toLocaleString();

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : (type === 'error' ? 'bg-red-500' : 'bg-blue-500');

    toast.className = `${bgColor} text-white px-6 py-3 rounded shadow-lg transform transition-all duration-300 translate-y-full opacity-0 flex items-center gap-2 text-sm font-medium z-50`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-info-circle'}"></i> ${message}`;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    // Animate out
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000);
    switchView('dashboard');
});

function updateDateTime() {
    const now = new Date();
    document.getElementById('datetime-display').innerText = now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---------------- Navigation ----------------
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('bg-gray-800', 'text-white', 'border-l-4', 'border-blue-500');
        if (el.dataset.view === viewId) el.classList.add('bg-gray-800', 'text-white', 'border-l-4', 'border-blue-500');
    });

    // Update title
    const titles = { dashboard: 'Overview Dashboard', pos: 'Point of Sale Workspace', inventory: 'Inventory Management', reports: 'Business Reports & Analytics', invoices: 'Sales Invoices & History', credits: 'Credit & Installment Management' };
    document.getElementById('current-view-title').innerText = titles[viewId] || 'AutoParts POS';

    // Load Data
    if (viewId === 'dashboard') loadDashboard();
    if (viewId === 'inventory') loadInventory();
    if (viewId === 'pos') loadPos();
    if (viewId === 'reports') loadReports();
    if (viewId === 'invoices') loadInvoices();
    if (viewId === 'credits') loadCredits();
}

// ---------------- Dashboard ----------------
async function loadDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    // Stats
    const totalItems = await db.products.count();
    document.getElementById('dash-total-items').innerText = totalItems;

    let dailyTotal = 0;
    let dailyProfit = 0;

    const todaySales = await db.sales.where('timestamp').aboveOrEqual(todayMs).toArray();
    for (const sale of todaySales) {
        dailyTotal += sale.totalAmount;

        // Calculate profit for each sale
        const items = await db.saleItems.where('saleId').equals(sale.id).toArray();
        let costTotal = 0;
        for (let item of items) {
            const inv = await db.inventory.where('productId').equals(item.productId).first();
            if (inv) costTotal += (inv.costPrice * item.quantity);
        }
        // approximate profit = (Total After Discount) - (Cost of Items)
        // Adjust for discount proportionately
        const originalTotal = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
        const ratio = sale.totalAmount / (originalTotal || 1);
        let adjustedCost = costTotal; // simple assumption: cost is fixed 
        dailyProfit += (sale.totalAmount - adjustedCost);
    }

    document.getElementById('dash-daily-sales').innerText = formatCurrency(dailyTotal);
    document.getElementById('dash-daily-profit').innerText = formatCurrency(dailyProfit);

    // Low Stock
    const inventory = await db.inventory.toArray();
    let lowStockCount = 0;
    const lowStockHtml = [];

    for (const item of inventory) {
        if (item.stockQuantity <= item.minStockLevel) {
            lowStockCount++;
            const prod = await db.products.get(item.productId);
            if (prod) {
                lowStockHtml.push(`
                    <li class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div class="flex items-center">
                            <i class="fa-solid fa-triangle-exclamation text-red-500 mr-3"></i>
                            <div>
                                <p class="text-sm font-medium text-gray-800">${prod.name}</p>
                                <p class="text-xs text-gray-500">SKU: ${prod.sku || 'N/A'}</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">${item.stockQuantity} Left</span>
                    </li>
                `);
            }
        }
    }

    document.getElementById('dash-low-stock').innerText = lowStockCount;
    document.getElementById('dash-low-stock-list').innerHTML = lowStockHtml.length ? lowStockHtml.join('') : '<p class="text-sm text-gray-500">All stock levels are optimal.</p>';

    // Recent Sales Table
    let dateInput = document.getElementById('dash-sales-date').value;
    if (!dateInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        document.getElementById('dash-sales-date').value = todayStr;
    }
    loadDashboardSales();
}

async function loadDashboardSales() {
    let dateInput = document.getElementById('dash-sales-date').value;
    if (!dateInput) {
        return;
    }

    const start = new Date(dateInput);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateInput);
    end.setHours(23, 59, 59, 999);

    const recentSales = await db.sales.where('timestamp').between(start.getTime(), end.getTime()).reverse().toArray();

    const salesTbody = document.getElementById('recent-sales-body');
    salesTbody.innerHTML = '';

    if (recentSales.length === 0) {
        salesTbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">No recent sales.</td></tr>';
    } else {
        recentSales.forEach(sale => {
            salesTbody.innerHTML += `
                <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="py-3 font-medium text-gray-700">#${sale.id.toString().padStart(5, '0')}</td>
                    <td class="py-3 text-gray-500">${new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td class="py-3 font-medium">${formatCurrency(sale.totalAmount)}</td>
                    <td class="py-3">
                        <span class="px-2 py-1 text-xs rounded-full ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                    sale.paymentMethod === 'Card' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }">${sale.paymentMethod}</span>
                    </td>
                    <td class="py-3">
                        <button onclick="viewPastReceipt(${sale.id})" class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded shadow-sm hover:bg-blue-50 transition-colors"><i class="fa-solid fa-print"></i> View</button>
                    </td>
                </tr>
            `;
        });
    }
}

// ---------------- Inventory ----------------
async function loadInventory() {
    const search = document.getElementById('inventory-search').value.toLowerCase();
    const tbody = document.getElementById('inventory-table-body');
    const emptyMsg = document.getElementById('inventory-empty');
    tbody.innerHTML = '';

    // Join Products and Inventory
    const products = await db.products.toArray();
    const inventory = await db.inventory.toArray();

    let combined = products.map(p => {
        const inv = inventory.find(i => i.productId === p.id) || {};
        return { ...p, ...inv, invId: inv.id };
    });

    if (search) {
        combined = combined.filter(c =>
            c.name.toLowerCase().includes(search) ||
            (c.sku && c.sku.toLowerCase().includes(search)) ||
            (c.chassisNumber && c.chassisNumber.toLowerCase().includes(search))
        );
    }

    if (combined.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        combined.forEach(item => {
            const lowStockAlert = item.stockQuantity <= item.minStockLevel ? 'text-red-600 font-bold' : 'text-gray-700';
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.sku || '-'}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">
                        ${item.name}
                        ${item.chassisNumber ? `<br><span class="text-xs text-gray-400 font-normal">Chassis: ${item.chassisNumber}</span>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><span class="px-2 py-1 bg-gray-100 rounded-full text-xs">${item.category}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${lowStockAlert}">
                        ${item.stockQuantity ?? 0}
                        ${item.stockQuantity <= item.minStockLevel ? ' <i class="fa-solid fa-circle-exclamation text-xs ml-1" title="Low Stock"></i>' : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(item.sellPrice)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="editProduct(${item.id})" class="text-blue-600 hover:text-blue-900 mr-3"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteProduct(${item.id})" class="text-red-600 hover:text-red-900"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').innerText = 'Add New Product';

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('product-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('opacity-0');
    document.getElementById('product-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const isEdit = !!id;

    const prodData = {
        name: document.getElementById('prod-name').value.trim(),
        sku: document.getElementById('prod-sku').value.trim(),
        category: document.getElementById('prod-category').value,
        chassisNumber: document.getElementById('prod-chassis').value.trim(),
    };

    const invData = {
        costPrice: parseFloat(document.getElementById('prod-cost').value),
        sellPrice: parseFloat(document.getElementById('prod-sell').value),
        stockQuantity: parseInt(document.getElementById('prod-stock').value),
        minStockLevel: parseInt(document.getElementById('prod-min').value),
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
            showToast('Product updated successfully');
        } else {
            const newProdId = await db.products.add(prodData);
            await db.inventory.add({ ...invData, productId: newProdId });
            showToast('New product added to inventory');
        }
        closeProductModal();
        loadInventory();
        if (document.getElementById('view-pos').classList.contains('active')) loadPos();
    } catch (err) {
        console.error(err);
        showToast('Error saving product', 'error');
    }
}

async function editProduct(id) {
    const product = await db.products.get(id);
    const inventory = await db.inventory.where('productId').equals(id).first();

    if (product && inventory) {
        document.getElementById('product-id').value = id;
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-sku').value = product.sku || '';
        document.getElementById('prod-category').value = product.category;
        document.getElementById('prod-chassis').value = product.chassisNumber || '';

        document.getElementById('prod-cost').value = inventory.costPrice;
        document.getElementById('prod-sell').value = inventory.sellPrice;
        document.getElementById('prod-stock').value = inventory.stockQuantity;
        document.getElementById('prod-min').value = inventory.minStockLevel;

        document.getElementById('product-modal-title').innerText = 'Edit Product';
        openProductModal();
    }
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        await db.products.delete(id);
        const inv = await db.inventory.where('productId').equals(id).first();
        if (inv) await db.inventory.delete(inv.id);
        showToast('Product deleted', 'success');
        loadInventory();
        loadPos();
    }
}

// ---------------- POS ----------------
let allPosProducts = [];

async function loadPos() {
    const products = await db.products.toArray();
    const inventory = await db.inventory.toArray();

    allPosProducts = products.map(p => {
        const inv = inventory.find(i => i.productId === p.id) || {};
        return { ...p, ...inv };
    });

    // Populate Categories
    const categories = ['All', ...new Set(products.map(p => p.category))];
    const catContainer = document.getElementById('pos-categories');
    catContainer.innerHTML = '';
    categories.forEach(cat => {
        const isActive = cat === currentCategoryFilter ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
        catContainer.innerHTML += `<button class="px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shadow-sm ${isActive}" onclick="filterCategory('${cat}')">${cat}</button>`;
    });

    filterPosProducts();
    renderCart();
}

function filterCategory(cat) {
    currentCategoryFilter = cat;
    loadPos(); // Re-render to update active classes
}

function filterPosProducts() {
    const search = document.getElementById('pos-search').value.toLowerCase();
    const container = document.getElementById('pos-product-list');

    let filtered = allPosProducts;

    if (currentCategoryFilter !== 'All') {
        filtered = filtered.filter(p => p.category === currentCategoryFilter);
    }

    if (search) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.sku && p.sku.toLowerCase().includes(search)) ||
            (p.chassisNumber && p.chassisNumber.toLowerCase().includes(search))
        );
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10">No products found</div>';
        return;
    }

    filtered.forEach(p => {
        const outOfStock = p.stockQuantity <= 0;
        container.innerHTML += `
            <div class="bg-white rounded-xl shadow-sm border ${outOfStock ? 'border-red-200 bg-red-50' : 'border-gray-100 hover:border-blue-300'} p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between" 
                 onclick="${outOfStock ? `showToast('Item is out of stock!', 'error')` : `addToCart(${p.id})`}">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">${p.category}</span>
                        <span class="text-xs ${outOfStock ? 'text-red-500 font-bold' : 'text-gray-500'} bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">Stock: ${p.stockQuantity}</span>
                    </div>
                    <h4 class="font-medium text-gray-800 text-sm mb-1 leading-snug">${p.name}</h4>
                    ${p.sku ? `<p class="text-xs text-gray-400 mb-1">SKU: ${p.sku}</p>` : ''}
                </div>
                <div class="mt-3 text-lg font-bold text-blue-600 block">
                    ${formatCurrency(p.sellPrice || 0)}
                </div>
            </div>
        `;
    });
}

function addToCart(productId) {
    const product = allPosProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        if (existing.quantity >= product.stockQuantity) {
            showToast('Cannot add more than available stock', 'error');
            return;
        }
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.sellPrice,
            quantity: 1,
            maxStock: product.stockQuantity
        });
    }
    renderCart();
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
            if (newQty > item.maxStock) {
                showToast('Maximum stock limit reached', 'error');
                return;
            }
            item.quantity = newQty;
        } else {
            cart = cart.filter(i => i.id !== id);
        }
        renderCart();
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty-msg');

    container.innerHTML = '';

    if (cart.length === 0) {
        container.appendChild(emptyMsg);
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        cart.forEach(item => {
            container.innerHTML += `
                <div class="flex flex-col p-3 mb-2 bg-gray-50 rounded-lg border border-gray-100 shadow-sm relative group">
                    <button onclick="updateCartQty(${item.id}, -1000)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-solid fa-xmark"></i></button>
                    <h4 class="text-sm font-semibold text-gray-800 pr-6">${item.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-xs text-gray-500">${formatCurrency(item.price)} x ${item.quantity}</span>
                        <div class="flex items-center gap-2 bg-white rounded border border-gray-200 h-7 overflow-hidden">
                            <button class="w-7 h-full text-gray-600 hover:bg-gray-100 flex justify-center items-center" onclick="updateCartQty(${item.id}, -1)"><i class="fa-solid fa-minus text-xs"></i></button>
                            <span class="text-sm font-medium w-6 text-center">${item.quantity}</span>
                            <button class="w-7 h-full text-gray-600 hover:bg-gray-100 flex justify-center items-center" onclick="updateCartQty(${item.id}, 1)"><i class="fa-solid fa-plus text-xs"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        container.appendChild(emptyMsg); // keep it at bottom hidden
    }
    calculateTotal();
}

function calculateTotal() {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (item.price * item.quantity);
    });

    document.getElementById('cart-subtotal').innerText = formatCurrency(subtotal);

    const discountVal = parseFloat(document.getElementById('cart-discount').value) || 0;
    const discountType = document.getElementById('cart-discount-type').value;

    let discountAmount = 0;
    if (discountType === 'percent') {
        discountAmount = subtotal * (discountVal / 100);
    } else {
        discountAmount = discountVal;
    }

    const netAfterDiscount = Math.max(0, subtotal - discountAmount);

    // Calculate Extra Charge
    const extraChargeVal = parseFloat(document.getElementById('cart-extra-charge').value) || 0;
    const extraChargeType = document.getElementById('cart-extra-charge-type').value;

    let extraChargeAmount = 0;
    if (currentPaymentMethod === 'Credit') {
        if (extraChargeType === 'percent') {
            extraChargeAmount = netAfterDiscount * (extraChargeVal / 100);
        } else {
            extraChargeAmount = extraChargeVal;
        }
    }

    const total = netAfterDiscount + extraChargeAmount;
    document.getElementById('cart-total').innerText = formatCurrency(total);

    return { subtotal, discountAmount, extraCharge: extraChargeAmount, total };
}

function setPayMethod(method, btn) {
    currentPaymentMethod = method;
    document.querySelectorAll('.pay-method').forEach(el => el.classList.remove('active-pay'));
    btn.classList.add('active-pay');

    const extraChargeInput = document.getElementById('cart-extra-charge');
    const extraChargeType = document.getElementById('cart-extra-charge-type');

    if (method === 'Credit') {
        extraChargeInput.disabled = false;
        extraChargeType.disabled = false;
    } else {
        extraChargeInput.disabled = true;
        extraChargeType.disabled = true;
        extraChargeInput.value = '0';
        extraChargeType.value = 'flat';
    }
    calculateTotal();
}

function clearCart() {
    if (cart.length > 0 && confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        document.getElementById('cart-discount').value = 0;
        document.getElementById('cart-extra-charge').value = 0;
        renderCart();
    }
}

async function checkout() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }

    if (currentPaymentMethod === 'Credit') {
        openCreditInfoModal();
        return;
    }

    if (currentPaymentMethod === 'Split') {
        openSplitModal();
        return;
    }

    await processCheckout();
}

async function processCheckout(customerDetails = null, downPayment = 0, durationMonths = 0, downPaymentMethod = 'Cash') {
    const { subtotal, discountAmount, extraCharge, total } = calculateTotal();

    const saleRecord = {
        timestamp: Date.now(),
        totalAmount: total,
        discount: discountAmount,
        extraCharge: extraCharge,
        paymentMethod: currentPaymentMethod,
        customerId: null
    };

    try {
        let customerId = null;
        if (customerDetails) {
            customerId = await db.customers.add(customerDetails);
            saleRecord.customerId = customerId;
        }

        const saleId = await db.sales.add(saleRecord);

        // Add Sale Items & Deduct Inventory
        for (const item of cart) {
            await db.saleItems.add({
                saleId: saleId,
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.price
            });

            // Update Inventory stock
            const inv = await db.inventory.where('productId').equals(item.id).first();
            if (inv) {
                const newStock = inv.stockQuantity - item.quantity;
                await db.inventory.update(inv.id, { stockQuantity: newStock });
            }
        }

        if (currentPaymentMethod === 'Credit' && customerId) {
            const initialBalance = total - downPayment;
            const creditId = await db.credits.add({
                customerId: customerId,
                saleId: saleId,
                totalAmount: total,
                extraCharge: extraCharge,
                paidAmount: downPayment,
                balance: initialBalance,
                status: initialBalance <= 0 ? 'completed' : 'pending',
                dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // Default 30 days
                months: durationMonths
            });

            if (downPayment > 0) {
                await db.installments.add({
                    creditId: creditId,
                    amount: downPayment,
                    paymentDate: Date.now(),
                    paymentMethod: downPaymentMethod
                });
            }

            generateReceiptInfo(saleId, cart, subtotal, discountAmount, extraCharge, total, currentPaymentMethod, saleRecord.timestamp, false, downPayment, initialBalance);
        } else {
            generateReceiptInfo(saleId, cart, subtotal, discountAmount, extraCharge, total, currentPaymentMethod, saleRecord.timestamp, false, total, 0);
        }

        showToast('Sale Completed Successfully!');
        cart = [];
        document.getElementById('cart-discount').value = 0;
        document.getElementById('cart-extra-charge').value = 0;
        renderCart();
        loadPos(); // Refresh product list to show new stock
        openReceiptModal();

    } catch (err) {
        console.error(err);
        showToast('Error processing sale', 'error');
    }
}

function generateReceiptInfo(id, items, sub, dist, extra, tot, method, time, isQuotation = false, paidAmount = 0, balance = 0) {
    document.getElementById('receipt-title-text').innerText = isQuotation ? 'QUOTATION' : 'AUTOPARTS POS';
    document.getElementById('receipt-type-label').innerText = isQuotation ? 'Ref:' : 'Receipt:';
    document.getElementById('receipt-payment-row').style.display = isQuotation ? 'none' : 'flex';
    document.getElementById('receipt-footer-msg').innerText = isQuotation ? 'Quotation is valid for 30 days.' : 'Thank You for your business!';

    document.getElementById('receipt-id').innerText = id.toString().padStart(6, '0');

    const dateOpts = new Date(time);
    document.getElementById('receipt-date').innerText = dateOpts.toLocaleDateString();
    document.getElementById('receipt-time').innerText = dateOpts.toLocaleTimeString();

    const tbody = document.getElementById('receipt-items');
    tbody.innerHTML = '';
    items.forEach(item => {
        tbody.innerHTML += `
            <tr class="mb-1">
                <td class="py-1 break-words">${item.name}</td>
                <td class="py-1 text-center">${item.quantity}</td>
                <td class="py-1 text-right">${(item.price).toFixed(2)}</td>
                <td class="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById('receipt-sub').innerText = parseFloat(sub).toFixed(2);
    document.getElementById('receipt-discount').innerText = parseFloat(dist).toFixed(2);

    let container = document.getElementById('receipt-discount').parentElement.parentElement;

    // Remove old dynamically added fields to prevent duplicates
    document.querySelectorAll('.receipt-dynamic-row').forEach(el => el.remove());

    if (extra > 0) {
        let div = document.createElement('div');
        div.className = "flex justify-between w-full mt-1 receipt-dynamic-row text-xs";
        div.innerHTML = `<span>Extra Charge / Interest:</span> <span>Rs. ${parseFloat(extra).toFixed(2)}</span>`;
        container.insertBefore(div, document.getElementById('receipt-total').parentElement);
    }

    document.getElementById('receipt-total').innerText = parseFloat(tot).toFixed(2);
    document.getElementById('receipt-method').innerText = method;

    // Handle Credit display Logic
    if (method === 'Credit' && !isQuotation) {
        let paidDiv = document.createElement('div');
        paidDiv.className = "flex justify-between w-full mt-1 pt-1 border-t border-dashed border-gray-300 receipt-dynamic-row text-sm";
        paidDiv.innerHTML = `<span>Paid (Downpayment):</span> <span>Rs. ${parseFloat(paidAmount).toFixed(2)}</span>`;
        container.appendChild(paidDiv);

        let balDiv = document.createElement('div');
        balDiv.className = "flex justify-between w-full mt-1 font-bold text-red-600 receipt-dynamic-row text-sm";
        balDiv.innerHTML = `<span>Balance Due:</span> <span>Rs. ${parseFloat(balance).toFixed(2)}</span>`;
        container.appendChild(balDiv);
    }
}

// ---------------- Credits & Installments ----------------
async function loadCredits() {
    const search = document.getElementById('credit-search').value.toLowerCase();
    const statusFilter = document.getElementById('credit-status-filter').value;

    const credits = await db.credits.orderBy('id').reverse().toArray();
    const customers = await db.customers.toArray();

    let combined = credits.map(c => {
        const cust = customers.find(cus => cus.id === c.customerId) || {};
        return { ...c, customerName: cust.name, customerPhone: cust.phone };
    });

    if (search) {
        combined = combined.filter(c =>
            (c.customerName && c.customerName.toLowerCase().includes(search)) ||
            (c.customerPhone && c.customerPhone.includes(search)) ||
            (c.saleId && c.saleId.toString().includes(search))
        );
    }

    if (statusFilter !== 'all') {
        combined = combined.filter(c => c.status === statusFilter);
    }

    const tbody = document.getElementById('credit-table-body');
    const emptyMsg = document.getElementById('credit-empty');
    tbody.innerHTML = '';

    if (combined.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        combined.forEach(c => {
            const isCompleted = c.status === 'completed';
            const statusBadge = isCompleted
                ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Completed</span>'
                : '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>';

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 text-sm text-gray-900">
                        <div class="font-medium">${c.customerName || 'Unknown'}</div>
                        <div class="text-xs text-gray-500">${c.customerPhone || ''}</div>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-700">#${c.saleId.toString().padStart(5, '0')}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${formatCurrency(c.totalAmount)}</td>
                    <td class="px-6 py-4 text-sm text-green-600 font-medium">${formatCurrency(c.paidAmount)}</td>
                    <td class="px-6 py-4 text-sm text-red-600 font-bold">${formatCurrency(c.balance)}</td>
                    <td class="px-6 py-4 text-sm">${statusBadge}</td>
                    <td class="px-6 py-4 text-sm">
                        <button onclick="openLedgerModal(${c.customerId})" class="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 border border-purple-200 rounded shadow-sm hover:bg-purple-50 transition-colors mx-1" title="View Customer Profile"><i class="fa-solid fa-address-book"></i></button>
                        <button onclick="viewPastReceipt(${c.saleId})" class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded shadow-sm hover:bg-blue-50 transition-colors mr-2 mx-1" title="View Receipt"><i class="fa-solid fa-file-invoice"></i></button>
                        ${!isCompleted ? `<button onclick="openCreditPayModal(${c.id}, ${c.balance})" class="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-200 rounded shadow-sm hover:bg-green-50 transition-colors font-medium"><i class="fa-solid fa-money-bill-wave"></i> Pay</button>` : ''}
                    </td>
                </tr>
            `;
        });
    }
}

// ---------------- Split Payments ----------------
let splitCashAmount = 0;
let splitCardAmount = 0;

function openSplitModal() {
    const { total } = calculateTotal();
    document.getElementById('split-total-display').innerText = formatCurrency(total);
    document.getElementById('split-cash-amount').value = total;
    document.getElementById('split-card-amount').innerText = formatCurrency(0);
    splitCashAmount = total;
    splitCardAmount = 0;

    const modal = document.getElementById('split-payment-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('split-payment-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeSplitModal() {
    const modal = document.getElementById('split-payment-modal');
    modal.classList.add('opacity-0');
    document.getElementById('split-payment-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function calcSplitAmount() {
    const { total } = calculateTotal();
    let cash = parseFloat(document.getElementById('split-cash-amount').value) || 0;
    if (cash > total) {
        cash = total;
        document.getElementById('split-cash-amount').value = cash;
    }
    const card = total - cash;

    splitCashAmount = cash;
    splitCardAmount = card;

    document.getElementById('split-card-amount').innerText = formatCurrency(card);
}

function confirmSplitCheckout() {
    closeSplitModal();
    const originalMethod = currentPaymentMethod;
    // Embed the split details in the payment method string
    currentPaymentMethod = `Split (Cash: ${splitCashAmount.toFixed(2)} | Card: ${splitCardAmount.toFixed(2)})`;
    processCheckout().then(() => {
        currentPaymentMethod = originalMethod;
    }).catch(() => {
        currentPaymentMethod = originalMethod;
    });
}

function openCreditInfoModal() {
    document.getElementById('credit-info-form').reset();
    const modal = document.getElementById('credit-info-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('credit-info-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeCreditInfoModal() {
    const modal = document.getElementById('credit-info-modal');
    modal.classList.add('opacity-0');
    document.getElementById('credit-info-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function calcMonthlyInstallment() {
    const { total } = calculateTotal();
    const downPayment = parseFloat(document.getElementById('credit-down-payment').value) || 0;
    const duration = parseInt(document.getElementById('credit-months').value) || 0;
    const calcDiv = document.getElementById('credit-monthly-calc');
    const amtSpan = document.getElementById('credit-monthly-amount');

    if (duration > 0) {
        const remaining = total - downPayment;
        const monthly = remaining > 0 ? (remaining / duration) : 0;
        amtSpan.innerText = parseFloat(monthly).toFixed(2);
        calcDiv.classList.remove('hidden');
    } else {
        calcDiv.classList.add('hidden');
    }
}

function confirmCreditCheckout() {
    const name = document.getElementById('credit-cust-name').value.trim();
    const phone = document.getElementById('credit-cust-phone').value.trim();
    const downPayment = parseFloat(document.getElementById('credit-down-payment').value) || 0;
    const months = parseInt(document.getElementById('credit-months').value) || 0;

    if (!name || !phone) {
        showToast('Name and Phone Number are required for credit sales', 'error');
        return;
    }

    const { total } = calculateTotal();
    if (downPayment > total) {
        showToast('Down payment cannot exceed total amount', 'error');
        return;
    }

    const customerDetails = {
        name: name,
        phone: phone,
        nic: document.getElementById('credit-cust-nic').value.trim(),
        address: document.getElementById('credit-cust-address').value.trim()
    };

    const downPaymentMethod = document.getElementById('credit-down-payment-method').value;

    closeCreditInfoModal();
    processCheckout(customerDetails, downPayment, months, downPaymentMethod);
}

function openCreditPayModal(creditId, balance) {
    document.getElementById('pay-credit-id').value = creditId;
    document.getElementById('pay-credit-balance').innerText = formatCurrency(balance);
    document.getElementById('pay-credit-amount').max = balance;
    document.getElementById('pay-credit-amount').value = '';

    const modal = document.getElementById('credit-pay-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('credit-pay-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeCreditPayModal() {
    const modal = document.getElementById('credit-pay-modal');
    modal.classList.add('opacity-0');
    document.getElementById('credit-pay-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

async function submitCreditPayment() {
    const creditId = parseInt(document.getElementById('pay-credit-id').value);
    const amount = parseFloat(document.getElementById('pay-credit-amount').value);

    let method = 'Cash';
    const methodElement = document.querySelector('input[name="credit-pay-method"]:checked');
    if (methodElement) {
        method = methodElement.value;
    }

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    try {
        const creditData = await db.credits.get(creditId);
        if (!creditData) return;

        if (amount > creditData.balance) {
            showToast('Amount exceeds the balance due', 'error');
            return;
        }

        const newPaidAmount = creditData.paidAmount + amount;
        const newBalance = creditData.totalAmount - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'completed' : 'pending';

        // Add to installments
        await db.installments.add({
            creditId: creditId,
            amount: amount,
            paymentDate: Date.now(),
            paymentMethod: method
        });

        // Update credit entry
        await db.credits.update(creditId, {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus
        });

        showToast(`Payment of ${formatCurrency(amount)} recorded successfully`);
        closeCreditPayModal();
        loadCredits(); // Refresh table

        // Automatically show payment receipt
        const newInstallment = await db.installments.where('creditId').equals(creditId).reverse().first();
        if (newInstallment) {
            viewPaymentReceipt(newInstallment.id);
        }

        // Refresh Ledger if open
        if (!document.getElementById('customer-ledger-modal').classList.contains('hidden')) {
            openLedgerModal(creditData.customerId);
        }

    } catch (err) {
        console.error(err);
        showToast('Failed to process payment', 'error');
    }
}

async function openLedgerModal(customerId) {
    const customer = await db.customers.get(customerId);
    if (!customer) return;

    document.getElementById('ledger-cust-name').innerText = customer.name;
    document.getElementById('ledger-cust-phone').innerText = customer.phone;
    document.getElementById('ledger-cust-nic').innerText = customer.nic || '-';
    document.getElementById('ledger-cust-address').innerText = customer.address || 'No Address Provided';

    const credits = await db.credits.where('customerId').equals(customerId).toArray();

    // Sort credits
    credits.sort((a, b) => b.id - a.id);

    const pendingBody = document.getElementById('ledger-pending-body');
    const completedBody = document.getElementById('ledger-completed-body');
    const historyList = document.getElementById('ledger-history-list');

    pendingBody.innerHTML = '';
    completedBody.innerHTML = '';
    historyList.innerHTML = '';

    let allInstallments = [];

    for (const c of credits) {
        const isCompleted = c.status === 'completed';
        const monthlyEst = (c.months && c.months > 0) ? (c.totalAmount - (c.paidAmount > 0 && c.paidAmount < c.totalAmount ? c.paidAmount : 0)) / c.months : 0;
        const monthlyText = monthlyEst > 0 ? formatCurrency(monthlyEst) + ' / mo' : '-';

        const rowHTML = `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium">#${c.saleId.toString().padStart(5, '0')}</td>
                <td class="px-4 py-3">${formatCurrency(c.totalAmount)}</td>
                <td class="px-4 py-3 text-green-600">${formatCurrency(c.paidAmount)}</td>
                ${!isCompleted ? `<td class="px-4 py-3 font-bold text-red-600">${formatCurrency(c.balance)}</td>` : ''}
                ${isCompleted ? `<td class="px-4 py-3"><span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Fully Settled</span></td>` : ''}
                ${!isCompleted ? `<td class="px-4 py-3 text-gray-500">${monthlyText}</td>` : ''}
                <td class="px-4 py-3">
                    <button onclick="viewPastReceipt(${c.saleId})" class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded shadow-sm hover:bg-blue-50 transition-colors mx-1"><i class="fa-solid fa-file-invoice"></i></button>
                    ${!isCompleted ? `<button onclick="openCreditPayModal(${c.id}, ${c.balance})" class="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-200 rounded shadow-sm hover:bg-green-50 transition-colors font-medium mx-1"><i class="fa-solid fa-money-bill-wave"></i> Pay</button>` : ''}
                </td>
            </tr>
        `;

        if (isCompleted) {
            completedBody.innerHTML += rowHTML;
        } else {
            pendingBody.innerHTML += rowHTML;
        }

        const installments = await db.installments.where('creditId').equals(c.id).toArray();
        installments.forEach(inst => {
            allInstallments.push({ ...inst, saleId: c.saleId });
        });
    }

    if (pendingBody.children.length === 0) {
        pendingBody.innerHTML = '<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500 bg-gray-50 rounded-lg">No active credits</td></tr>';
    }
    if (completedBody.children.length === 0) {
        completedBody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-400 bg-gray-50 rounded-lg">No completed credits</td></tr>';
    }

    allInstallments.sort((a, b) => b.paymentDate - a.paymentDate);

    if (allInstallments.length === 0) {
        historyList.innerHTML = '<li class="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">No payment history found.</li>';
    } else {
        allInstallments.forEach(inst => {
            historyList.innerHTML += `
                   <li class="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-lg hover:border-blue-200 transition-colors">
                      <div>
                          <p class="text-sm font-semibold text-gray-800">Paid ${formatCurrency(inst.amount)}</p>
                          <p class="text-xs text-gray-500">${new Date(inst.paymentDate).toLocaleString()}</p>
                      </div>
                      <div class="text-right flex flex-col items-end">
                          <p class="text-xs text-gray-600 font-medium">Bill #${inst.saleId.toString().padStart(5, '0')}</p>
                          <div class="flex items-center gap-2 mt-1">
                              <span class="text-xs text-gray-400 border border-gray-200 rounded px-1.5 bg-white shadow-sm">${inst.paymentMethod}</span>
                              <button onclick="viewPaymentReceipt(${inst.id})" class="text-blue-600 hover:text-blue-800 text-xs px-2 py-0.5 border border-blue-200 rounded bg-white shadow-sm transition-colors" title="Print Payment Receipt"><i class="fa-solid fa-print"></i></button>
                          </div>
                      </div>
                  </li>
              `;
        });
    }

    const modal = document.getElementById('customer-ledger-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('customer-ledger-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeLedgerModal() {
    const modal = document.getElementById('customer-ledger-modal');
    modal.classList.add('opacity-0');
    document.getElementById('customer-ledger-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}


function generateQuotation() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }

    const { subtotal, discountAmount, total } = calculateTotal();
    const refId = Math.floor(1000 + Math.random() * 9000); // Random reference ID for quotation
    const timestamp = Date.now();

    // Pass 0 for paid and balance on quotation
    generateReceiptInfo(refId, cart, subtotal, discountAmount, 0, total, 'N/A', timestamp, true, 0, 0);
    openReceiptModal();
}

function openReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('receipt-modal-content').classList.remove('scale-95');
    }, 10);
}

function closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    modal.classList.add('opacity-0');
    document.getElementById('receipt-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function printReceipt() {
    const printContent = document.getElementById('receipt-print-area').innerHTML;
    const originalContent = document.body.innerHTML;

    // Create a temporary iframe for printing just the receipt
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const istyle = `<style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 300px; color: black; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-6 { margin-top: 1.5rem; }
        .text-xl { font-size: 1.25rem; }
        .text-xs { font-size: 11px; }
        .text-sm { font-size: 13px; }
        .w-full { width: 100%; }
        .border-b { border-bottom: 1px dashed #333; }
        .border-t { border-top: 1px dashed #333; }
        .pb-2 { padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .pt-1 { padding-top: 0.25rem; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .text-red-600 { color: #d00; }
        .border-dashed { border-style: dashed; }
        .break-words { word-break: break-all; }
        div { width: 100%; }
        table { border-collapse: collapse; }
    </style>`;

    const idoc = iframe.contentWindow.document;
    idoc.open();
    idoc.write('<html><head>' + istyle + '</head><body>' + printContent + '</body></html>');
    idoc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        document.body.removeChild(iframe);
    }, 500);
}

// ---------------- Reports ----------------
async function loadReports() {
    // Total Inventory Value
    const inventory = await db.inventory.toArray();
    let totalStockValue = 0;
    let totalItemsStocked = 0;

    inventory.forEach(inv => {
        if (inv.stockQuantity > 0) {
            totalStockValue += (inv.stockQuantity * inv.costPrice);
            totalItemsStocked += inv.stockQuantity;
        }
    });

    document.getElementById('report-stock-value').innerText = formatCurrency(totalStockValue);
    document.getElementById('report-total-stock').innerText = totalItemsStocked;

    // Top Sellers Calculation
    const saleItems = await db.saleItems.toArray();
    const productStats = {};

    saleItems.forEach(item => {
        if (!productStats[item.productId]) {
            productStats[item.productId] = { qty: 0, revenue: 0 };
        }
        productStats[item.productId].qty += item.quantity;
        productStats[item.productId].revenue += (item.quantity * item.unitPrice);
    });

    const topProducts = Object.keys(productStats)
        .map(pId => ({ id: parseInt(pId), ...productStats[pId] }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5); // top 5

    const tbody = document.getElementById('best-sellers-body');
    tbody.innerHTML = '';

    if (topProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-500">No sales data available yet</td></tr>';
    } else {
        for (const stat of topProducts) {
            const product = await db.products.get(stat.id);
            if (product) {
                tbody.innerHTML += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">${product.name} <span class="text-xs text-gray-500 ml-2">${product.sku || ''}</span></td>
                        <td class="px-4 py-3 text-sm text-gray-700">${stat.qty} units</td>
                        <td class="px-4 py-3 text-sm font-bold text-green-600">${formatCurrency(stat.revenue)}</td>
                    </tr>
                `;
            }
        }
    }

    // Set default dates for report filters if not set
    if (!document.getElementById('report-date').value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        document.getElementById('report-date').value = `${yyyy}-${mm}-${dd}`;
        document.getElementById('report-month').value = `${yyyy}-${mm}`;
        document.getElementById('report-slow-month').value = `${yyyy}-${mm}`;
        document.getElementById('report-fast-month').value = `${yyyy}-${mm}`;
    }
}

async function exportData() {
    try {
        const formatData = (arr) => arr.length ? arr : [{ "Message": "No data available" }];

        const products = await db.products.toArray();
        const inventory = await db.inventory.toArray();
        const sales = await db.sales.toArray();
        const saleItems = await db.saleItems.toArray();

        // format timestamps for better readability in Excel
        const formattedSales = sales.map(s => ({
            ...s,
            timestamp: new Date(s.timestamp).toLocaleString()
        }));

        const data = {
            Products: formatData(products),
            Inventory: formatData(inventory),
            Sales: formatData(formattedSales),
            SaleItems: formatData(saleItems)
        };

        const wb = XLSX.utils.book_new();

        for (const [sheetName, sheetData] of Object.entries(data)) {
            const ws = XLSX.utils.json_to_sheet(sheetData);
            if (sheetName !== "Products" && sheetName !== "Inventory") {
                const cols = Array(Object.keys(sheetData[0] || {}).length).fill({ wch: 15 });
                ws['!cols'] = cols;
            }
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }

        const d = new Date();
        const filename = `AutoPOS_Backup_${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}.xlsx`;

        // Write file and trigger download
        XLSX.writeFile(wb, filename);

        showToast('Full Excel Data exported successfully!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Export failed: ' + (err.message || err), 'error');
    }
}

async function exportStockValuation() {
    try {
        const products = await db.products.toArray();
        const inventory = await db.inventory.toArray();

        let reportData = [];
        let totalVal = 0;

        for (const p of products) {
            const inv = inventory.find(i => i.productId === p.id) || {};
            const stock = inv.stockQuantity || 0;
            const cost = inv.costPrice || 0;
            const sell = inv.sellPrice || 0;
            const value = stock * cost;

            if (stock > 0) totalVal += value;

            reportData.push({
                "SKU / Barcode": p.sku || '-',
                "Product Name": p.name,
                "Category": p.category,
                "Stock Qty": stock,
                "Cost Price (Rs)": cost,
                "Selling Price (Rs)": sell,
                "Total Value (Rs)": value
            });
        }

        if (reportData.length === 0) {
            return showToast('No stock data available to export', 'error');
        }

        // Add summary row
        reportData.push({});
        reportData.push({
            "Product Name": "TOTAL VALUATION",
            "Total Value (Rs)": totalVal
        });

        const ws = XLSX.utils.json_to_sheet(reportData);
        // Auto-adjust column widths
        ws['!cols'] = [
            { wch: 15 }, // SKU
            { wch: 35 }, // Name
            { wch: 20 }, // Category
            { wch: 12 }, // Stock
            { wch: 15 }, // Cost
            { wch: 18 }, // Selling
            { wch: 20 }  // Total Value
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock Valuation");

        const d = new Date();
        const filename = `Stock_Valuation_${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}.xlsx`;

        XLSX.writeFile(wb, filename);
        showToast('Stock Valuation report downloaded!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Export failed', 'error');
    }
}


async function generateSalesReport(type) {
    let sales = [];
    let title = '';
    const products = await db.products.toArray();

    if (type === 'daily') {
        const dateInput = document.getElementById('report-date').value;
        if (!dateInput) return showToast('Please select a date', 'error');

        const start = new Date(dateInput);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateInput);
        end.setHours(23, 59, 59, 999);

        sales = await db.sales.where('timestamp').between(start.getTime(), end.getTime()).toArray();
        title = `Daily_Sales_${dateInput}`;
    } else if (type === 'monthly') {
        const monthInput = document.getElementById('report-month').value; // YYYY-MM
        if (!monthInput) return showToast('Please select a month', 'error');

        const [year, month] = monthInput.split('-');
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        sales = await db.sales.where('timestamp').between(start.getTime(), end.getTime()).toArray();
        title = `Monthly_Sales_${monthInput}`;
    }

    if (sales.length === 0) {
        return showToast(`No sales found for selected ${type} period`, 'error');
    }

    let reportData = [];
    let totalRevenue = 0;
    let totalDiscount = 0;

    for (const sale of sales) {
        const items = await db.saleItems.where('saleId').equals(sale.id).toArray();

        let itemDetails = [];
        for (const item of items) {
            const prod = products.find(p => p.id === item.productId);
            itemDetails.push(`${prod ? prod.name : 'Unknown Product'} (x${item.quantity})`);
        }

        reportData.push({
            "Receipt ID": sale.id,
            "Date & Time": new Date(sale.timestamp).toLocaleString(),
            "Items Purchased": itemDetails.join(', '),
            "Payment Method": sale.paymentMethod,
            "Subtotal (Rs)": sale.totalAmount + sale.discount,
            "Discount (Rs)": sale.discount,
            "Net Total (Rs)": sale.totalAmount
        });

        totalRevenue += sale.totalAmount;
        totalDiscount += sale.discount;
    }

    // Append summary row
    reportData.push({});
    reportData.push({
        "Receipt ID": "SUMMARY",
        "Items Purchased": `Total Transactions: ${sales.length}`,
        "Subtotal (Rs)": totalRevenue + totalDiscount,
        "Discount (Rs)": totalDiscount,
        "Net Total (Rs)": totalRevenue
    });

    const ws = XLSX.utils.json_to_sheet(reportData);

    // Auto-adjust column widths
    const colWidths = [
        { wch: 15 }, { wch: 22 }, { wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `${title}.xlsx`);
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`);
}

function exportDailySales() { generateSalesReport('daily'); }
function exportMonthlySales() { generateSalesReport('monthly'); }

async function exportSlowMovingReport() {
    const monthInput = document.getElementById('report-slow-month').value; // YYYY-MM
    if (!monthInput) return showToast('Please select a month', 'error');

    const [year, month] = monthInput.split('-');
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    try {
        const sales = await db.sales.where('timestamp').between(start.getTime(), end.getTime()).toArray();
        const saleIds = sales.map(s => s.id);
        const saleItems = await db.saleItems.toArray();

        // Filter items only for this month's sales
        const monthItems = saleItems.filter(item => saleIds.includes(item.saleId));

        const products = await db.products.toArray();
        const inventory = await db.inventory.toArray();

        // Calculate sold quantities per product
        const soldQtys = {};
        monthItems.forEach(item => {
            soldQtys[item.productId] = (soldQtys[item.productId] || 0) + item.quantity;
        });

        const reportData = [];
        for (const p of products) {
            const soldQty = soldQtys[p.id] || 0;

            // Define slow moving as < 5 sales in the month
            if (soldQty < 5) {
                const inv = inventory.find(i => i.productId === p.id) || {};
                reportData.push({
                    "SKU / Barcode": p.sku || '-',
                    "Product Name": p.name,
                    "Category": p.category,
                    "Current Stock Qty": inv.stockQuantity || 0,
                    "Cost Price (Rs)": inv.costPrice || 0,
                    "Quantity Sold": soldQty
                });
            }
        }

        if (reportData.length === 0) {
            return showToast('No slow moving products found for this month!', 'success');
        }

        // Sort by least sold first
        reportData.sort((a, b) => a["Quantity Sold"] - b["Quantity Sold"]);

        const ws = XLSX.utils.json_to_sheet(reportData);
        ws['!cols'] = [
            { wch: 15 }, // SKU
            { wch: 35 }, // Name
            { wch: 20 }, // Category
            { wch: 18 }, // Stock
            { wch: 15 }, // Cost
            { wch: 15 }  // Sold
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Slow Moving");

        XLSX.writeFile(wb, `Slow_Moving_Items_${monthInput}.xlsx`);
        showToast('Slow movement report downloaded!', 'success');

    } catch (err) {
        console.error(err);
        showToast('Failed to generate slow moving report', 'error');
    }
}

async function exportFastMovingReport() {
    const monthInput = document.getElementById('report-fast-month').value; // YYYY-MM
    if (!monthInput) return showToast('Please select a month', 'error');

    const [year, month] = monthInput.split('-');
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    try {
        const sales = await db.sales.where('timestamp').between(start.getTime(), end.getTime()).toArray();
        const saleIds = sales.map(s => s.id);
        const saleItems = await db.saleItems.toArray();

        // Filter items only for this month's sales
        const monthItems = saleItems.filter(item => saleIds.includes(item.saleId));

        const products = await db.products.toArray();
        const inventory = await db.inventory.toArray();

        // Calculate sold quantities per product
        const soldQtys = {};
        monthItems.forEach(item => {
            soldQtys[item.productId] = (soldQtys[item.productId] || 0) + item.quantity;
        });

        const reportData = [];
        for (const p of products) {
            const soldQty = soldQtys[p.id] || 0;

            // Define fast moving as > 20 sales in the month
            if (soldQty > 20) {
                const inv = inventory.find(i => i.productId === p.id) || {};
                reportData.push({
                    "SKU / Barcode": p.sku || '-',
                    "Product Name": p.name,
                    "Category": p.category,
                    "Current Stock Qty": inv.stockQuantity || 0,
                    "Cost Price (Rs)": inv.costPrice || 0,
                    "Quantity Sold": soldQty
                });
            }
        }

        if (reportData.length === 0) {
            return showToast('No fast moving products found for this month (sales > 20)!', 'success');
        }

        // Sort by most sold first
        reportData.sort((a, b) => b["Quantity Sold"] - a["Quantity Sold"]);

        const ws = XLSX.utils.json_to_sheet(reportData);
        ws['!cols'] = [
            { wch: 15 }, // SKU
            { wch: 35 }, // Name
            { wch: 20 }, // Category
            { wch: 18 }, // Stock
            { wch: 15 }, // Cost
            { wch: 15 }  // Sold
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Fast Moving");

        XLSX.writeFile(wb, `Fast_Moving_Items_${monthInput}.xlsx`);
        showToast('Fast movement report downloaded!', 'success');

    } catch (err) {
        console.error(err);
        showToast('Failed to generate fast moving report', 'error');
    }
}

// ---------------- Invoices ----------------
async function loadInvoices() {
    const searchId = document.getElementById('invoice-search').value.trim();
    const dateFilter = document.getElementById('invoice-date-filter').value;

    let sales = await db.sales.orderBy('timestamp').reverse().toArray();

    if (searchId) {
        sales = sales.filter(s => s.id.toString() === searchId || s.id.toString().includes(searchId));
    }

    if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        sales = sales.filter(s => new Date(s.timestamp).toDateString() === filterDate);
    }

    const tbody = document.getElementById('invoice-table-body');
    const emptyMsg = document.getElementById('invoice-empty');
    tbody.innerHTML = '';

    if (sales.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        sales.forEach(sale => {
            tbody.innerHTML += `
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${sale.id.toString().padStart(5, '0')}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(sale.timestamp).toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${formatCurrency(sale.totalAmount)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(sale.discount)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 py-1 text-xs rounded-full ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                    sale.paymentMethod === 'Card' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                }">${sale.paymentMethod}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="viewPastReceipt(${sale.id})" class="text-blue-600 hover:text-blue-800 text-xs px-3 py-1.5 border border-blue-200 rounded shadow-sm hover:bg-blue-50 transition-colors"><i class="fa-solid fa-print mr-1"></i> Reprint</button>
                    </td>
                </tr>
            `;
        });
    }
}

// ---------------- Payment Receipt for Installments ----------------
async function viewPaymentReceipt(installmentId) {
    const installment = await db.installments.get(installmentId);
    if (!installment) return;

    const credit = await db.credits.get(installment.creditId);
    if (!credit) return;

    const customer = await db.customers.get(credit.customerId);
    const sale = await db.sales.get(credit.saleId);

    // Calculate previous payments (sum of installments before this one)
    const allInsts = await db.installments.where('creditId').equals(credit.id).toArray();
    const prevInsts = allInsts.filter(i => i.id < installment.id);
    const prevPaidTotal = prevInsts.reduce((sum, i) => sum + i.amount, 0);

    // Setup Receipt Modal content
    document.getElementById('receipt-title-text').innerText = 'PAYMENT RECEIPT';
    document.getElementById('receipt-type-label').innerText = 'Pay ID:';
    document.getElementById('receipt-id').innerText = installment.id.toString().padStart(6, '0');

    document.getElementById('receipt-date').innerText = new Date(installment.paymentDate).toLocaleDateString();
    document.getElementById('receipt-time').innerText = new Date(installment.paymentDate).toLocaleTimeString();

    document.getElementById('receipt-payment-row').style.display = 'flex';
    document.getElementById('receipt-method').innerText = installment.paymentMethod;
    document.getElementById('receipt-footer-msg').innerText = 'Thank you for your payment!';

    const tbody = document.getElementById('receipt-items');
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="py-4 text-center border-b border-dashed border-gray-200">
                <p class="font-bold text-sm">Credit Payment Details</p>
                <p class="text-xs text-gray-500 mt-1">For Bill ID: #${sale.id.toString().padStart(5, '0')}</p>
                ${customer ? `<p class="text-xs mt-1">Customer: ${customer.name}</p>` : ''}
            </td>
        </tr>
    `;

    document.getElementById('receipt-sub').innerText = parseFloat(credit.totalAmount).toFixed(2);
    document.getElementById('receipt-discount').innerText = (sale ? parseFloat(sale.discount) : 0).toFixed(2);
    document.getElementById('receipt-total').innerText = parseFloat(credit.totalAmount).toFixed(2);

    // Add extra history rows
    let container = document.getElementById('receipt-discount').parentElement.parentElement;
    document.querySelectorAll('.receipt-dynamic-row').forEach(el => el.remove());

    // Original Total
    let row1 = document.createElement('div');
    row1.className = "flex justify-between w-full mt-2 pt-2 border-t border-dashed border-gray-300 receipt-dynamic-row text-xs";
    row1.innerHTML = `<span>Original Bill Total:</span> <span>Rs. ${parseFloat(credit.totalAmount).toFixed(2)}</span>`;
    container.appendChild(row1);

    // Previously Paid
    let row2 = document.createElement('div');
    row2.className = "flex justify-between w-full mt-1 receipt-dynamic-row text-xs";
    row2.innerHTML = `<span>Previously Paid:</span> <span>Rs. ${parseFloat(prevPaidTotal).toFixed(2)}</span>`;
    container.appendChild(row2);

    // Paid Now
    let row3 = document.createElement('div');
    row3.className = "flex justify-between w-full mt-1 font-bold text-gray-800 receipt-dynamic-row text-sm";
    row3.innerHTML = `<span>PAID TODAY:</span> <span>Rs. ${parseFloat(installment.amount).toFixed(2)}</span>`;
    container.appendChild(row3);

    // Balance
    const balanceAfterThis = credit.totalAmount - (prevPaidTotal + installment.amount);
    let row4 = document.createElement('div');
    row4.className = "flex justify-between w-full mt-1 font-bold text-red-600 receipt-dynamic-row text-sm border-t border-dashed border-gray-200 pt-1";
    row4.innerHTML = `<span>REMAINING BALANCE:</span> <span>Rs. ${parseFloat(balanceAfterThis).toFixed(2)}</span>`;
    container.appendChild(row4);

    openReceiptModal();
}

async function viewPastReceipt(id) {
    const sale = await db.sales.get(id);
    if (!sale) return;

    const items = await db.saleItems.where('saleId').equals(id).toArray();

    // Reconstruct items
    const cartFormatItems = items.map(async si => {
        const prod = await db.products.get(si.productId);
        return {
            name: prod ? prod.name : 'Unknown Item',
            quantity: si.quantity,
            price: si.unitPrice
        };
    });

    const resolvedItems = await Promise.all(cartFormatItems);

    let subtotal = 0;
    resolvedItems.forEach(i => subtotal += (i.price * i.quantity));

    // Check if there's credit linked
    const linkedCredit = await db.credits.where('saleId').equals(id).first();
    let initialPaidAmount = sale.totalAmount;
    let initialBalance = 0;

    if (linkedCredit) {
        // Technically this gets the CURRENT paid amount/balance, but for a receipt reprint
        // we might want the INITIAL state. Down payments are first installment if any.
        const firstInstallments = await db.installments.where('creditId').equals(linkedCredit.id).toArray();
        const downPaymentRecord = firstInstallments.sort((a, b) => a.id - b.id)[0];

        // If there was a down payment on the same exact day within seconds 
        // OR we just use the current stats depending on policy.
        // Let's use the initial captured credit balance at checkout.
        if (downPaymentRecord && (downPaymentRecord.paymentDate - sale.timestamp) < 60000) {
            initialPaidAmount = downPaymentRecord.amount;
        } else {
            initialPaidAmount = 0;
        }

        initialBalance = sale.totalAmount - initialPaidAmount;
    }

    generateReceiptInfo(
        sale.id,
        resolvedItems,
        subtotal,
        sale.discount,
        sale.extraCharge || 0,
        sale.totalAmount,
        sale.paymentMethod,
        sale.timestamp,
        false,
        initialPaidAmount,
        initialBalance
    );

    openReceiptModal();
}
