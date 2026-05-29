const firebaseConfig = {
  apiKey: "AIzaSyBESjvKB9_YL2dcAm-ZQ_QCEb9trXakn1M",
  authDomain: "sariclick-d773c.firebaseapp.com",
  databaseURL: "https://sariclick-d773c-default-rtdb.firebaseio.com",
  projectId: "sariclick-d773c",
  storageBucket: "sariclick-d773c.firebasestorage.app",
  messagingSenderId: "1024481424403",
  appId: "1:1024481424403:web:2bfc099ef1be7dac2c7be6",
  measurementId: "G-5ENGM1HBJ5"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Helper to get the correct store path
function getStorePath(storeId) {
    return database.ref('stores/' + storeId);
}