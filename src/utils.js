const Searching = (data, searchQuery, serviceIds) => {
    return serviceIds.filter(serviceId => {
        const { info } = data[serviceId];
        return (
            serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.territory.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.servicename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.service_partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            info.billername.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
};



export default Searching