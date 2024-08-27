import ApiRequest from './APi';

const fetchData = async () => {
    const result = await ApiRequest();
    console.log("Data", result);
    const processedData = result.reduce((acc, item) => {
        const {
            app_serviceid,
            territory,
            servicename,
            operator,
            billername,
            service_partner,
            partner,
            time,
            pingenCount = 0,
            pingenCountSuccess = 0,
            pinverCount = 0,
            pinverCountSuccess = 0,
        } = item;

        if (!acc[app_serviceid]) {
            acc[app_serviceid] = {
                info: { territory, servicename, operator, partner, billername, service_partner },
                hours: Array.from({ length: 24 }, () => ({
                    pingenCount: 0,
                    pingenCountSuccess: 0,
                    pinverCount: 0,
                    pinverCountSuccess: 0,
                })),
            };
        }

        const hour = parseInt(time, 10);
        acc[app_serviceid].hours[hour] = {
            pingenCount,
            pingenCountSuccess,
            pinverCount,
            pinverCountSuccess,
        };

        return acc;
    }, {});

    return processedData;
};

export default fetchData;
