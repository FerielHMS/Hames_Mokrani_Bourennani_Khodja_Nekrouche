var STORES = {
    USERS: 'users',
    WORKERS: 'workers',
    CARS: 'cars',
    ORDERS: 'orders',
    BOOKINGS: 'bookings',
    ACTIVITY_LOG: 'activityLog'
};

var database = null;
var initPromise = null;

var ALL_CARS = [
    { id: 1, name: "Ferrari F8 Tributo", price: 280000, category: "Sport", seats: 2, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Ferrari_F8_Tributo.jpg", year: 2023, engine: "3.9L V8", horsepower: 710 },
    { id: 2, name: "Lamborghini Huracan EVO", price: 260000, category: "Sport", seats: 2, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Lamborghini_Huracan_EVO.jpg", year: 2023, engine: "5.2L V10", horsepower: 640 },
    { id: 3, name: "McLaren 720S", price: 300000, category: "Sport", seats: 2, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/McLaren_720S.jpg", year: 2023, engine: "4.0L V8", horsepower: 710 },
    { id: 4, name: "Porsche 911 Turbo S", price: 220000, category: "Sport", seats: 4, transmission: "Automatic", stock: "Limited", popular: true, image: "../image/Porsche_911_Turbo_S.jpg", year: 2023, engine: "3.7L Flat-6", horsepower: 640 },
    { id: 5, name: "Chevrolet Corvette C8", price: 90000, category: "Sport", seats: 2, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Chevrolet_Corvette_C8.jpg", year: 2023, engine: "6.2L V8", horsepower: 495 },
    { id: 6, name: "Nissan GT-R Nismo", price: 180000, category: "Sport", seats: 4, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Nissan_GT_R_Nismo.jpg", year: 2023, engine: "3.8L V6", horsepower: 600 },
    { id: 7, name: "Audi R8 V10", price: 200000, category: "Sport", seats: 2, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Audi_R8_V10.jpg", year: 2023, engine: "5.2L V10", horsepower: 602 },
    { id: 8, name: "Aston Martin Vantage", price: 170000, category: "Sport", seats: 2, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Aston_Martin_Vantage.jpg", year: 2023, engine: "4.0L V8", horsepower: 503 },
    { id: 9, name: "BMW M4 Competition", price: 90000, category: "Sport", seats: 4, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/BMW_M4_Competition.jpg", year: 2023, engine: "3.0L I6", horsepower: 503 },
    { id: 10, name: "Mercedes AMG GT R", price: 160000, category: "Sport", seats: 2, transmission: "Automatic", stock: "Limited", popular: true, image: "../image/Mercedes_AMG_GT_R.jpg", year: 2023, engine: "4.0L V8", horsepower: 577 },
    { id: 11, name: "BMW X5", price: 80000, category: "SUV", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/BMW_X5.jpg", year: 2023, engine: "3.0L I6", horsepower: 375 },
    { id: 12, name: "BMW X6", price: 90000, category: "SUV", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/BMW_X6.jpg", year: 2023, engine: "3.0L I6", horsepower: 375 },
    { id: 13, name: "Mercedes GLE", price: 85000, category: "SUV", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Mercedes_GLE.jpg", year: 2023, engine: "3.0L I6", horsepower: 362 },
    { id: 14, name: "Mercedes G-Class", price: 140000, category: "SUV", seats: 5, transmission: "Automatic", stock: "Limited", popular: true, image: "../image/Mercedes_G_Class.jpg", year: 2023, engine: "4.0L V8", horsepower: 416 },
    { id: 15, name: "Audi Q7", price: 75000, category: "SUV", seats: 7, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Audi_Q7.jpg", year: 2023, engine: "3.0L V6", horsepower: 335 },
    { id: 16, name: "Audi Q8", price: 95000, category: "SUV", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Audi_Q8.jpg", year: 2023, engine: "3.0L V6", horsepower: 335 },
    { id: 17, name: "Range Rover Sport", price: 110000, category: "SUV", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Range_Rover_Sport.jpg", year: 2023, engine: "3.0L I6", horsepower: 395 },
    { id: 18, name: "Toyota Land Cruiser", price: 70000, category: "SUV", seats: 7, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Toyota_Land_Cruiser.jpg", year: 2023, engine: "3.5L V6", horsepower: 409 },
    { id: 19, name: "Hyundai Santa Fe", price: 40000, category: "SUV", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Hyundai_Santa_Fe.jpg", year: 2023, engine: "2.5L I4", horsepower: 277 },
    { id: 20, name: "Kia Sorento", price: 38000, category: "SUV", seats: 7, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Kia_Sorento.jpg", year: 2023, engine: "2.5L I4", horsepower: 281 },
    { id: 21, name: "Toyota Camry", price: 30000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Toyota_Camry.jpg", year: 2023, engine: "2.5L I4", horsepower: 203 },
    { id: 22, name: "Honda Accord", price: 32000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Honda_Accord.jpg", year: 2023, engine: "1.5L I4", horsepower: 192 },
    { id: 23, name: "BMW 5 Series", price: 70000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/BMW_5_Series.jpg", year: 2023, engine: "2.0L I4", horsepower: 255 },
    { id: 24, name: "Mercedes E-Class", price: 75000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Mercedes_E_Class.jpg", year: 2023, engine: "2.0L I4", horsepower: 255 },
    { id: 25, name: "Audi A6", price: 68000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Audi_A6.jpg", year: 2023, engine: "2.0L I4", horsepower: 261 },
    { id: 26, name: "Tesla Model 3", price: 45000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Tesla_Model_3.jpg", year: 2023, engine: "Electric", horsepower: 283 },
    { id: 27, name: "Tesla Model S", price: 90000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Tesla_Model_S.jpg", year: 2023, engine: "Electric", horsepower: 670 },
    { id: 28, name: "Hyundai Sonata", price: 28000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Hyundai_Sonata.jpg", year: 2023, engine: "2.5L I4", horsepower: 191 },
    { id: 29, name: "Kia K5", price: 27000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Kia_K5.jpg", year: 2023, engine: "1.6L I4", horsepower: 180 },
    { id: 30, name: "Volkswagen Passat", price: 30000, category: "Sedan", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Volkswagen_Passat.jpg", year: 2023, engine: "2.0L I4", horsepower: 174 },
    { id: 31, name: "Rolls-Royce Phantom", price: 450000, category: "Luxury", seats: 5, transmission: "Automatic", stock: "Pre-order", popular: true, image: "../image/Rolls_Royce_Phantom.jpg", year: 2023, engine: "6.75L V12", horsepower: 563 },
    { id: 32, name: "Rolls-Royce Ghost", price: 350000, category: "Luxury", seats: 5, transmission: "Automatic", stock: "Pre-order", popular: true, image: "../image/Rolls_Royce_Ghost.jpg", year: 2023, engine: "6.75L V12", horsepower: 563 },
    { id: 33, name: "Bentley Continental GT", price: 250000, category: "Luxury", seats: 4, transmission: "Automatic", stock: "Limited", popular: true, image: "../image/Bentley_Continental_GT.jpg", year: 2023, engine: "4.0L V8", horsepower: 542 },
    { id: 34, name: "Bentley Bentayga", price: 230000, category: "Luxury", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Bentley_Bentayga.jpg", year: 2023, engine: "4.0L V8", horsepower: 542 },
    { id: 35, name: "Lamborghini Urus", price: 240000, category: "Luxury", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Lamborghini_Urus.jpg", year: 2023, engine: "4.0L V8", horsepower: 657 },
    { id: 36, name: "Ferrari Roma", price: 240000, category: "Luxury", seats: 4, transmission: "Automatic", stock: "Limited", popular: true, image: "../image/Ferrari_Roma.jpg", year: 2023, engine: "3.9L V8", horsepower: 612 },
    { id: 37, name: "Maybach S680", price: 220000, category: "Luxury", seats: 5, transmission: "Automatic", stock: "Pre-order", popular: true, image: "../image/Maybach_S680.jpg", year: 2023, engine: "6.0L V12", horsepower: 621 },
    { id: 38, name: "Aston Martin DB11", price: 210000, category: "Luxury", seats: 4, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Aston_Martin_DB11.jpg", year: 2023, engine: "4.0L V8", horsepower: 528 },
    { id: 39, name: "McLaren GT", price: 210000, category: "Luxury", seats: 2, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/McLaren_GT.jpg", year: 2023, engine: "4.0L V8", horsepower: 612 },
    { id: 40, name: "Bugatti Chiron", price: 3000000, category: "Luxury", seats: 2, transmission: "Automatic", stock: "Pre-order", popular: true, image: "../image/Bugatti_Chiron.jpg", year: 2023, engine: "8.0L W16", horsepower: 1479 },
    { id: 41, name: "Lucid Air", price: 45000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Lucid_Air.jpg", year: 2023, engine: "Electric", horsepower: 480 },
    { id: 42, name: "Tesla Model Y", price: 50000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Tesla_Model_Y.jpg", year: 2023, engine: "Electric", horsepower: 384 },
    { id: 43, name: "Tesla Model X", price: 90000, category: "Electric", seats: 7, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Tesla_Model_X.jpg", year: 2023, engine: "Electric", horsepower: 670 },
    { id: 44, name: "Tesla Cybertruck", price: 80000, category: "Electric", seats: 6, transmission: "Automatic", stock: "Pre-order", popular: true, image: "../image/Tesla_Cybertruck.jpg", year: 2024, engine: "Electric", horsepower: 845 },
    { id: 45, name: "Porsche Taycan", price: 120000, category: "Electric", seats: 4, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Porsche_Taycan.jpg", year: 2023, engine: "Electric", horsepower: 522 },
    { id: 46, name: "BMW i4", price: 55000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/BMW_i4.jpg", year: 2023, engine: "Electric", horsepower: 335 },
    { id: 47, name: "Audi e-tron GT", price: 110000, category: "Electric", seats: 4, transmission: "Automatic", stock: "In Stock", popular: true, image: "../image/Audi_e_tron_GT.jpg", year: 2023, engine: "Electric", horsepower: 522 },
    { id: 48, name: "Mercedes EQS", price: 130000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Mercedes_EQS.jpg", year: 2023, engine: "Electric", horsepower: 516 },
    { id: 49, name: "Hyundai Ioniq 5", price: 45000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Hyundai_Ioniq_5.jpg", year: 2023, engine: "Electric", horsepower: 320 },
    { id: 50, name: "Nissan Ariya", price: 42000, category: "Electric", seats: 5, transmission: "Automatic", stock: "In Stock", popular: false, image: "../image/Nissan_Ariya.jpg", year: 2023, engine: "Electric", horsepower: 238 }
];

function initDatabase() {
    if (initPromise) {
        return initPromise;
    }
    
    initPromise = new Promise(function(resolve, reject) {
        var request = indexedDB.open('TokyoDriftDB', 2);
        
        request.onerror = function(event) {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            database = event.target.result;
            console.log('Database opened successfully');
            resolve(database);
        };
        
        request.onupgradeneeded = function(event) {
            var db = event.target.result;
            
            if (!db.objectStoreNames.contains(STORES.USERS)) {
                db.createObjectStore(STORES.USERS, { keyPath: 'email' });
                console.log('Users store created');
            }
            
            if (!db.objectStoreNames.contains(STORES.WORKERS)) {
                db.createObjectStore(STORES.WORKERS, { keyPath: 'email' });
                console.log('Workers store created');
            }
            
            if (!db.objectStoreNames.contains(STORES.CARS)) {
                db.createObjectStore(STORES.CARS, { keyPath: 'id' });
                console.log('Cars store created');
            }
            
            if (!db.objectStoreNames.contains(STORES.ORDERS)) {
                db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
                console.log('Orders store created');
            }
            
            if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
                db.createObjectStore(STORES.BOOKINGS, { keyPath: 'id' });
                console.log('Bookings store created');
            }
            
            if (!db.objectStoreNames.contains(STORES.ACTIVITY_LOG)) {
                db.createObjectStore(STORES.ACTIVITY_LOG, { keyPath: 'id' });
                console.log('Activity log store created');
            }
        };
    });
    
    return initPromise;
}

function getAllItems(storeName) {
    return initDatabase().then(function(db) {
        return new Promise(function(resolve, reject) {
            var transaction = db.transaction([storeName], 'readonly');
            var store = transaction.objectStore(storeName);
            var request = store.getAll();
            request.onsuccess = function() { resolve(request.result || []); };
            request.onerror = function() { reject(request.error); };
        });
    });
}

function addItem(storeName, item) {
    return initDatabase().then(function(db) {
        return new Promise(function(resolve, reject) {
            var transaction = db.transaction([storeName], 'readwrite');
            var store = transaction.objectStore(storeName);
            var request = store.add(item);
            request.onsuccess = function() { resolve(item); };
            request.onerror = function() { reject(request.error); };
        });
    });
}

function getItem(storeName, key) {
    return initDatabase().then(function(db) {
        return new Promise(function(resolve, reject) {
            var transaction = db.transaction([storeName], 'readonly');
            var store = transaction.objectStore(storeName);
            var request = store.get(key);
            request.onsuccess = function() { resolve(request.result || null); };
            request.onerror = function() { reject(request.error); };
        });
    });
}

function putItem(storeName, item) {
    return initDatabase().then(function(db) {
        return new Promise(function(resolve, reject) {
            var transaction = db.transaction([storeName], 'readwrite');
            var store = transaction.objectStore(storeName);
            var request = store.put(item);
            request.onsuccess = function() { resolve(item); };
            request.onerror = function() { reject(request.error); };
        });
    });
}

function deleteItem(storeName, key) {
    return initDatabase().then(function(db) {
        return new Promise(function(resolve, reject) {
            var transaction = db.transaction([storeName], 'readwrite');
            var store = transaction.objectStore(storeName);
            var request = store.delete(key);
            request.onsuccess = function() { resolve(); };
            request.onerror = function() { reject(request.error); };
        });
    });
}

function clearStore(storeName) {
    return initDatabase().then(function(db) {
        return new Promise(function(resolve, reject) {
            var transaction = db.transaction([storeName], 'readwrite');
            var store = transaction.objectStore(storeName);
            var request = store.clear();
            request.onsuccess = function() { resolve(); };
            request.onerror = function() { reject(request.error); };
        });
    });
}

function populateInitialData() {
    return initDatabase().then(function() {
        return getAllItems(STORES.WORKERS).then(function(workers) {
            if (workers.length === 0) {
                return addItem(STORES.WORKERS, {
                    name: "John Worker",
                    email: "worker@tokyodrift.com",
                    password: "worker123",
                    createdAt: new Date().toISOString()
                });
            }
        });
    }).then(function() {
        return getAllItems(STORES.CARS).then(function(cars) {
            if (cars.length === 0) {
                console.log('Populating 50 cars...');
                var promises = [];
                for (var i = 0; i < ALL_CARS.length; i++) {
                    promises.push(addItem(STORES.CARS, ALL_CARS[i]));
                }
                return Promise.all(promises);
            }
        });
    }).then(function() {
        return getAllItems(STORES.CARS).then(function(cars) {
            window.carsDatabase = cars;
            console.log('Cars loaded:', cars.length);
        });
    });
}

function addActivityLog(userName, userEmail, userRole, action, details, targetId) {
    return getAllItems(STORES.ACTIVITY_LOG).then(function(logs) {
        var newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userName: userName,
            userEmail: userEmail,
            userRole: userRole,
            action: action,
            details: details,
            targetId: targetId || null
        };
        logs.unshift(newLog);
        if (logs.length > 500) logs.pop();
        return clearStore(STORES.ACTIVITY_LOG).then(function() {
            var promises = [];
            for (var i = 0; i < logs.length; i++) {
                promises.push(addItem(STORES.ACTIVITY_LOG, logs[i]));
            }
            return Promise.all(promises);
        });
    });
}

window.db = {
    STORES: STORES,
    getAllItems: getAllItems,
    addItem: addItem,
    getItem: getItem,
    putItem: putItem,
    deleteItem: deleteItem,
    clearStore: clearStore,
    addActivityLog: addActivityLog,
    init: initDatabase
};

initDatabase().then(function() {
    console.log('Database ready');
    return populateInitialData();
}).then(function() {
    console.log('Data population complete');
    var event = new Event('databaseReady');
    window.dispatchEvent(event);
}).catch(function(err) {
    console.error('Failed to initialize:', err);
});