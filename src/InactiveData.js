import React, { useState, useEffect } from 'react';
import ApiRequest from './APi';  // Make sure this path is correct
import Searching from './utils';




const InactiveData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState([]);
  const [serviceIds, setServiceIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc', hour: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [inactiveServices, setInactiveServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiRequest();  // Fetch the data
        console.log("API Result:", result);

        const inactiveData = {};
        result.forEach(item => {
          const {
            app_serviceid,
            territory,
            servicename,
            operator,
            billername,
            service_partner,
            partner,
            time,
            pingenCount,
            pingenCountSuccess,
            pinverCount,
            pinverCountSuccess,
          } = item;

          if (!inactiveData[app_serviceid]) {
            inactiveData[app_serviceid] = {
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
          inactiveData[app_serviceid].hours[hour] = {
            pingenCount: pingenCount || 0,
            pingenCountSuccess: pingenCountSuccess || 0,
            pinverCount: pinverCount || 0,
            pinverCountSuccess: pinverCountSuccess || 0,
          };
        });

        const currentHour = new Date().getHours();
        const lastThreeHours = [
          (currentHour - 2 + 24) % 24,
          (currentHour - 1 + 24) % 24,
          currentHour
        ].reverse();

        const newInactiveServices = Object.keys(inactiveData).filter(serviceId => {
          const hourData0 = inactiveData[serviceId].hours[(currentHour - 0 + 24) % 24];
          
          return (
            hourData0.pingenCount === 0 && hourData0.pinverCount === 0
          );
        }).map(serviceId => ({
          serviceId,
          ...inactiveData[serviceId]
        }));

        setData(inactiveData);
        setInactiveServices(newInactiveServices);
        setServiceIds(Object.keys(inactiveData));
        setHours(lastThreeHours);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);
  const getColorClass = (successCount, totalCount) => {
    const ratio = totalCount === 0 ? 0 : successCount / totalCount;
    if (ratio < 0.25) return 'red';
    if (ratio >= 0.4 && ratio <= 0.6) return 'orange';
    if (ratio > 0.6 && ratio <= 0.8) return 'light-green';
    return 'dark-green';
  };
  if (!data) {
    return <div>Loading...</div>;
  }

  const calculateRatio = (id, hour, type) => {
    const service = data[id];
    if (!service) return 0;
    const hourData = service.hours[hour];
    if (!hourData) return 0;

    if (type === 'pg') {
      return hourData.pingenCount === 0 ? 0 : hourData.pingenCountSuccess / hourData.pingenCount;
    } else if (type === 'pv') {
      return hourData.pinverCount === 0 ? 0 : hourData.pinverCountSuccess / hourData.pinverCount;
    }
    return 0;
  };

  const sortByRatio = (id, hour, type) => {
    return calculateRatio(id, hour, type);
  };

  const requestSort = (hour, key) => {
    let direction = 'asc';
    if (sortConfig.hour === hour && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ hour, key, direction });
  };

  const sortedServiceIds = [...serviceIds].sort((a, b) => {
    const ratioA = sortByRatio(a, sortConfig.hour, sortConfig.key);
    const ratioB = sortByRatio(b, sortConfig.hour, sortConfig.key);

    if (ratioA < ratioB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (ratioA > ratioB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredServiceIds = sortedServiceIds.filter(serviceId => {
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
 
  return (
    
    <div className='table-container'>
      <div className="custom-search-col">
                <div className="control">
                  <div className='head'>
                    <h3 >Less Traffic Data </h3>
                  </div>
                  <input
                    className="search"
                    placeholder="Search"
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="sticky_head" rowSpan="2">Territory</th>
            <th className="sticky_head" rowSpan="2">Operator</th>
            <th className="sticky_head" rowSpan="2">App_serviceid</th>
            <th className="sticky_head" rowSpan="2">Biller</th>
            <th className="sticky_head" rowSpan="2">Servicename</th>
            <th className="sticky_head" rowSpan="2">Partner</th>
            <th className="sticky_head" rowSpan="2">Service_partner</th>
            {hours.map((hour, index) => (
              <th className='sticky_head' key={index} colSpan="2">
                {hour >= 0 && hour < 12 ? `${hour % 12 === 0 ? 12 : hour % 12} AM - ${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} AM` : `${hour % 12 === 0 ? 12 : hour % 12} PM - ${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} PM`}
              </th>
            ))}
          </tr>
          <tr className='hrs'>
            {hours.map((hour, index) => (
              <React.Fragment key={index}>
                <th>
                  <span className='pg'>PG</span>
                  <span className='pgs'>PGS</span>
                </th>
                <th>
                  <span className='pg'>PV</span>
                  <span className='pgs'>PVS</span>
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {inactiveServices.map(service => {
            const { info, hours: serviceHours } = service;
            return (
              <tr key={service.serviceId} className='rows'>
                <td>{info.territory}</td>
                <td>{info.operator}</td>
                <td>{service.serviceId}</td>
                <td>{info.billername}</td>
                <td>{info.servicename}</td>
                <td>{info.partner}</td>
                <td>{info.service_partner}</td>
                {hours.map(hour => {
                  const hourData = serviceHours[hour] || {};
                  return (
                    <React.Fragment key={hour}>
                      <td className={`text-center ${getColorClass(hourData.pingenCountSuccess, hourData.pingenCount)}`}>
                        <span className='pg'>{hourData.pingenCount}</span>
                        <span className='pgs'>{hourData.pingenCountSuccess}</span>
                      </td>
                      <td className={`text-center ${getColorClass(hourData.pinverCountSuccess, hourData.pinverCount)}`}>
                        <span className='pg'>{hourData.pinverCount}</span>
                        <span className='pgs'>{hourData.pinverCountSuccess}</span>
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InactiveData;
