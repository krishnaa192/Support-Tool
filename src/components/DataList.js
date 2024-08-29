/* eslint-disable no-unused-vars */
// eslint-disable
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/dropdown.css';

import ApiRequest from '../APi';
import MultiSelectDropdown from './MultiSelect';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);


  const [sortConfig, setSortConfig] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [servicePartnerFilter, setServicePartnerFilter] = useState('all');
  const [adPartnerFilter, setAdPartnerFilter] = useState('all');
  const [territoryFilter, setTerritoryFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [serviceNameFilter, setserviceNameFilter] = useState('all')
  const [billerNameFilter, setBillerNameFilter] = useState('all');


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;




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
  




  const getPGPVCount = useCallback((id, hour, type) => {
    let pgCount = 0;
    let pvCount = 0;
    const service = data[id];

    if (!service) return 0;

    for (let i = 0; i <= hour; i++) {
      const hourData = service.hours[i];
      if (!hourData) continue;

      pgCount += hourData.pingenCount;
      pvCount += hourData.pinverCount;
    }

    if (type === 'pg') {
      return pgCount;
    } else if (type === 'pv') {
      return pvCount;
    }

    return 0; // Default case if type doesn't match
  }, [data]);
  const getCutrrentHour = new Date().getHours();

  const uniqueAdPartners = useMemo(() => {
    const partners = Object.values(data).map(item => item.info.partner);
    return ['all', ...new Set(partners)];
  }, [data]);

  const uniqueBillerName = useMemo(() => {
    const billerName = Object.values(data).map(item => item.info.billername);
    return ['all', ...new Set(billerName)];
  }, [data]);

  const uniqueServicePartner = useMemo(() => {
    const servicePartner = Object.values(data).map(item => item.info.service_partner);
    return ['all', ...new Set(servicePartner)];
  }, [data]);

  const uniqueTerritory = useMemo(() => {
    const territory = Object.values(data).map(item => item.info.territory);
    return ['all', ...new Set(territory)];
  }, [data]);

  const uniqueOperator = useMemo(() => {
    const operator = Object.values(data).map(item => item.info.operator);
    return ['all', ...new Set(operator)];
  }, [data]);

  const uniqueServiceName = useMemo(() => {
    const serviceName = Object.values(data).map(item => item.info.servicename);
    return ['all', ...new Set(serviceName)];
  }, [data]);

  const filterData = useCallback((items, filter, field) => {
    if (filter === 'all') return items;
    return items.filter(item => {
      const fieldValue = data[item]?.info?.[field];
      return fieldValue && fieldValue === filter;
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

    // Step 1: Filter by search query
    const filteredByQuery = sortedServiceIds.filter(serviceId => {
      const { info } = data[serviceId] || {};
      return (
        serviceId.toLowerCase().includes(query) ||
        (info?.territory || '').toLowerCase().includes(query) ||
        (info?.servicename || '').toLowerCase().includes(query) ||
        (info?.operator || '').toLowerCase().includes(query) ||
        (info?.partner || '').toLowerCase().includes(query) ||
        (info?.billername || '').toLowerCase().includes(query) ||
        (info?.service_partner || '').toLowerCase().includes(query)
      );
    });
   
    const filteredByServicePartner = filterData(filteredByQuery, servicePartnerFilter, 'service_partner');
    const territoryByFilter = filterData(filteredByServicePartner, territoryFilter, 'territory');
    const operatorByFilter = filterData(territoryByFilter, operatorFilter, 'operator');
    const serviceNameByFilter = filterData(operatorByFilter, serviceNameFilter, 'servicename');
    const billerNameByFilter = filterData(serviceNameByFilter, billerNameFilter, 'billername');
    const partnerByFilter = filterData(billerNameByFilter, adPartnerFilter, 'partner');

    return partnerByFilter;
  }, [sortedServiceIds, searchQuery, servicePartnerFilter, territoryFilter, operatorFilter, serviceNameFilter, billerNameFilter, adPartnerFilter, data, filterData]);

 

  // Step 3: Pagination Controls
  const totalPages = Math.ceil(filteredServiceIds.length / itemsPerPage);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServiceIds.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="custom-search-col">
      <div className="control">
        <div className="filter-controls">
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
              <th className="sticky_head" rowSpan="2">
                <MultiSelectDropdown
                  id="territory-filter"
                  title="Territory"
                  options={uniqueTerritory}
                  selectedValue={territoryFilter}
                  setSelectedValue={setTerritoryFilter}
                />
              </th>
              <th className="sticky_head" rowSpan="2">
                <select
                  id="operator-filter"
                  value={operatorFilter}
                  onChange={e => setOperatorFilter(e.target.value)}>
                  {uniqueOperator.map((operator, index) => (
                    <option key={index} value={operator}>
                      {operator}
                    </option>
                  ))}
                </select>
              </th>
              <th className="sticky_head-horizontal-2" rowSpan="2">App_serviceid</th>
              <th className="sticky_head-horizontal-3" rowSpan="2">
                <select
                  id="biller-name-filter"
                  value={billerNameFilter}
                  onChange={e => setBillerNameFilter(e.target.value)}>
                  {uniqueBillerName.map((billerName, index) => (
                    <option key={index} value={billerName}>
                      {billerName}
                    </option>
                  ))}
                </select>
              </th>
              <th className="sticky_head" rowSpan="2">
                <select
                  id="service-name-filter"
                  value={serviceNameFilter}
                  onChange={e => setserviceNameFilter(e.target.value)}>
                  {uniqueServiceName.map((serviceName, index) => (
                    <option key={index} value={serviceName}>
                      {serviceName}
                    </option>
                  ))}
                </select>
              </th>
              <th className="sticky_head" rowSpan="2">
                <select
                  id="ad-partner-filter"
                  value={adPartnerFilter}
                  onChange={e => setAdPartnerFilter(e.target.value)}
                  className="ad-partner-filter">
                  {uniqueAdPartners.map((partner, index) => (
                    <option key={index} value={partner}>
                      {partner}
                    </option>
                  ))}
                </select>
              </th>
              <th className="sticky_head" rowSpan="2">    <select
                id="service-partner-filter"
                value={servicePartnerFilter}
                onChange={e => setServicePartnerFilter(e.target.value)}>
                {uniqueServicePartner.map((partner, index) => (
                  <option key={index} value={partner}>
                    {partner}
                  </option>
                ))}

              </select></th>
              <th className="sticky_head-horizontal-4" rowSpan="2">

                Pg Count
              </th>
              <th className="sticky_head-horizontal-5" rowSpan="2">
                Pv Count
              </th>
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
                    <td className='sticky-4'>

                      {getPGPVCount(serviceId, getCutrrentHour, 'pg')}
                    </td>
                    <td className='sticky-5'>
                      {getPGPVCount(serviceId, getCutrrentHour, 'pv')}
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
        <div className='pagination-controls'>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
      </div>
    </div>


  );
};

export default DataList;
