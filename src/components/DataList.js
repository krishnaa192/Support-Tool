/* eslint-disable no-unused-vars */
// eslint-disable
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css';
import '../css/dropdown.css';
import ApiRequest from '../APi';
import MultiSelectDropdown from './MultiSelect';
import * as XLSX from 'xlsx';
import { FaSearch } from "react-icons/fa";
import { FaToggleOff } from "react-icons/fa6";
import { FaToggleOn } from "react-icons/fa6";
import Modal from './Modal';

import GraphData from '../Page/GraphData';





const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [activeServices, setActiveServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [sortType, setSortType] = useState('');
  const [sortConfig, setSortConfig] = useState({});
  const [numSort, setNumSort] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [servicePartnerFilter, setServicePartnerFilter] = useState('all');
  const [statusFilter,setStatusFilter]=useState('all')
  const [adPartnerFilter, setAdPartnerFilter] = useState('all');
  const [territoryFilter, setTerritoryFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [serviceNameFilter, setserviceNameFilter] = useState('all')
  const [billerNameFilter, setBillerNameFilter] = useState('all');
const [status, setStatus] = useState(1);


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
          status,
          dailycap,
          time,
          pingenCount = 0,
          pingenCountSuccess = 0,
          pinverCount = 0,
          pinverCountSuccess = 0,
        } = item;
        if (!acc[app_serviceid]) {
          acc[app_serviceid] = {
            info: { territory, servicename, operator, partner, billername, service_partner,  status,
              dailycap },
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
      const newactiveServices = Object.keys(processedData).filter(serviceId => {
        const hourData0 = processedData[serviceId].hours[(new Date().getHours() - 0 + 24) % 24];
        const hourData1 = processedData[serviceId].hours[(new Date().getHours() - 1 + 24) % 24];

        return (
          hourData0.pingenCount !== 0 && hourData0.pinverCount !== 0 &&
          hourData1.pingenCount !== 0 && hourData1.pinverCount !== 0
        );
      }).map(serviceId => ({
        serviceId,
        ...processedData[serviceId]
      }));

      //check active 


      //implemt the condition if pingentcount and  pingenCountSuccess is 0 then both should show -


      const currentHour = new Date().getHours();
      const hourData = Array.from({ length: currentHour + 1 }, (_, index) => (currentHour - index + 24) % 24);

      setData(processedData);
      setActiveServices(newactiveServices);
      setServiceIds(Object.keys(processedData));
      setHours(hourData);
    }
    fetchData();
  }, []); // Fetch data only once
  console.log("New Active Services", activeServices);
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
  const uniqueStatus=useMemo(()=>{
    const statusName=new Set(Object.values(data).map(item => item.info.status))
    return Array.from(statusName)
  },[data]);

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
    if (totalCount === 0 && successCount === 0) return 'grey';
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

  const checkemail = () => {
    // Retrieve session data from sessionStorage
    const sessionData = sessionStorage.getItem("Requested Data");
    // If session data exists, parse and return the user's email
    if (sessionData) {
      const sdata = JSON.parse(sessionData);
      return sdata.email;
    }
  };

  const openModal = (serviceId) => {
    setSelectedServiceId(serviceId); // Set the unique ID
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedServiceId(null); // Clear the selected ID
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
        (info?.service_partner || '').toLowerCase().includes(query)||
        (info?.status || '').toLowerCase().includes(query)

      );
    });

    const filteredByServicePartner = filterData(filteredByQuery, servicePartnerFilter, 'service_partner');
    const territoryByFilter = filterData(filteredByServicePartner, territoryFilter, 'territory');
    const operatorByFilter = filterData(territoryByFilter, operatorFilter, 'operator');
    const serviceNameByFilter = filterData(operatorByFilter, serviceNameFilter, 'servicename');
    const billerNameByFilter = filterData(serviceNameByFilter, billerNameFilter, 'billername');
    const partnerByFilter = filterData(billerNameByFilter, adPartnerFilter, 'partner');
    const getstatusFilter=filterData(partnerByFilter,statusFilter,"Status")

    return getstatusFilter;
  }, [sortedServiceIds, searchQuery, servicePartnerFilter, territoryFilter, operatorFilter, serviceNameFilter, billerNameFilter, adPartnerFilter,statusFilter, data, filterData]);

  // Toggle popup visibility  by clicking on service id and i used useparam to get the id

  const getCurrentHour = useCallback(() => new Date().getHours(), []);
  // Function to count active services
  const countActiveServices = useCallback(() => {
    const twoHoursAgo = (getCurrentHour() - 2 + 24) % 24;

    return filteredServiceIds.filter(id => {
      const service = data[id];
      if (!service) return false;

      // If twoHoursAgo > currentHour, loop wraps around midnight
      if (twoHoursAgo > getCurrentHour()) {
        // Check from twoHoursAgo to 23
        for (let i = twoHoursAgo; i < 24; i++) {
          if (service.hours[i] && (service.hours[i].pingenCount > 0 || service.hours[i].pinverCount > 0)) {
            return true;
          }
        }
        // Check from 0 to current hour
        for (let i = 0; i <= getCurrentHour(); i++) {
          if (service.hours[i] && (service.hours[i].pingenCount > 0 || service.hours[i].pinverCount > 0)) {
            return true;
          }
        }
      } else {
        // If no wrap, just check from twoHoursAgo to currentHour
        for (let i = twoHoursAgo; i <= getCurrentHour(); i++) {
          if (service.hours[i] && (service.hours[i].pingenCount > 0 || service.hours[i].pinverCount > 0)) {
            return true;
          }
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

      // Check if there is traffic in the last 2 hours
      for (let i = 0; i < 3; i++) {  // Check current hour and the previous 2 hours
        const hourToCheck = (getCurrentHour() - i + 24) % 24;
        const hourData = service.hours[hourToCheck];

        if (hourData && (hourData.pingenCount > 0 || hourData.pinverCount > 0)) {
          return false;  // If any traffic found, return false
        }
      }

      // If no traffic in the last 2 hours, count this service
      return true;

    }).length;
  }, [filteredServiceIds, data, getCurrentHour]);


  const totalService = countActiveServices() + countNoTrafficServices()

  const downloadExcel = () => {
    //get all filtered data
    const service = filteredServiceIds.reduce((acc, serviceId) => {
      acc[serviceId] = data[serviceId];
      return acc;
    }, {});
    if (!service) return;

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Define headers based on your example format
    const metadataHeaders = [
      'Territory', 'Operator', 'APP_SERVICEID', 'Biller Name', 'Service Name', 'Ad Partner',
      'Service Partner'
    ];

    // Dynamic hour headers based on the number of hours in the data
    const hourHeaders = [];
    for (let i = 0; i < 24; i++) {
      const startHour = (i + new Date().getHours()) % 24;
      const endHour = (startHour + 1) % 24;
      const startHourFormatted = startHour === 0 ? '12 AM' : startHour < 12 ? `${startHour} AM` : startHour === 12 ? '12 PM' : `${startHour - 12} PM`;
      const endHourFormatted = endHour === 0 ? '12 AM' : endHour < 12 ? `${endHour} AM` : endHour === 12 ? '12 PM' : `${endHour - 12} PM`;
      hourHeaders.push(`${startHourFormatted} - ${endHourFormatted}`);
    }
    // Combine headers
    const headers = metadataHeaders.concat(hourHeaders);

    // Create rows for metadata and data
    const wsData = [];
    wsData.push(headers);  // Add headers to the worksheet

    Object.keys(service).forEach(serviceId => {
      const { info, hours } = service[serviceId];

      // Metadata row
      const metadataRow = [

        info.territory,
        info.operator,
        serviceId,
        info.billername,
        info.servicename,
        info.partner,
        info.service_partner
      ];

      // Add hour data to the metadata row
      for (let i = 0; i < 24; i++) {
        const hourData = hours[i] || {};
        // pg-pgs-pv-pvs format
        metadataRow.push(`${hourData.pingenCount}- ${hourData.pingenCountSuccess} - ${hourData.pinverCount}- ${hourData.pinverCountSuccess}`);
      }

      wsData.push(metadataRow);
    });

    // Convert data array to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths for better readability set auto width

    ws['!cols'] = headers.map(header => ({ wch: 15 }));

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Write the workbook to a file
    XLSX.writeFile(wb, 'data.xlsx');
  };



  return (
    <>
      <div className="custom-search-col">
        <div className="control">
       
          <div className="info-section">
            <div className="info-box blue">
              <h2>{totalService}</h2>
              <p>All IDs</p>
            </div>
            <div className="info-box greens">
              <h2>{countActiveServices() | 0}</h2>
              <p>Active </p>
            </div>
            <div className="info-box reds">
              <h2>0</h2>
              <p>Deactive</p>
            </div>
            <div className="info-box oranges">
              <h2>{countNoTrafficServices() | 0}</h2>
              <p>No Traffic</p>
            </div>
          </div>
          <div className="filters">
          <form>
            <input type="search" value={searchQuery} placeholder='Search..'
              onChange={e => setSearchQuery(e.target.value)} autofocus required>
            </input>
            <FaSearch  className='search-icon'/>
          </form>
          <div className='download'>
            <button onClick={downloadExcel}>
              <img src='download.png' alt='download' />
            </button>
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
                    title=" Partner"
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
                  
                  <MultiSelectDropdown

                    id="StatusFilter"
                    title="Status"
                    options={uniqueStatus}
                    selectedValue={statusFilter}
                    setSelectedValue={setStatusFilter}
                  />
                 
                </th>
                <th
                  className="sticky_head-horizontal-4"
                  rowSpan="2"
                >
                 Daily Cap
                 
                </th>
                <th
                  className="sticky_head-horizontal-4"
                  rowSpan="2"
                >
                  Total Pg
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
                  Total Pv
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


                <th
                  className="sticky_head-horizontal-5"
                  rowSpan="2"
                >
                  Status
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
                          className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pg' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                          aria-label="Sort ascending"
                        >
                          <i className="fas fa-arrow-up"></i>
                        </button>
                        <button
                          onClick={() => handleSort('sortConfig', 'pg', 'desc', hour)}
                          className={`sort-button ${sortConfig.hour === hour && sortConfig.key === 'pg' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                          aria-label="Sort descending"
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
                      <td className="service-id-cell">
                        {serviceId}
                      </td>
                      <td className="sticky-3">{info?.billername || '-'}</td>
                      <td>{info?.servicename || '-'}</td>
                      <td>{info?.partner || '-'}</td>
                      <td>{info?.service_partner || '-'}</td>
                      <td>{info.status || "None"}</td>
                      <td>{info.dailycap || "None"}</td>
                      <td className="sticky-4">
                        {getPGPVCount(serviceId, getCutrrentHour, 'pg')}
                      </td>
                      <td className="sticky-5">
                        {getPGPVCount(serviceId, getCutrrentHour, 'pv')}
                      </td>
                      <td className='sticky-6'>
                        <div className='dropdown'>
                          <button className='dropbtn'><i className="fa fa-tasks"></i></button>
                          <div className='dropdown-content'>
                            {/* <a href={`/graph/${serviceId}`}rel="noopener noreferrer" className='model'>
                              <i className="fa-solid fa-chart-line"></i>
                              Graph
                            </a> */}
                         <button onClick={() => openModal(serviceId)}>     <i className="fa-solid fa-chart-line"></i>
                          Graph</button>

                            <Link to={`http://103.150.136.251:8080/app_log/${serviceId}.txt`} target="_blank">
                              <i className="fa-solid fa-file-circle-plus"></i>  Logs
                            </Link>

                        {/* show this button if user mail is support  */}
                        {
                          checkemail()==="support@globocom.info" ?  <button className='toggle-button' onClick={() => alert('This feature is not available yet')}>
                          {/* Toggle button for active/inactive */}
                          {status === 1
                            ?<FaToggleOn className='toggle-on'/>
                            :<FaToggleOff className='toggle'/>}
                        </button> :""
                        }
                       
                          

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
                              {/* // add consition when both are 0 then show -  else  normal value*/}
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
                  <td colSpan={30} className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>
    
      </div>
      {isModalOpen && (
        <GraphData
          isOpen={isModalOpen} 
          onClose={closeModal} 
          serviceId={selectedServiceId}  // Pass the selected service ID to the Modal
        />
      )}

    </>
 
  );
  
};

export default DataList;