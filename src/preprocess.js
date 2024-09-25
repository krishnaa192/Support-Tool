const preprocess = (data) => {
    const weeklyData = {};
    const currentDate = new Date();
    const currentHour = currentDate.getHours(); // Get current hour

    if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        return [];
    }

    data.forEach(item => {
        const {
            appServiceId,
            territory,
            serviceName,
            operatorname,
            operatorid,
            partnerName,
            biller,
            service_owner,
            hrs,
            pinGenReqCount,
            pinGenSucCount,
            pinVerSucCount,
            pinVerReqCount,
            timestamp
        } = item;

        const hour = parseInt(hrs, 10); // Ensure hour is a number

        // Ensure the appServiceId entry exists
        if (!weeklyData[appServiceId]) {
            weeklyData[appServiceId] = {
                info: {
                    appServiceId,
                    territory: territory || '',
                    servicename: serviceName || '',
                    operator: operatorname || '',
                    partner: partnerName || '',
                    billername: biller || '',
                    operatorid: operatorid || '',
                    service_partner: service_owner || '',
                    Datadate: new Date(timestamp).toDateString(), // Store only the date part
                },
                dailyCounts: {} // Initialize dailyCounts as an object to hold daily entries
            };
        }

        // Get the date of the entry
        const entryDate = new Date(timestamp).toDateString(); // Extract only the date part
        const isToday = currentDate.toDateString() === entryDate;

        // Only sum the data for hours before the current hour if it is today's data
        if (!isToday || hour < currentHour) {
            // If the entry for that date does not exist, create it
            if (!weeklyData[appServiceId].dailyCounts[entryDate]) {
                weeklyData[appServiceId].dailyCounts[entryDate] = {
                    entryDate,
                    pinGenReqCount: 0,
                    pinGenSucCount: 0,
                    pinVerReqCount: 0,
                    pinVerSucCount: 0
                };
            }

            // Update the counts for that specific date
            weeklyData[appServiceId].dailyCounts[entryDate].pinGenReqCount += (pinGenReqCount || 0);
            weeklyData[appServiceId].dailyCounts[entryDate].pinGenSucCount += (pinGenSucCount || 0);
            weeklyData[appServiceId].dailyCounts[entryDate].pinVerReqCount += (pinVerReqCount || 0);
            weeklyData[appServiceId].dailyCounts[entryDate].pinVerSucCount += (pinVerSucCount || 0);
        }
    });


    // Convert the object to an array before returning
    return Object.values(weeklyData).map(appData => ({
        ...appData,
        dailyCounts: Object.values(appData.dailyCounts) // Convert dailyCounts object to array
    }));
};

export { preprocess };
