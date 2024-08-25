// src/utils/dataUtils.js
import ApiRequest from './APi'; // Ensure the correct import path for ApiRequest

export const fetchDataAndCount = async () => {
    try {
        const result = await ApiRequest();

        const inactiveData = {};
        let totalCount = 0;
        let inactiveCount = 0;
        let activeCount = 0;
        let noTrafficCount = 0;

        result.forEach(item => {
            const {
                app_serviceid,
                time,
                pingenCount,
                pinverCount,
            } = item;

            if (!inactiveData[app_serviceid]) {
                inactiveData[app_serviceid] = {
                    hours: Array.from({ length: 24 }, () => ({
                        pingenCount: 0,
                        pinverCount: 0,
                    })),
                };
                totalCount += 1;
            }

            const hour = parseInt(time, 10);
            inactiveData[app_serviceid].hours[hour] = {
                pingenCount: pingenCount || 0,
                pinverCount: pinverCount || 0,
            };
        });

        const currentHour = new Date().getHours();
        Object.keys(inactiveData).forEach(serviceId => {
            const lastHourData0 = inactiveData[serviceId].hours[(currentHour - 0 + 24) % 24];
            const lastHourData1 = inactiveData[serviceId].hours[(currentHour - 1 + 24) % 24];

            const noTrafficLastTwoHours = 
                lastHourData0.pingenCount === 0 && lastHourData0.pinverCount === 0 &&
                lastHourData1.pingenCount === 0 && lastHourData1.pinverCount === 0;

            if (noTrafficLastTwoHours) {
                noTrafficCount += 1;
                inactiveCount += 1;
            } else {
                activeCount += 1;
            }
        });

        return {
            data: result,
            totalCount,
            inactiveCount,
            activeCount,
            noTrafficCount,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const processDataByServiceId = (data) => {
    const processedData = {};

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
                hours: Array.from({ length: 24 }, () => ({
                    hour: 0,
                    pingenCount: 0,
                    pingenCountSuccess: 0,
                    pinverCount: 0,
                    pinverCountSuccess: 0,
                })),
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
