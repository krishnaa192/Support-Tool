import axios from 'axios';
let dataPromise = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // Cache duration (e.g., 15 minutes)

const ApiRequest = async () => {
    const now = Date.now();
    const api_url='https://wap.matrixads.in/mglobopay/getSupportMonitorData'

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
            // Reset the promise in case of an error to allow retries
            dataPromise = null;
            throw error;
        });
    }
    

    return dataPromise;
};



// Function to manually refresh data
export const refreshApiRequest = () => {
    dataPromise = null; // Reset the promise to force a new API call
    return ApiRequest();
};

export default ApiRequest;

