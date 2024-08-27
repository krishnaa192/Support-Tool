/* eslint-disable no-unused-vars */
// eslint-disable
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css';
import { FixedSizeList as List } from 'react-window';

import ApiRequest from '../APi';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);


  const [sortConfig, setSortConfig] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [servicePartnerFilter, setServicePartnerFilter] = useState('all');
  const [adPartnerFilter, setAdPartnerFilter] = useState('All Partners');

  useEffect(() => {
    const fetchData = async () => {
        const result = await ApiRequest();
        console.log("All Data", result);
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
        const currentHour = new Date().getHours();  
       const hourData = Array.from({ length: currentHour + 1 }, (_, index) => (currentHour - index + 24) % 24);
      
        setData(processedData);
        setServiceIds(Object.keys(processedData));
        setHours(hourData);
      }
    fetchData();
  }, []); // Fetch data only once

  const filterServiceProviders = useCallback((serviceProviders, filter) => {
    if (filter === 'all') return serviceProviders;
    return serviceProviders.filter(serviceProvider => {
      const partner = data[serviceProvider]?.info?.service_partner;
      if (!partner) return false;

      if (filter === 'Globocom') return partner === 'globocom';
      if (filter === 'Tiara') return partner === 'TIARA';
      if (filter === 'Novustech') return partner === 'Novustech';
      if (filter === 'Reseller') return !['globocom', 'TIARA', 'Novustech'].includes(partner);
      return false;
    });
  }, [data]);

  const adpartner = useCallback((partners, filter) => {
    if (filter === 'All Partners') return partners;
    return partners.filter(partner => {
      const partnerInfo = data[partner]?.info?.partner;
      if (!partnerInfo) return false;
      if (filter === 'InHouseGoogle') return partnerInfo === 'InHouseGoogle';
      if (filter === 'NewJGoogle') return partnerInfo === 'NewJGoogle' || partnerInfo === 'NewJGoogle-New';
      return false;
    });
  }, [data]);

  const getColorClass = (successCount, totalCount) => {
    const ratio = totalCount === 0 ? 0 : successCount / totalCount;
    if (ratio <= 0.25) return 'red';
    if (ratio > 0.25 && ratio < 0.4) return 'light-orange';
    if (ratio >= 0.4 && ratio <= 0.6) return 'orange';
    if (ratio > 0.6 && ratio <= 0.8) return 'light-green';
    if (ratio > 0.8) return 'dark-green';
    return '';
  };
  const calculateRatio = useCallback((id, hour, type) => {
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
  }, [data]);

  const requestSort = (hour, key) => {
    setSortConfig(prevConfig => {
      const direction = (
        prevConfig.hour === hour &&
        prevConfig.key === key &&
        prevConfig.direction === 'asc'
      ) ? 'desc' : 'asc';
      return { hour, key, direction };
    });
  };
  const sortedServiceIds = useMemo(() => {
    if (!sortConfig.key) return serviceIds;
    return [...serviceIds].sort((a, b) => {
      const ratioA = calculateRatio(a, sortConfig.hour, sortConfig.key);
      const ratioB = calculateRatio(b, sortConfig.hour, sortConfig.key);
      if (ratioA < ratioB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (ratioA > ratioB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [serviceIds, sortConfig, calculateRatio]);

  const filteredServiceIds = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filteredByQuery = sortedServiceIds.filter(serviceId => {
      const { info } = data[serviceId] || {};
      return (
        serviceId.toLowerCase().includes(query) ||
        (info?.territory || '').toLowerCase().includes(query) ||
        (info?.servicename || '').toLowerCase().includes(query) ||
        (info?.operator || '').toLowerCase().includes(query) ||
        (info?.partner || '').toLowerCase().includes(query) ||
        (info?.billername || '').toLowerCase().includes(query)||
        (info?.service_partner || '').toLowerCase().includes(query)
      );
    });

    const filteredByServicePartner = filterServiceProviders(filteredByQuery, servicePartnerFilter);
    return adpartner(filteredByServicePartner, adPartnerFilter);
  }, [sortedServiceIds, searchQuery, servicePartnerFilter, adPartnerFilter, data, filterServiceProviders, adpartner]);


  return (
    <div className="custom-search-col">
    <div className="control">
    <div className="filter-controls">
          <select
            id="service-partner-filter"
            value={servicePartnerFilter}
            onChange={e => setServicePartnerFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Globocom">Globocom</option>
            <option value="Tiara">Tiara</option>
            <option value="Novustech">Novustech</option>
            <option value="Reseller">Reseller</option>
          </select>
          <select
          id="ad-partner-filter"
          value={adPartnerFilter}
          onChange={e => setAdPartnerFilter(e.target.value)}
          className="ad-partner-filter"
        >
          <option value="All Partners">All Partners</option>
          <option value="InHouseGoogle">InHouseGoogle</option>
          <option value="NewJGoogle">NewJGoogle</option>
        </select>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="table-container">
      <table className="table table-bordered">
        <thead>
          <tr>
            {/* add button for graph */}
            <th className="sticky_head-horizontal-1" rowSpan="2">Territory</th>
            <th className="sticky_head" rowSpan="2">Operator</th>
            <th className="sticky_head-horizontal-2" rowSpan="2">App_serviceid</th>
            <th className="sticky_head-horizontal-3" rowSpan="2">Biller</th>
            <th className="sticky_head" rowSpan="2">Servicename</th>
            <th className="sticky_head" rowSpan="2">Partner</th>
            <th className="sticky_head" rowSpan="2">Service_partner</th>
            {hours.map((hour, index) => (
              <th className="sticky_head" key={index} colSpan="2">
                {hour >= 0 && hour < 12
                  ? `${hour % 12 === 0 ? 12 : hour % 12} AM - ${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} AM`
                  : `${hour % 12 === 0 ? 12 : hour % 12} PM - ${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12} PM`}
              </th>
            ))}
          </tr>
          <tr className="hrs">
            {hours.map((hour, index) => (
              <React.Fragment key={index}>
                <th onClick={() => requestSort(hour, 'pg')}>
                  <span className="pg">PG</span>
                  <span className="pgs">PGS</span>
                </th>
                <th onClick={() => requestSort(hour, 'pv')}>
                  <span className="pg">PV</span>
                  <span className="pgs">PVS</span>
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
                <tr key={serviceId} >
                  <td className='sticky-1'>{info?.territory || '-'}</td>
                  <td>{info?.operator || '-'}</td>
                  <td className="service-id-cell">
                    {serviceId}
                    <Link to={`/graph/${serviceId}`} className="hover-button">
                      <i className="fas fa-chart-line"></i> {/* Font Awesome icon */}
                    </Link>
                  </td>
                  <td className='sticky-3'>{info?.billername || '-'}</td>
                  <td>{info?.servicename || '-'}</td>
                  <td>{info?.partner || '-'}</td>
                  <td>{info?.service_partner || '-'}</td>
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
                          <span className="pg">{hourData.pingenCount}</span>
                          <span className="pgs">
                            {hourData.pingenCountSuccess}
                          </span>
                        </td>
                        <td
                          className={`text-center ${getColorClass(
                            hourData.pinverCountSuccess,
                            hourData.pinverCount
                          )}`}
                        >
                          <span className="pg">{hourData.pinverCount}</span>
                          <span className="pgs">
                            {hourData.pinverCountSuccess}
                          </span>
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
                No data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  

);
};

export default DataList;
