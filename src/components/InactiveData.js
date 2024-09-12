/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ApiRequest from '../APi'; // Ensure this path is correct
import '../css/style.css';

const InactiveData = () => {
  const [data, setData] = useState(null);
  const [hours, setHours] = useState([]);
  const [serviceIds, setServiceIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc', hour: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [inactiveServices, setInactiveServices] = useState([]);
  const [servicePartnerFilter, setServicePartnerFilter] = useState('all');

  const fetchData = useCallback(async () => {
   
      const result = await ApiRequest();
      console.log("API Result_inactive:", result);

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
      const hourData = Array.from({ length: 24 }, (_, index) => (currentHour - index + 24) % 24);

      const newInactiveServices = Object.keys(inactiveData).filter(serviceId => {
        const hourData0 = inactiveData[serviceId].hours[(currentHour - 0 + 24) % 24];
        const hourData1 = inactiveData[serviceId].hours[(currentHour - 1 + 24) % 24];

        return (
          hourData0.pingenCount === 0 && hourData0.pinverCount === 0 &&
          hourData1.pingenCount === 0 && hourData1.pinverCount === 0
        );
      }).map(serviceId => ({
        serviceId,
        ...inactiveData[serviceId]
      }));

      setData(inactiveData);
      setInactiveServices(newInactiveServices);
      setServiceIds(Object.keys(inactiveData));
      setHours(hourData);
    } 
  , []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterServiceProviders = useCallback((serviceProviders, filter) => {
    if (filter === 'all') return serviceProviders;
    return serviceProviders.filter(serviceProvider => {
      const partner = data[serviceProvider]?.info?.service_partner?.toLowerCase();
      if (!partner) return false;
      const filterLower = filter.toLowerCase();
      if (filterLower === 'reseller') return !['globocom', 'tiara', 'novustech'].includes(partner);
      return partner === filterLower;
    });
  }, [data]);

  const getColorClass = (successCount, totalCount) => {
    const ratio = totalCount === 0 ? 0 : successCount / totalCount;
    if(totalCount === 0 && successCount === 0) return 'grey';
    if (ratio < 0.25) return 'red';
    if (ratio >= 0.4 && ratio <= 0.6) return 'orange';
    if (ratio > 0.6 && ratio <= 0.8) return 'light-green';
    return 'dark-green';
  };

  const requestSort = (hour, key) => {
    setSortConfig(prevConfig => ({
      key,
      hour,
      direction: prevConfig.hour === hour && prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedServiceIds = useMemo(() => {
    const calculateRatio = (id, hour, type) => {
      const service = data[id];
      if (!service) return 0;
      const hourData = service.hours[hour];
      if (!hourData) return 0;
      return type === 'pg'
        ? (hourData.pingenCount === 0 ? 0 : hourData.pingenCountSuccess / hourData.pingenCount)
        : (hourData.pinverCount === 0 ? 0 : hourData.pinverCountSuccess / hourData.pinverCount);
    };
  
    const sortByRatio = (id, hour, type) => calculateRatio(id, hour, type);
    if (!sortConfig.key || !data) return inactiveServices.map(service => service.serviceId);
    return inactiveServices.map(service => service.serviceId).sort((a, b) => {
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
  }, [inactiveServices, sortConfig, data]);

  const filteredServiceIds = useMemo(() => {
    
    const lowerSearchQuery = searchQuery.toLowerCase();
    const filteredByQuery = sortedServiceIds.filter(serviceId => {
      const { info } = data[serviceId] || {};
      return (
        serviceId.toLowerCase().includes(lowerSearchQuery) ||
        (info?.territory || '').toLowerCase().includes(lowerSearchQuery) ||
        (info?.servicename || '').toLowerCase().includes(lowerSearchQuery) ||
        (info?.operator || '').toLowerCase().includes(lowerSearchQuery) ||
        (info?.partner || '').toLowerCase().includes(lowerSearchQuery) ||
        (info?.service_partner || '').toLowerCase().includes(lowerSearchQuery) ||
        (info?.billername || '').toLowerCase().includes(lowerSearchQuery)
      );
    });
    return filterServiceProviders(filteredByQuery, servicePartnerFilter);
  }, [searchQuery, sortedServiceIds, data, servicePartnerFilter, filterServiceProviders]);


  return (
    <div className='table-container'>
      <div className="custom-search-col">
        <div className="control">
          <div className="filter-controls">
          </div>
          <div className="filters">
          <form>
            <input type="search" value={searchQuery} placeholder='Search..'
              onChange={e => setSearchQuery(e.target.value)} autofocus required>
            </input>
            <i class="fa fa-search ">

            </i>
          </form>
          </div>
        </div>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="sticky_head-horizontal-1" rowSpan="2">Territory</th>
            <th className="sticky_head" rowSpan="2">Operator</th>
            <th className="sticky_head-horizontal-2" rowSpan="2">App_serviceid</th>
            <th className="sticky_head-horizontal-3" rowSpan="2">Biller</th>
            <th className="sticky_head" rowSpan="2">Servicename</th>
            <th className="sticky_head" rowSpan="2">Partner</th>
            <th className="sticky_head-horizontal-4" rowSpan="2">Service_partner</th>
            <th className='sticky_head_horizontal-6' rowSpan={2}>
                  Action
                </th>
            {hours.map((hour, index) => (
              <th className='sticky_head' key={index} colSpan="2">
                {hour >= 0 && hour < 12 ? `${hour % 12 === 0 ? 12 : hour % 12} AM - ${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} AM` : `${hour % 12 === 0 ? 12 : hour % 12} PM - ${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} PM`}
              </th>
              
            ))}
            

          </tr>
          <tr className='hrs'>
            {hours.map((hour, index) => (
              <React.Fragment key={index}>
                <th onClick={() => requestSort(hour, 'pg')}>
                  <span className='pg'>PG</span>
                  <span className='pgs'>PGS</span>
                </th>
                <th onClick={() => requestSort(hour, 'pv')}>
                  <span className='pg'>PV</span>
                  <span className='pgs'>PVS</span>
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredServiceIds.length > 0 ? (
            filteredServiceIds.map(serviceId => {
              const { info, hours: serviceHours } = data[serviceId] || {};

              return (
                <tr key={serviceId}>
                  <td className='sticky-1'>{info?.territory || '-'}</td>
                  <td>{info?.operator || '-'}</td>
                  <td className="service-id-cell">
                    {serviceId}
                   
                  </td>
                  <td className='sticky-3'>{info?.billername || '-'}</td>
                  <td>{info?.servicename || '-'}</td>
                  <td>{info?.partner || '-'}</td>
                  <td className='sticky-4'>{info?.service_partner || '-'}</td>
        
                      <td className='sticky-7'>
                            <a href={`/graph/${serviceId}`} target="_blank" rel="noopener noreferrer" className='model'>
                              <i className="fa-solid fa-chart-line"></i>
                           
                            </a>
                            </td>
                        
                  {hours.map((hour, index) => {
                    const hourData = serviceHours[hour] || {};
                    return (
                      <React.Fragment key={index}>
                        <td
                          className={`text-center ${getColorClass(
                            hourData.pingenCountSuccess,
                            hourData.pingenCount
                          )}`}
                        >
                        <div className={`pg ${hourData.pingenCount === 0 && hourData.pingenCountSuccess === 0 ? 'grey-bg' : ''}`}>
                                {hourData.pingenCount === 0 && hourData.pingenCountSuccess === 0 ? <div className='blank'>-</div> : hourData.pingenCount}
                              </div>
                              <div className={`pgs ${hourData.pingenCount === 0 && hourData.pingenCountSuccess === 0 ? 'grey-bg' : ''}`}>
                                {hourData.pingenCount === 0 && hourData.pingenCountSuccess === 0 ? '-' : hourData.pingenCountSuccess}
                              </div>
                        </td>
                        <td
                          className={`text-center ${getColorClass(
                            hourData.pinverCountSuccess,
                            hourData.pinverCount
                          )}`}
                        >
                          <div className={`pg ${hourData.pinverCount === 0 && hourData.pinverCountSuccess === 0 ? 'grey-bg' : ''}`}>
                                {hourData.pinverCount === 0 && hourData.pinverCountSuccess === 0 ? <div className='blank'>-</div> : hourData.pinverCount}
                              </div>
                              <div className={`pgs ${hourData.pinverCount === 0 && hourData.pinverCountSuccess === 0 ? 'grey-bg' : ''}`}>
                                {hourData.pinverCount === 0 && hourData.pinverCountSuccess === 0 ? '-' : hourData.pinverCountSuccess}
                              </div>

                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7 + hours.length * 2} className="text-center">
                No data matches your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InactiveData;
