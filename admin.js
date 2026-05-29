window.goToSalesReport = function() {
    sessionStorage.setItem('referrer', 'admin.html');
   window.location.href = 'vendor-custom-rns2.html'; 
};

function monitorStores() {
   
    database.ref('stores').on('value', (snapshot) => {
        const stores = snapshot.val() || {};
        
        let globalRevenue = 0;
        let globalOrderCount = 0;

        for (let i = 1; i <= 3; i++) {
            const storeId = `store_00${i}`;
            const storeData = stores[storeId] || {};
            const orders = storeData.orders || {};
            
            let storeRevenue = 0;
            let storeOrders = Object.keys(orders).length;

            Object.values(orders).forEach(order => {
                storeRevenue += parseFloat(order.totalAmount || 0);
            });

            const revEl = document.getElementById(`s${i}-rev`);
            const orderEl = document.getElementById(`s${i}-orders`);
            
            if (revEl) revEl.innerText = `₱${storeRevenue.toFixed(2)}`;
            if (orderEl) orderEl.innerText = storeOrders;

            globalRevenue += storeRevenue;
            globalOrderCount += storeOrders;
        }

        document.getElementById('global-revenue').innerText = `₱${globalRevenue.toFixed(2)}`;
        document.getElementById('global-orders').innerText = globalOrderCount;
    });
}

monitorStores();