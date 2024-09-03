/* eslint-disable no-unused-vars */
// eslint-disable
import React, { useEffect, useState, useCallback, useMemo,useRef } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/dropdown.css';
import Modal from './Model';
import ApiRequest from '../APi';
import MultiSelectDropdown from './MultiSelect';
import GraphData from '../Page/GraphData';



const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [sortType, setSortType] = useState('');
  const [sortConfig, setSortConfig] = useState({});
  const [numSort, setNumSort] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [servicePartnerFilter, setServicePartnerFilter] = useState('all');
  const [adPartnerFilter, setAdPartnerFilter] = useState('all');
  const [territoryFilter, setTerritoryFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [serviceNameFilter, setserviceNameFilter] = useState('all')
  const [billerNameFilter, setBillerNameFilter] = useState('all');


const serviceId = useRef(null);


  useEffect(() => {
    const fetchData = async () => {

      const result = await ApiRequest();
      if (!result) return "There is problem in fetching data";

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

    return 0;
  }, [data]);
  const getCutrrentHour = new Date().getHours();

  const uniqueAdPartners = useMemo(() => {
    const partners = new Set(Object.values(data).map(item => item.info.partner));
    return Array.from(partners);
  }, [data]);

  const uniqueBillerName = useMemo(() => {
    const billerName = new Set(Object.values(data).map(item => item.info.billername));
    return Array.from(billerName);
  }, [data]);

  const uniqueServicePartner = useMemo(() => {
    const servicePartner = new Set(Object.values(data).map(item => item.info.service_partner));
    return Array.from(servicePartner);
  }, [data]);

  const uniqueTerritory = useMemo(() => {
    const territorySet = new Set(Object.values(data).map(item => item.info.territory));
    return Array.from(territorySet); // Convert the set to an array
  }, [data]);


  const uniqueOperator = useMemo(() => {
    const operatorSet = new Set(Object.values(data).map(item => item.info.operator));
    return Array.from(operatorSet);
  }, [data]);

  const uniqueServiceName = useMemo(() => {
    const serviceName = new Set(Object.values(data).map(item => item.info.servicename));
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
    if (ratio > 0.25 && ratio < 0.4) return 'orange';
    if (ratio >= 0.4 && ratio <= 0.6) return 'orange';
    if (ratio > 0.6 && ratio <= 0.8) return 'green';
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



  const sortedServiceIds = useMemo(() => {
    if (!sortType && !numSort.key && !sortConfig.key) return serviceIds; // Default to original order

    return [...serviceIds].sort((a, b) => {
      const serviceA = data[a];
      const serviceB = data[b];
      const currentHour = new Date().getHours();

      if (sortType === 'numSort') {
        if (numSort.key) {
          if (numSort.key === 'id') {
            // Handle 3-digit IDs separately
            const isThreeDigitA = a.length === 3;
            const isThreeDigitB = b.length === 3;

            if (isThreeDigitA && !isThreeDigitB) return numSort.direction === 'asc' ? -1 : 1;
            if (!isThreeDigitA && isThreeDigitB) return numSort.direction === 'asc' ? 1 : -1;

            // If both are 3-digit or both are not 3-digit, sort normally
            if (a < b) return numSort.direction === 'asc' ? -1 : 1;
            if (a > b) return numSort.direction === 'asc' ? 1 : -1;
          } else {
            // Handle sorting by `pgCount` or `pvCount`
            const keyType = numSort.key === 'pgCount' ? 'pg' : 'pv';
            const countA = getPGPVCount(a, currentHour, keyType);
            const countB = getPGPVCount(b, currentHour, keyType);

            if (countA < countB) return numSort.direction === 'asc' ? -1 : 1;
            if (countA > countB) return numSort.direction === 'asc' ? 1 : -1;
          }
        }
      } else if (sortType === 'sortConfig') {
        if (sortConfig.key && sortConfig.hour !== undefined) {
          const hourDataA = serviceA?.hours[sortConfig.hour] || {};
          const hourDataB = serviceB?.hours[sortConfig.hour] || {};

          // Check if either has zero or no traffic data

          const ratioA = calculateRatio(a, sortConfig.hour, sortConfig.key);
          const ratioB = calculateRatio(b, sortConfig.hour, sortConfig.key);

          if (ratioA < ratioB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (ratioA > ratioB) return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }

      return 0;
    });
  }, [serviceIds, numSort, sortConfig, calculateRatio, data, getPGPVCount, sortType]);


  const handleSort = (type, key, direction, hour) => {
    setSortType(type);
    if (type === 'numSort') {
      setNumSort({ key, direction });
    } else if (type === 'sortConfig') {
      setSortConfig({ key, direction, hour });
    }
  };


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


  // Toggle popup visibility  by clicking on service id and i used useparam to get the id

  const handleModalToggle = (e) => {
    serviceId.current = e.target.innerText;
    setModalOpen(!isModalOpen);

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
        if (service.hours[i] && (service.hours[i].pingenCount > 0 || service.hours[i].pinverCount > 0)) {
          return false;
        }
      }
      return true;
    }).length;
  }, [filteredServiceIds, data, getCurrentHour]);

  const totalService = countActiveServices() + countNoTrafficServices()


  //add graph popup as when x is clicked it should close

  return (
    <>
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
        <div className='stats-data'>
          <div className='stats-data-item'>
            <h3>All IDs</h3>
            <p className='green'>{totalService}</p>
          </div>
          <div className='stats-data-item'>
            <h3>Active IDs</h3>
            <p className='green'>{countActiveServices()}</p>
          </div>
          <div className='stats-data-item'>
            <h3>No Traffic</h3>
            <p className='red'>{countNoTrafficServices() | 0}</p>
          </div>
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
                  handleSort={() => handleSort(uniqueTerritory, setTerritoryFilter)}
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
              <th className="sticky_head-horizontal-2" rowSpan="2">
                App_serviceid
                <button
                  onClick={() => handleSort('numSort', 'id', 'asc')}
                  className={`sort-button ${numSort.key === 'id' && numSort.direction === 'asc' ? 'active' : ''}`}
                  aria-label="Sort ascending"
                >
                  <i className="fas fa-arrow-up"></i>
                </button>
                <button
                  onClick={() => handleSort('numSort', 'id', 'desc')}
                  className={`sort-button ${numSort.key === 'id' && numSort.direction === 'desc' ? 'active' : ''}`}
                  aria-label="Sort descending"
                >
                  <i className="fas fa-arrow-down"></i>
                </button>
              </th>

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
                  onClick={() => handleSort('numSort', 'pgCount', 'asc')}
                  className={`sort-button ${numSort.key === 'pgCount' && numSort.direction === 'asc' ? 'active' : ''}`}
                  aria-label="Sort ascending"
                >
                  <i className="fas fa-arrow-up"></i>
                </button>
                <button
                  onClick={() => handleSort('numSort', 'pgCount', 'desc')}
                  className={`sort-button ${numSort.key === 'pgCount' && numSort.direction === 'desc' ? 'active' : ''}`}
                  aria-label="Sort descending"
                >
                  <i className="fas fa-arrow-down"></i>
                </button>
              </th>
              <th
                className="sticky_head-horizontal-5"
                rowSpan="2"
              >
                Pv Count
                <button
                  onClick={() => handleSort('numSort', 'pvCount', 'asc')}
                  className={`sort-button ${numSort.key === 'pvCount' && numSort.direction === 'asc' ? 'active' : ''}`}
                  aria-label="Sort ascending"
                >
                  <i className="fas fa-arrow-up"></i>
                </button>
                <button
                  onClick={() => handleSort('numSort', 'pvCount', 'desc')}
                  className={`sort-button ${numSort.key === 'pvCount' && numSort.direction === 'desc' ? 'active' : ''}`}
                  aria-label="Sort descending"
                >
                  <i className="fas fa-arrow-down"></i>
                </button>
              </th>
              <th className='sticky_head_horizontal-6' rowSpan={2}>
                Action
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
                        onClick={() => handleSort('sortConfig', 'pg', 'asc', hour)}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pg' && sortConfig.direction === 'asc' ? 'active' : 'asc'}`}
                      >
                        <i className="fas fa-arrow-up"></i>
                      </button>
                      <button
                        onClick={() => handleSort('sortConfig', 'pg', 'desc', hour)}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pg' && sortConfig.direction === 'desc' ? 'active' : 'desc'}`}
                      >
                        <i className="fas fa-arrow-down"></i>
                      </button>
                    </div>
                  </th>
                  <th>
                    <span className="pg">PV</span>
                    <span className="pgs">PVS</span>
                    <div className="sort-buttons">
                      <button
                        onClick={() => handleSort('sortConfig', 'pv', 'asc', hour)}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pv' && sortConfig.direction === 'asc' ? 'active' : 'asc'}`}
                      >
                        <i className="fas fa-arrow-up"></i>
                      </button>
                      <button
                        onClick={() => handleSort('sortConfig', 'pv', 'desc', hour)}
                        className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pv' && sortConfig.direction === 'desc' ? 'active' : 'desc'}`}
                      >
                        <i className="fas fa-arrow-down"></i>
                      </button>
                    </div>
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
                    <td className="sticky-1">{info?.territory || '-'}</td>
                    <td>{info?.operator || '-'}</td>
                    <td className="service-id-cell" onClick={handleModalToggle}>
                      {serviceId}
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

                    <td className='sticky-6'>
                      <div className='dropdown'>
                        <button className='dropbtn'><i class="fa fa-tasks"></i></button>
                        <div className='dropdown-content'>

                    <div className='model' onClick={handleModalToggle}>
                        <i class="fa-solid fa-chart-line" ></i>
                        Graph
                    </div>
                       
                          <Link to={`http://103.150.136.251:8080/app_log/${serviceId}.txt`} target="_blank">
                          <i class="fa-solid fa-file-circle-plus"></i>  Logs
                      </Link>

                      <a href=''>
                        <i class="fa-solid fa-download"></i>
                        Export
                      </a>
                        </div>

                      </div>
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
                <td colSpan={30} className="text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
       
      </div>
    
    </div>
  <Modal
  isOpen={isModalOpen}
  onClose={handleModalToggle}
  content={<GraphData Id= {serviceId} />}
/>
</>

  );
};

export default DataList;