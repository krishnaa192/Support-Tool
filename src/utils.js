import ApiRequest from './APi'; // Ensure the correct import path for ApiRequest

export const fetchDataAndCount = async () => {
    try {
        const response = await ApiRequest();
      
        const data = Array.isArray(response.data) ? response.data : [];
        
        return {
            data,
            count: data.length
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return {
            data: [],
            count: 0
        };
    }
};

export const processDataByServiceId = (data) => {
    const processedData = {};

    // Ensure data is an array before processing
    if (!Array.isArray(data)) {
        console.error("Expected data to be an array but received:", data);
        return processedData;
    }

    data.forEach(item => {
        const {
            app_serviceid,
            territory,
            servicename,
            operator,
            partner,
            billername,
            service_partner,
            time,
            pingenCount,
            pingenCountSuccess,
            pinverCount,
            pinverCountSuccess
        } = item;

        const hour = parseInt(time, 10); // Ensure hour is a number

        if (!processedData[app_serviceid]) {
            processedData[app_serviceid] = {
                info: {
                    territory: territory || '',
                    servicename: servicename || '',
                    operator: operator || '',
                    partner: partner || '',
                    billername: billername || '',
                    service_partner: service_partner || ''
                },
                // from 0 to current hour
                hours: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    pingenCount: 0,
                    pingenCountSuccess: 0,
                    pinverCount: 0,
                    pinverCountSuccess: 0
                }))
            };
        }

        if (hour >= 0 && hour < 24) {
            processedData[app_serviceid].hours[hour] = {
                hour, // Ensure hour is included in each object
                pingenCount: processedData[app_serviceid].hours[hour].pingenCount + (pingenCount || 0),
                pingenCountSuccess: processedData[app_serviceid].hours[hour].pingenCountSuccess + (pingenCountSuccess || 0),
                pinverCount: processedData[app_serviceid].hours[hour].pinverCount + (pinverCount || 0),
                pinverCountSuccess: processedData[app_serviceid].hours[hour].pinverCountSuccess + (pinverCountSuccess || 0),
            };
        }
    });

    return processedData;
};

// Fetch data and process it
fetchDataAndCount().then(({ data }) => {
    const processedData = processDataByServiceId(data);
 
}).catch(error => {
    console.error("Error processing data:", error);
});
