const preprocess = (data) => {
    const weeklydata = {};
    const currentDate = new Date();
    const currentHour = currentDate.getHours(); // Get current hour

    if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        return weeklydata;
    }

    data.forEach(item => {
        const {
            appServiceId,    // Updated field name
            territory,
            serviceName,     // Updated field name
            operatorname,
            operatorid,
            partnerName,     // Updated field name
            biller,
            service_owner,
            hrs,
            pinGenReqCount,  // Updated field name
            pinGenSucCount,  // Updated field name
            pinVerReqCount,  // Updated field name
            pinVerSucCount,  // Updated field name
            actDate          // The date of the data entry
        } = item;

        const hour = parseInt(hrs, 10); // Ensure hour is a number

        // Ensure the appServiceId entry exists
        if (!weeklydata[appServiceId]) {
            weeklydata[appServiceId] = {
                info: {
                    territory: territory || '',
                    servicename: serviceName || '',
                    operator: operatorname || '',
                    partner: partnerName || '',
                    billername: biller || '',
                    operatorid: operatorid || '',
                    service_partner: service_owner || '',
                    Datadate:actDate
                },
                pingenCount: 0,
                pingenCountSuccess: 0,
                pinverCount: 0,
                pinverCountSuccess: 0
            };
        }

        // Get the date of the entry
        const entryDate = new Date(actDate);
        const isToday = currentDate.toDateString() === entryDate.toDateString();

        // Only sum the data for hours before the current hour if it is today's data
        if (!isToday || (isToday && hour <= currentHour)) {
            weeklydata[appServiceId].pingenCount += (pinGenReqCount || 0);
            weeklydata[appServiceId].pingenCountSuccess += (pinGenSucCount || 0);
            weeklydata[appServiceId].pinverCount += (pinVerReqCount || 0);
            weeklydata[appServiceId].pinverCountSuccess += (pinVerSucCount || 0);
        }
    });

    console.log("Processed Daily Data:", weeklydata);
    return weeklydata;
};

export { preprocess };
