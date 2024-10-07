import axios from 'axios';
import {getFromIndexedDB,storeInIndexedDB} from './IndexedUtils'

let dataPromise = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // Cache for 15 minutes

// Function to make API request with caching
const ApiRequest = async () => {
    const now = Date.now();
    const api_url = process.env.REACT_APP_API_URL; // Ensure this is set correctly in your .env file

    // Check if cached data is still valid
    if (!dataPromise || (now - lastFetchTime > CACHE_DURATION)) {
        dataPromise = axios.get(api_url, {
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            lastFetchTime = now; // Update last fetch time
            return response.data;
        })
        .catch(error => {
            console.error('API Error:', error);
            dataPromise = null; // Reset the promise to allow retries
            throw error;
        });
    }
    return dataPromise;
};




// Function to check if 24 hours have passed
const shouldCallApi = (lastApiCallTime) => {
    const lastCallDate = new Date(lastApiCallTime);
    const currentTime = new Date();
    const timeDiff = currentTime - lastCallDate; // Difference in milliseconds
    return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

// Function to get daily data with 24-hour rate-limiting
const dailyData = async () => {
    const api_url_week = process.env.REACT_APP_HOURLY_URL;

    // Retrieve the last API call time from local storage
    const lastApiCallTime = localStorage.getItem('lastApiCallTime');
    const cachedData = await getFromIndexedDB('cachedDailyData');

    // Check if 24 hours have passed since the last API call
    if (cachedData && !shouldCallApi(lastApiCallTime)) {
        return cachedData; // Return cached data if still valid
    }

    try {
        // Use axios to make the API call
        const response = await axios.get(api_url_week, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;

        // Try to manage and store the response data in IndexedDB
        try {
            localStorage.setItem('lastApiCallTime', new Date().toISOString());
            await storeInIndexedDB('cachedDailyData', data);
        } catch (error) {
            console.error('Failed to store data in IndexedDB:', error);
        }

        return data;
    } catch (error) {
        console.error("Error fetching daily data:", error);
        throw error; // Re-throw the error for higher-level handling
    }
};



export { ApiRequest, dailyData };



