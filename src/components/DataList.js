/* eslint-disable no-unused-vars */
// eslint-disable
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/dropdown.css';
import { useTable, useSortBy } from 'react-table';
import ApiRequest from '../APi';
import MultiSelectDropdown from './MultiSelect';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);

  const [showPopup, setShowPopup] = useState(false); // State for popup visibility

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


  //sortpgpvcount in ascending and descending order



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
    const partners = new Set(Object.values(data).map(item => item.info.partner));
    partners.add('all');
    return Array.from(partners);
  }, [data]);

  const uniqueBillerName = useMemo(() => {
    const billerName = new Set(Object.values(data).map(item => item.info.billername));
    billerName.add('all');
    return Array.from(billerName);
  }, [data]);

  const uniqueServicePartner = useMemo(() => {
    const servicePartner = new Set(Object.values(data).map(item => item.info.service_partner));
    servicePartner.add('all');
    return Array.from(servicePartner);
  }, [data]);

  const uniqueTerritory = useMemo(() => {
    const territorySet = new Set(Object.values(data).map(item => item.info.territory));
    territorySet.add('all'); // Add 'all' to the set
    return Array.from(territorySet); // Convert the set to an array
  }, [data]);


  const uniqueOperator = useMemo(() => {
    const operatorSet = new Set(Object.values(data).map(item => item.info.operator));
    operatorSet.add('all');
    return Array.from(operatorSet);
  }, [data]);

  const uniqueServiceName = useMemo(() => {
    const serviceName = new Set(Object.values(data).map(item => item.info.servicename));
    serviceName.add('all');
    return Array.from(serviceName);

  }, [data]);

  const filterData = useCallback((items, filter, field) => {
    if (filter === 'all') return items; // No filtering if 'all' is selected

    const filters = filter.split(',').filter(Boolean); // Split into array and remove empty strings

    return items.filter(item => {
      const fieldValue = data[item]?.info?.[field];
    
      return fieldValue && filters.includes(fieldValue);
    });
  }, [data]);
  ;


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
    const hourData = service.hours[hour] || {};

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
      const serviceA = data[a];
      const serviceB = data[b];

      // Retrieve hour data
      const hourDataA = serviceA?.hours[sortConfig.hour] || {};
      const hourDataB = serviceB?.hours[sortConfig.hour] || {};

      // Handle the scenario where both PG or PV counts are zero or the same
      const isZeroOrSameA = sortConfig.key === 'pg'
        ? hourDataA.pingenCount === 0 && hourDataA.pingenCountSuccess === 0
        : hourDataA.pinverCount === 0 && hourDataA.pinverCountSuccess === 0;

      const isZeroOrSameB = sortConfig.key === 'pg'
        ? hourDataB.pingenCount === 0 && hourDataB.pingenCountSuccess === 0
        : hourDataB.pinverCount === 0 && hourDataB.pinverCountSuccess === 0;

      if (isZeroOrSameA && !isZeroOrSameB) return -1;
      if (!isZeroOrSameA && isZeroOrSameB) return 1;

      // Calculate ratios for sorting based on the selected key (pg or pv)
      const ratioA = calculateRatio(a, sortConfig.hour, sortConfig.key);
      const ratioB = calculateRatio(b, sortConfig.hour, sortConfig.key);

      if (ratioA < ratioB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (ratioA > ratioB) return sortConfig.direction === 'asc' ? 1 : -1;

      return 0;
    });
  }, [serviceIds, sortConfig, calculateRatio, data]);


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

  const handleCheckboxChange = (field, value) => {
    switch (field) {
      case 'servicePartner':
        setServicePartnerFilter(value);
        break;
      case 'adPartner':
        setAdPartnerFilter(value);
        break;
      case 'territory':
        setTerritoryFilter(value);
        break;
      case 'operator':
        setOperatorFilter(value);
        break;
      case 'serviceName':
        setserviceNameFilter(value);
        break;
      case 'billerName':
        setBillerNameFilter(value);
        break;
      default:
        break;
    }
  };

  // Toggle popup visibility
  const handlePopupToggle = () => setShowPopup(prev => !prev);

  // Step 3: Pagination Controls
  const totalPages = Math.ceil(filteredServiceIds.length / itemsPerPage);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }
  //sortingpgpvcount in ascending and descending order
  const sortedServiceList = useMemo(() => {
    // Ensure sortConfig and serviceIds are defined
    if (!sortConfig.key) return serviceIds;

    // Copy the serviceIds to ensure immutability
    const orderedIds = [...serviceIds];

    return orderedIds.sort((a, b) => {
      const serviceA = data[a];
      const serviceB = data[b];

      // Sorting logic for Pg Count
      if (sortConfig.key === 'pgCount') {
        const countA = serviceA.pgCount || 0;
        const countB = serviceB.pgCount || 0;
        return sortConfig.direction === 'asc'
          ? countA - countB
          : countB - countA;
      }

      // Sorting logic for Pv Count
      if (sortConfig.key === 'pvCount') {
        const countA = serviceA.pvCount || 0;
        const countB = serviceB.pvCount || 0;
        return sortConfig.direction === 'asc'
          ? countA - countB
          : countB - countA;
      }

      // Default sorting logic for other columns
      const valueA = serviceA[sortConfig.key];
      const valueB = serviceB[sortConfig.key];

      return sortConfig.direction === 'asc'
        ? valueA < valueB
          ? -1
          : valueA > valueB
            ? 1
            : 0
        : valueA < valueB
          ? 1
          : valueA > valueB
            ? -1
            : 0;
    });
  }, [serviceIds, sortConfig, data]);

  const handleSort = (columnKey) => {
    setSortConfig((prevConfig) => ({
      key: columnKey,
      direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
const getCurrentHour = useCallback(() => new Date().getHours(), []);
  // Function to count active services
  const countActiveServices = useCallback(() => {
    const twoHoursAgo = (getCurrentHour() - 2 + 24) % 24;
    return filteredServiceIds.filter(id => {
      const service = data[id];
      if (!service) return false;
      for (let i = twoHoursAgo; i <= getCurrentHour(); i++) {
        if (service.hours[i] && (service.hours[i].pingenCount > 0 || service.hours[i].pinverCount > 0)) {
          return true;
        }
      }
      return false;
    }).length;
  }, [filteredServiceIds, data, getCurrentHour]);

  // Function to count services with no traffic in the last 2 hours
  const countNoTrafficServices = useCallback(() => {
    const twoHoursAgo = (getCurrentHour() - 2 + 24) % 24;
    return filteredServiceIds.filter(id => {
      const service = data[id];
      if (!service) return false;
      for (let i = twoHoursAgo; i <= getCurrentHour(); i++) {
        if (service.hours[i] && (service.hours[i].pingenCount > 0 || service.hours[i].pinverCount > 0) ) {
          return false;
        }
      }
      return true;
    }).length;
  }, [filteredServiceIds, data, getCurrentHour]);

  console.log('Total Services with no traffic:', countNoTrafficServices());
  const totalService=countActiveServices()+countNoTrafficServices();
  console.log('Total Services with traffic:', totalService);
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
          <div className='stats-data-item'>
                    <h3>All IDs</h3>
                    <p className='green'>{totalService}</p>
                  </div>
                  <div className='stats-data-item'>
                    <h3>Active IDs</h3>
                    <p className='green'>{countNoTrafficServices()}</p>
                  </div>
                  <div className='stats-data-item'>
                    <h3>No Traffic</h3>
                    <p className='red'>{countActiveServices|0}</p>
                  </div>
        <div className="filter-controls">
          <button onClick={handlePopupToggle}>Filters</button>
          {/* Popup for MultiSelectDropdown */}
          {showPopup && (
            <div className="popup">
              <MultiSelectDropdown
                options={{
                  adPartners: uniqueAdPartners,
                  billerName: uniqueBillerName,
                  servicePartner: uniqueServicePartner,
                  territory: uniqueTerritory,
                  operator: uniqueOperator,
                  serviceName: uniqueServiceName
                }}
                selectedFilters={{
                  adPartnerFilter,
                  billerNameFilter,
                  servicePartnerFilter,
                  territoryFilter,
                  operatorFilter,
                  serviceNameFilter
                }}
                onCheckboxChange={handleCheckboxChange}
              />
              <button onClick={handlePopupToggle}>Close</button>
            </div>
          )}



        </div>
      </div>
      <div className="table-container">
        <table className="table table-bordered">
          <thead>
            <tr>
              {/* add button for graph */}
              <th className="sticky_head-horizontal-1" rowSpan="2">
                <MultiSelectDropdown
                  id="territory-filter"
                  title="Territory"
                  options={uniqueTerritory}
                  selectedValue={territoryFilter}
                  setSelectedValue={setTerritoryFilter}
                />
              </th>
              <th className="sticky_head" rowSpan="2">
                <MultiSelectDropdown
                  id="operator-filter"
                  title="Operator"
                  options={uniqueOperator}
                  selectedValue={operatorFilter}
                  setSelectedValue={setOperatorFilter}
                />
              </th>
              <th className="sticky_head-horizontal-2" rowSpan="2">App_serviceid</th>
              <th className="sticky_head-horizontal-3" rowSpan="2">
                <MultiSelectDropdown

                  id="biller-name-filter"
                  title="Biller Name"
                  options={uniqueBillerName}
                  selectedValue={billerNameFilter}
                  setSelectedValue={setBillerNameFilter}
                />

              </th>
              <th className="sticky_head" rowSpan="2">
                <MultiSelectDropdown
                  id="service-name-filter"
                  title="Service Name"
                  options={uniqueServiceName}
                  selectedValue={serviceNameFilter}
                  setSelectedValue={setserviceNameFilter}
                />
              </th>
              <th className="sticky_head" rowSpan="2">
                <MultiSelectDropdown
                  id="ad-partner-filter"
                  title="Ad Partner"
                  options={uniqueAdPartners}
                  selectedValue={adPartnerFilter}
                  setSelectedValue={setAdPartnerFilter}
                />
              </th>
              <th className="sticky_head" rowSpan="2">

                <MultiSelectDropdown

                  id="service-partner-filter"
                  title="Service Partner"
                  options={uniqueServicePartner}
                  selectedValue={servicePartnerFilter}
                  setSelectedValue={setServicePartnerFilter}
                />


              </th>
              <th
                className="sticky_head-horizontal-4"
                rowSpan="2"
              >
                Pg Count
                <button
                  onClick={() => handleSort('pgCount', 'asc')}
                  className={`sort-button ${sortConfig.key === 'pgCount' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                  aria-label="Sort ascending"
                >
                  <i className="fas fa-sort-up"></i>
                </button>
                <button
                  onClick={() => handleSort('pgCount', 'desc')}
                  className={`sort-button ${sortConfig.key === 'pgCount' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                  aria-label="Sort descending"
                >
                  <i className="fas fa-sort-down"></i>
                </button>
              </th>
              <th
                className="sticky_head-horizontal-5"
                rowSpan="2"
              >
                Pv Count
                <button
                  onClick={() => handleSort('pvCount', 'asc')}
                  className={`sort-button ${sortConfig.key === 'pvCount' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                  aria-label="Sort ascending"
                >
                  <i className="fas fa-sort-up"></i>
                </button>
                <button
                  onClick={() => handleSort('pvCount', 'desc')}
                  className={`sort-button ${sortConfig.key === 'pvCount' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                  aria-label="Sort descending"
                >
                  <i className="fas fa-sort-down"></i>
                </button>
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
                  <th>
                    <span className="pg">PG</span>
                    <span className="pgs">PGS</span>
                    <div className="sort-buttons">
                      <button
                        onClick={() => requestSort(hour, 'pg', 'asc')}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pg' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                      >
                        <i className="fas fa-sort-up"></i>
                      </button>
                      <button
                        onClick={() => requestSort(hour, 'pg', 'desc')}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pg' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                      >
                        <i className="fas fa-sort-down"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <span className="pg">PV</span>
                    <span className="pgs">PVS</span>
                    <div className="sort-buttons">
                      <button
                        onClick={() => requestSort(hour, 'pv', 'asc')}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pv' && sortConfig.direction === 'asc' ? 'active' : 'asc'}`}
                      >
                        <i className="fas fa-sort-up"></i>
                      </button>
                      <button
                        onClick={() => requestSort(hour, 'pv', 'desc')}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pv' && sortConfig.direction === 'desc' ? 'active' : 'desc'}`}
                      >
                        <i className="fas fa-sort-down"></i>
                      </button>
                    </div>
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(serviceId => {
                const { info, hours: serviceHours } = data[serviceId] || {};

                return (
                  <tr key={serviceId}>
                    <td className="sticky-1">{info?.territory || '-'}</td>
                    <td>{info?.operator || '-'}</td>
                    <td className="service-id-cell">
                      {serviceId}
                      <Link to={`/graph/${serviceId}`} className="hover-button">
                        <i className="fas fa-chart-line"></i> {/* Font Awesome icon */}
                      </Link>
                    </td>
                    <td className="sticky-3">{info?.billername || '-'}</td>
                    <td>{info?.servicename || '-'}</td>
                    <td>{info?.partner || '-'}</td>
                    <td>{info?.service_partner || '-'}</td>
                    <td className="sticky-4">
                      {getPGPVCount(serviceId, getCutrrentHour, 'pg')}
                    </td>
                    <td className="sticky-5">
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
                            <span className="pgs">{hourData.pingenCountSuccess}</span>
                          </td>
                          <td
                            className={`text-center ${getColorClass(
                              hourData.pinverCountSuccess,
                              hourData.pinverCount
                            )}`}
                          >
                            <span className="pg">{hourData.pinverCount}</span>
                            <span className="pgs">{hourData.pinverCountSuccess}</span>
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
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className='pagination-controls'>
          {/* Hide the Previous button if on the first page */}
          {currentPage > 1 && (
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <i className="fas fa-arrow-left"></i> {/* Change to desired icon */}

            </button>
          )}

          {/* Display page numbers */}
          <span className='page-numbers'>
            {/* Show the first page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  1
                </button>
                {currentPage > 4 && <span>...</span>}
              </>
            )}

            {/* Show up to 2 pages before the current page */}
            {Array.from({ length: 2 }, (_, index) => {
              const pageNumber = currentPage - 2 + index;
              return pageNumber > 1 && pageNumber < currentPage ? (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={currentPage === pageNumber ? 'active' : ''}
                >
                  {pageNumber}
                </button>
              ) : null;
            })}

            {/* Show the current page */}
            <button disabled className='active'>
              {currentPage}
            </button>

            {/* Show up to 2 pages after the current page */}
            {Array.from({ length: 2 }, (_, index) => {
              const pageNumber = currentPage + 1 + index;
              return pageNumber < totalPages ? (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={currentPage === pageNumber ? 'active' : ''}
                >
                  {pageNumber}
                </button>
              ) : null;
            })}

            {/* Show the last page */}
            {currentPage < totalPages - 3 && (
              <>
                {currentPage < totalPages - 4 && <span>...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  {totalPages}
                </button>
              </>
            )}
          </span>

          {/* Hide the Next button if on the last page */}
          {currentPage < totalPages && (
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <i className="fas fa-arrow-right"></i> {/* Change to desired icon */}
            </button>
          )}
        </div>

      </div>
    </div>


  );
};

export default DataList;