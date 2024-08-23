import axios from 'axios';

const ApiRequest =  async () => {
    try {
        const response = await axios.get('https://wap.matrixads.in/mglobopay/getSupportMonitorData', {
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = response.data;
       
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export default ApiRequest;
