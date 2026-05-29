// PROTECT THE PAGE: Redirect to login if not authenticated
if (sessionStorage.getItem('vendorLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

const STORE_ID = 'store_001'; 
let products = [];
let currentCategory = 'All';

// 1. Real-time Listener
database.ref(`stores/${STORE_ID}/inventory`).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        products = Object.keys(data).map(key => ({
            id: key, 
            ...data[key]
        }));
    } else {
        products = [];
    }
    window.updateList(); 
});

// 2. Render Function with Sorting & Alerts
window.updateList = function() {
    const list = document.getElementById('product-list');
    const searchInput = document.getElementById('vendor-search');
    const sortOrder = document.getElementById('sort-order').value; // Get sort choice
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    
    // --- STEP A: SORTING LOGIC ---
    let sortedProducts = [...products]; // Create a copy to sort
    
    if (sortOrder === "low-stock") {
        sortedProducts.sort((a, b) => parseInt(a.qty) - parseInt(b.qty));
    } else if (sortOrder === "price-high") {
        sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else {
        // Default: Alphabetical by Name
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // --- STEP B: FILTERING ---
    const filtered = sortedProducts.filter(p => {
        const matchesCat = currentCategory === 'All' || p.category === currentCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
    });

    document.getElementById('count').innerText = filtered.length;

    // --- STEP C: RENDERING ---
    list.innerHTML = filtered.map((p) => {
        const isLow = parseInt(p.qty) <= (parseInt(p.alertLevel) || 5);
        const itemStyle = isLow 
            ? "border-bottom: 1px solid #eee; padding: 10px; display: flex; justify-content: space-between; background-color: #fff5f5; border-left: 5px solid #ff4d4d;" 
            : "border-bottom: 1px solid #eee; padding: 10px; display: flex; justify-content: space-between;";

        return `
            <div class="product-item" style="${itemStyle}">
                <div>
                    <strong>${p.name}</strong> 
                    ${isLow ? '<span style="background: #ff4d4d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 5px;">LOW STOCK</span>' : ''}
                    <br>
                    <small>${p.category} | Qty: ${isLow ? '<b style="color:red;">' + p.qty + '</b>' : p.qty}</small>
                </div>
                <div style="text-align: right;">
                    <strong>₱${parseFloat(p.price).toFixed(2)}</strong>
                    <button onclick="deleteProduct('${p.id}')" style="margin-left:10px; color:red; border:none; background:none; cursor:pointer;">✕</button>
                </div>
            </div>
        `;
    }).join('');
};

// 3. Add Product Logic
const prodForm = document.getElementById('product-form');
if (prodForm) {
    prodForm.onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('p-name').value;
        const newProd = {
            name: name,
            price: document.getElementById('p-price').value,
            qty: document.getElementById('p-qty').value,
            category: document.getElementById('p-category').value,
            alertLevel: document.getElementById('p-alert').value || 5
        };

        database.ref(`stores/${STORE_ID}/inventory/${name}`).set(newProd)
            .then(() => {
                alert("Product Added!");
                prodForm.reset();
            });
    };
}

// 4. Global Functions
window.filterBy = (cat) => {
    currentCategory = cat;
    document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === cat);
    });
    window.updateList();
};

window.deleteProduct = (id) => {
    if(confirm("Delete this product?")) {
        database.ref(`stores/${STORE_ID}/inventory/${id}`).remove();
    }
};

window.logout = function() {
    if(confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem('vendorLoggedIn');
        window.location.href = 'login.html';
    }
};