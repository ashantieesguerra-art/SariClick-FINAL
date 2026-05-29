let products = [];
let cart = [];
let currentCategory = 'All';
let currentOrderRefId = ''; // Global tracker to keep track of the current transaction's ID

// Helper function to generate clean alphanumeric Reference IDs
function generateReferenceID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TXN-';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result; // Outputs format like: TXN-K87X2
}

window.render = function() {
    const cList = document.getElementById('customer-list');
    const searchInput = document.getElementById('customer-search');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    
    const filtered = products.filter(p => {
        const matchesCat = currentCategory === 'All' || p.category === currentCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
    });

    if (cList) {
        cList.innerHTML = filtered.length ? filtered.map((p) => `
            <div class="product-item">
                <div>
                    <strong>${p.name}</strong><br>
                    <small>${p.category} | ₱${parseFloat(p.price).toFixed(2)}</small>
                </div>
                <button onclick="addToCart('${p.name.replace(/'/g, "\\'")}')" style="background:#00a844; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Add</button>
            </div>
        `).join('') : "No products found.";
    }

    // UPDATED: This section now adds a delete button to every line item in the cart array
    const cartContainer = document.getElementById('cart-items');
    if (cartContainer) {
        cartContainer.innerHTML = cart.length ? cart.map((item, index) => `
            <div class="product-item" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span>${item.name}</span><br>
                    <small style="color: #666;">₱${parseFloat(item.price).toFixed(2)}</small>
                </div>
                <button onclick="removeFromCart(${index})" style="background: #dc3545; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 12px;">×</button>
            </div>
        `).join('') : '<div style="color: #888; text-align: center; margin-top: 20px;">Your cart is empty</div>';
    }

    document.getElementById('cart-badge').innerText = `Cart: ${cart.length} items`;
    
    // Toggle actions based on cart items status
    document.getElementById('checkout-btn').classList.toggle('hidden', cart.length === 0);
    document.getElementById('clear-cart-btn').classList.toggle('hidden', cart.length === 0);
};
// Function to delete a single product from the cart by its index array position
window.removeFromCart = (index) => {
    cart.splice(index, 1); // Removes exactly 1 item at the clicked position
    window.render(); // Redraw the interface
};

// Function to empty out the entire basket instantly
window.clearCart = () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
        cart = [];
        window.render();
    }
};

window.addToCart = (name) => { 
    const item = products.find(p => p.name === name);
    if(item) {
        cart.push(item); 
        window.render(); 
    }
};

window.filterCustomer = (cat) => {
    currentCategory = cat;
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat || (cat === 'All' && btn.innerText === 'All'));
    });
    window.render();
};

window.showReceipt = () => {
    // 1. Generate the unique transaction reference ID right when checkout is opened
    currentOrderRefId = generateReferenceID();
    document.getElementById('receipt-ref-id').innerText = currentOrderRefId;

    // 2. Calculate the exact checkout sum total
    const total = cart.reduce((s, item) => s + parseFloat(item.price), 0);
    
    // 3. Render the text markup details into the receipt container window
    document.getElementById('receipt-details').innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; font-family: monospace;">
            <span>${item.name}</span>
            <span>₱${parseFloat(item.price).toFixed(2)}</span>
        </div>
    `).join('') + `<br><div style="display:flex; justify-content:space-between; font-family: monospace; font-size: 1.1em;"><strong>TOTAL:</strong><strong>₱${total.toFixed(2)}</strong></div>`;
    
    document.getElementById('receipt-modal').classList.remove('hidden');
};

window.closeReceipt = () => { 
    if (cart.length > 0) {
        const total = cart.reduce((s, item) => s + parseFloat(item.price), 0);
        
        // Construct transaction schema with the tracking reference ID included
        const newOrder = {
            referenceId: currentOrderRefId, // Pushed directly into your live Firebase records
            items: cart.map(i => i.name),
            totalAmount: total,
            date: new Date().toLocaleString(),
            status: "Completed"
        };
        
        database.ref('stores/store_001/orders').push(newOrder);
    }
    
    // Clear temporary data trackers and step backwards safely
    cart = []; 
    currentOrderRefId = '';
    document.getElementById('receipt-modal').classList.add('hidden'); 
    window.render(); 
};

window.continueShopping = () => {
    document.getElementById('receipt-modal').classList.add('hidden');
    window.render(); 
};

database.ref('stores/store_001/inventory').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        products = Object.keys(data).map(key => ({
            name: key,
            ...data[key]
        }));
    } else {
        products = typeof defaultItems !== 'undefined' ? defaultItems : [];
    }
    window.render(); 
});