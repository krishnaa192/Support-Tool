import React, { useEffect, useState } from 'react';
import axios from 'axios';  // Import Axios
import './style.css';
import Loading from './Loading';
import InactiveData from './InactiveData';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [blinkState, setBlinkState] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc', hour: null });
  const [tab, setTab] = useState('all');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('', {
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = response.data;
        console.log('API Result:', result);

        const processedData = {};
        result.forEach(item => {
          const { app_serviceid, territory, servicename, operator, billername, service_partner, partner, time, pingenCount, pingenCountSuccess, pinverCount, pinverCountSuccess } = item;

          if (!processedData[app_serviceid]) {
            processedData[app_serviceid] = {
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
          processedData[app_serviceid].hours[hour] = {
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

        setData(processedData);
        setServiceIds(Object.keys(processedData));
        setHours(lastThreeHours);
        setLoading(false);

        const newBlinkState = {};
        Object.keys(processedData).forEach(serviceId => {
          const serviceHours = processedData[serviceId].hours;
          let shouldBlink = false;

          for (let i = 0; i < lastThreeHours.length - 2; i++) {
            const hourData1 = serviceHours[lastThreeHours[i]] || {};
            const hourData2 = serviceHours[lastThreeHours[i + 1]] || {};

            if (
              hourData1.pingenCount === 0 &&
              hourData1.pingenCountSuccess === 0 &&
              hourData1.pinverCount === 0 &&
              hourData1.pinverCountSuccess === 0 &&
              hourData2.pingenCount === 0 &&
              hourData2.pingenCountSuccess === 0 &&
              hourData2.pinverCount === 0 &&
              hourData2.pinverCountSuccess === 0
            ) {
              shouldBlink = true;
              break;
            }

            if (
              (hourData1.pingenCount > 0 ||
                hourData1.pingenCountSuccess > 0 ||
                hourData1.pinverCount > 0 ||
                hourData1.pinverCountSuccess > 0 ||
                hourData2.pingenCount > 0 ||
                hourData2.pingenCountSuccess > 0 ||
                hourData2.pinverCount > 0 ||
                hourData2.pinverCountSuccess > 0)
            ) {
              newBlinkState[serviceId] = false;
            }
          }

          if (shouldBlink) {
            newBlinkState[serviceId] = true;
            // Use setTimeout to ensure alert is shown after the component is loaded
            // setTimeout(() => {
            //   alert(`Alert: Service ${serviceId} has no activity in the last two consecutive hours.`);
            // }
            //   , 0.5 * 60 * 1000);

            setTimeout(() => {
              setBlinkState(prevState => ({ ...prevState, [serviceId]: false }));
            }, 15 * 60 * 1000);
          }
        });

        setBlinkState(newBlinkState);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getColorClass = (successCount, totalCount) => {
    const ratio = totalCount === 0 ? 0 : successCount / totalCount;
    if (ratio <= 0.25) return 'red';
    if (ratio > 0.25 && ratio < 0.4) return 'light-orange';
    if (ratio >= 0.4 && ratio <= 0.6) return 'orange';
    if (ratio > 0.6 && ratio <= 0.8) return 'light-green';
    if (ratio > 0.8) return 'dark-green';
  };

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

  if (loading) {
    return <div><Loading /></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="billex-main">
      <div className="table-one p-2">
        <div>
          <div className="p-2">
            <div className="row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', width: '90%' }}>
              <h3 className="head2">Globocom Support Monitoring</h3>
              <div className="custom-search-col">
                <div className="control">
                  <input
                    className="search"
                    placeholder="Search"
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className='tab'>
                  <button onClick={() => setTab('all')} className={tab === 'all' ? 'active' : ''}>
                    All Data
                  </button>
                  <button onClick={() => setTab('inactive')} className={tab === 'inactive' ? 'active' : ''}>
                    Inactive Data
                  </button>
                </div>
              </div>
            </div>
            <div>
              {tab === 'all' && <div>
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
                      {filteredServiceIds.map(serviceId => {
                        const { info, hours: serviceHours } = data[serviceId];
                        const rowClass = blinkState[serviceId] ? 'blinking' : '';
                        return (
                          <tr key={serviceId} className={rowClass}>
                            <td className={rowClass}>{info.territory}</td>
                            <td className={rowClass}>{info.operator}</td>
                            <td className={rowClass}>{serviceId}</td>
                            <td className={rowClass}>{info.billername}</td>
                            <td className={rowClass}>{info.servicename}</td>
                            <td className={rowClass}>{info.partner}</td>
                            <td className={rowClass}>{info.service_partner}</td>
                            {hours.map((hour, index) => {
                              const hourData = serviceHours[hour] || {};
                              return (
                                <React.Fragment key={index}>
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
              </div>
              }
              {tab === 'inactive' && <div>
                <InactiveData />
              </div>
              }
            </div>

          </div>
        </div>
      </div>
    </div>

  );
};

export default DataList;
