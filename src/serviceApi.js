import axios from 'axios';

class serviceApi {
    constructor() {
        if (serviceApi.instance) {
            return serviceApi.instance;
        }

        this.data = null;
        this.isFetching = false;

        serviceApi.instance = this;
        return this;
    }

    async fetchData(url) {
        if (this.isFetching) {
            return this.data;
        }

        this.isFetching = true;

        try {
            const response = await axios.get(url, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = response.data;
            return this.data;
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        } finally {
            this.isFetching = false;
        }
    }
}

export default new serviceApi();
