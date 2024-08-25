/* eslint-disable no-unused-vars */
// eslint-disable
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../css/style.css';
import Loading from './Loading';
import ApiRequest from '../APi';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blinkState, setBlinkState] = useState({});
  const [lastBlinkTime, setLastBlinkTime] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [servicePartnerFilter, setServicePartnerFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ hour: null, key: null, direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ApiRequest();
        console.log("All Data", result);

        const processedData = {};
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
            pinverCountSuccess
          } = item;

          if (!processedData[app_serviceid]) {
            processedData[app_serviceid] = {
              info: {
                territory: territory || '',
                servicename: servicename || '',
                operator: operator || '',
                partner: partner || '',
                billername: billername || '',
                service_partner: service_partner || ''
              },
              hours: Array.from({ length: 24 }, () => ({
                pingenCount: 0,
                pingenCountSuccess: 0,
                pinverCount: 0,
                pinverCountSuccess: 0,
              })),
            };
          }

          const hour = parseInt(time, 10);
          processedData[app_serviceid].hours[hour] = {
            pingenCount: pingenCount || 0,
            pingenCountSuccess: pingenCountSuccess || 0,
            pinverCount: pinverCount || 0,
            pinverCountSuccess: pinverCountSuccess || 0,
          };
        });

        const currentHour = new Date().getHours();
        const sixHours = [];
        for (let i = 0; i < 6; i++) {
          sixHours.push((currentHour - i + 24) % 24);
        }

        setData(processedData);
        setServiceIds(Object.keys(processedData));
        setHours(sixHours);
        setLoading(false);

        const now = Date.now();
        const newBlinkState = { ...blinkState };
        const newLastBlinkTime = { ...lastBlinkTime };

        Object.keys(processedData).forEach(serviceId => {
          const serviceHours = processedData[serviceId].hours;
          const hourData1 = serviceHours[(currentHour - 1 + 24) % 24];
          const hourData0 = serviceHours[currentHour];
          let shouldBlink = false;

          if (
            hourData1.pingenCount === 0 &&
            hourData1.pingenCountSuccess === 0 &&
            hourData1.pinverCount === 0 &&
            hourData1.pinverCountSuccess === 0 &&
            hourData0.pingenCount === 0 &&
            hourData0.pingenCountSuccess === 0 &&
            hourData0.pinverCount === 0 &&
            hourData0.pinverCountSuccess === 0
          ) {
            shouldBlink = true;
          }

          if (
            (hourData1.pingenCount >= 50 && hourData1.pingenCountSuccess === 0) ||
            (hourData1.pinverCount >= 50 && hourData1.pinverCountSuccess === 0)
          ) {
            if (
              hourData1.pingenCount > 0 ||
              hourData1.pingenCountSuccess > 0 ||
              hourData1.pinverCount > 0 ||
              hourData1.pinverCountSuccess > 0 ||
              hourData0.pingenCount > 0 ||
              hourData0.pingenCountSuccess > 0 ||
              hourData0.pinverCount > 0 ||
              hourData0.pinverCountSuccess > 0
            ) {
              newBlinkState[serviceId] = false;
            }
          }

          if (shouldBlink) {
            const lastBlink = newLastBlinkTime[serviceId] || 0;
            const thirtyMinutes = 30 * 60 * 1000;

            if (now - lastBlink > thirtyMinutes) {
              newBlinkState[serviceId] = true;
              newLastBlinkTime[serviceId] = now;

              // Schedule to stop blinking after 15 minutes
              setTimeout(() => {
                setBlinkState(prevState => ({ ...prevState, [serviceId]: false }));
              }, 15 * 60 * 1000); // 15 minutes
            }
          }
        });

        setBlinkState(newBlinkState);
        setLastBlinkTime(newLastBlinkTime);

      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch data only once

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const newBlinkState = { ...blinkState };
      const newLastBlinkTime = { ...lastBlinkTime };

      Object.keys(blinkState).forEach(serviceId => {
        const lastBlink = newLastBlinkTime[serviceId] || 0;
        const thirtyMinutes = 30 * 60 * 1000;

        if (now - lastBlink > thirtyMinutes) {
          newBlinkState[serviceId] = false;
        }
      });

      setBlinkState(newBlinkState);
      setLastBlinkTime(newLastBlinkTime);
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [blinkState, lastBlinkTime]); // Include all state dependencies

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
        (info?.service_partner || '').toLowerCase().includes(query) ||
        (info?.billername || '').toLowerCase().includes(query)
      );
    });
    return filterServiceProviders(filteredByQuery, servicePartnerFilter);
  }, [sortedServiceIds, searchQuery, data, filterServiceProviders, servicePartnerFilter]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleServicePartnerFilterChange = (event) => {
    setServicePartnerFilter(event.target.value);
  };

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const servicePartners = Array.from(new Set(
    Object.values(data).map(item => item.info.service_partner)
  )).filter(Boolean);

  return (
    <div className="custom-search-col">
      <div className="control">
        <div className="filter-controls">
          <select
            id="service-partner-filter"
            value={servicePartnerFilter}
            onChange={handleServicePartnerFilterChange}
          >
            <option value="all">All</option>
            <option value="Globocom">Globocom</option>
            <option value="Tiara">Tiara</option>
            <option value="Novustech">Novustech</option>
            <option value="Reseller">Reseller</option>
          </select>
        </div>
        <input
          className="search"
          placeholder="Search"
          type="text"
          name="search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="table-container">
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
                const rowClass = blinkState[serviceId] ? 'blinking' : '';
                return (
                  <tr key={serviceId} className={rowClass}>
                    <td>{info?.territory || '-'}</td>
                    <td>{info?.operator || '-'}</td>
                    <td className="service-id-cell">
                      {serviceId}
                      <div className="dropdown-menu">
                        <Link to={`/graph/${serviceId}`} className="hover-button">
                          View Graph
                        </Link>
                      </div>
                    </td>
                    <td>{info?.billername || '-'}</td>
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
