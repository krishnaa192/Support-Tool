// Utility functions for IndexedDB
const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ApiCacheDB", 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("apiCache")) {
                db.createObjectStore("apiCache", { keyPath: "key" });
            }
        };
        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject("Error opening IndexedDB");
        };
    });
};

const storeInIndexedDB = async (key, value) => {
    try {
        const db = await openIndexedDB();
        const tx = db.transaction("apiCache", "readwrite");
        const store = tx.objectStore("apiCache");
        store.put({ key, value });
        return tx.complete;
    } catch (error) {
        console.error("Error storing data in IndexedDB:", error);
    }
};

const getFromIndexedDB = async (key) => {
    try {
        const db = await openIndexedDB();
        const tx = db.transaction("apiCache", "readonly");
        const store = tx.objectStore("apiCache");
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => {
                reject("Error retrieving data from IndexedDB");
            };
        });
    } catch (error) {
        console.error("Error getting data from IndexedDB:", error);
    }
};

export {getFromIndexedDB,storeInIndexedDB}