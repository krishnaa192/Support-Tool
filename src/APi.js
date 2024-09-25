import axios from 'axios';

// Cached data and last fetch time
let dataPromise = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // Cache for 15 minutes

// API request with caching logic (for general API calls)
const ApiRequest = async () => {
    const now = Date.now();
    const api_url = process.env.REACT_APP_API_URL; // Make sure this is set correctly in your .env file

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

// Check if 24 hours have passed since the last API call
const shouldCallApi = (lastApiCallTime) => {
    const now = new Date();
    const lastCall = new Date(lastApiCallTime);
    const hoursPassed = Math.abs(now - lastCall) / 36e5; // 36e5 = 1000ms * 60sec * 60min
    return hoursPassed >= 24;
};

// Function to get daily data with 24-hour rate-limiting
const dailyData = async () => {
    const api_url = 'https://wap.matrixads.in/mglobopay/getHourlyInappReport';
    const lastApiCallTime = localStorage.getItem('lastApiCallTime');
    
    // Check if 24 hours have passed since the last API call
    // if (!lastApiCallTime || shouldCallApi(lastApiCallTime)) {
        try {
            // Use axios to make the API call
            const response = await axios.get(api_url, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = response.data;

            // Update the last API call time in local storage
            localStorage.setItem('lastApiCallTime', new Date().toISOString());

            return data;
        } catch (error) {
            console.error("Error fetching daily data:", error);
            throw error; // Re-throw the error for higher-level handling
        }
    // } else {
        // Return cached data or handle as necessary
    //     console.log("Using cached data, no need to call API.");
    //     return null; // Return null or some default value
    // }
};

// Function to manually refresh data
export const refreshApiRequest = () => {
    dataPromise = null; // Reset the promise to force a new API call
    return ApiRequest();
};

export { ApiRequest, dailyData };
