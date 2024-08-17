import React, { useEffect, useState } from 'react';
import './style.css';
import Loading from './Loading';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [blinkState, setBlinkState] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://wap.matrixads.in/mglobopay/getSupportMonitorData', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Result:', result);

        const processedData = result.reduce((acc, item) => {
          const { app_serviceid, territory, servicename, operator, billername, service_partner, partner, time, pingenCount, pingenCountSuccess, pinverCount, pinverCountSuccess } = item;

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

          acc[app_serviceid].hours[parseInt(time, 10)] = {
            pingenCount: pingenCount || 0,
            pingenCountSuccess: pingenCountSuccess || 0,
            pinverCount: pinverCount || 0,
            pinverCountSuccess: pinverCountSuccess || 0,
          };

          return acc;
        }, {});

        const currentHour = new Date().getHours();
        const lastThreeHours = [(currentHour - 2 + 24) % 24, (currentHour - 1 + 24) % 24, currentHour].reverse();

        setData(processedData);
        setServiceIds(Object.keys(processedData));
        setHours(lastThreeHours);
        setLoading(false);

        // Determine blinking state
        const newBlinkState = {};

        Object.keys(processedData).forEach(serviceId => {
          const serviceHours = processedData[serviceId].hours;
          const shouldBlink = lastThreeHours.some((hour, index) => {
            if (index < lastThreeHours.length - 1) {
              const hourData1 = serviceHours[hour];
              const hourData2 = serviceHours[lastThreeHours[index + 1]];
              return (
                hourData1.pingenCount === 0 &&
                hourData1.pingenCountSuccess === 0 &&
                hourData1.pinverCount === 0 &&
                hourData1.pinverCountSuccess === 0 &&
                hourData2.pingenCount === 0 &&
                hourData2.pingenCountSuccess === 0 &&
                hourData2.pinverCount === 0 &&
                hourData2.pinverCountSuccess === 0
              );
            }
            return false;
          });

          if (shouldBlink) {
            newBlinkState[serviceId] = true;
            //alert come  after api is loaded

            // alert(`Alert: Service ${serviceId} has no activity in the last two consecutive hours.`);


            setTimeout(() => setBlinkState(prev => ({ ...prev, [serviceId]: false })), 15 * 60 * 1000); // Stop blinking after 15 minutes
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
    if ((totalCount === 0 && successCount === 0) || (totalCount > 0 && successCount === 0)) {
      return 'red';
    }
    const ratio = totalCount === 0 ? 0 : successCount / totalCount;

    if (ratio < 0.25) {
      return 'red';
    }
    if (ratio >= 0.4 && ratio <= 0.6) {
      return 'orange';
    }
    if (ratio > 0.6 && ratio <= 0.8) {
      return 'light-green';
    }
    return 'dark-green';
  };

  const getRatio = (hourData, type) => {
    if (type === 'pg') {
      return hourData.pingenCount === 0 ? 0 : hourData.pingenCountSuccess / hourData.pingenCount;
    } else if (type === 'pv') {
      return hourData.pinverCount === 0 ? 0 : hourData.pinverCountSuccess / hourData.pinverCount;
    }
    return 0;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedServiceIds = [...serviceIds].sort((a, b) => {
    const serviceA = data[a];
    const serviceB = data[b];
    const hoursDataA = serviceA.hours;
    const hoursDataB = serviceB.hours;
  
    // Determine the column index to sort by
    const columnIndex = hours.length - 1; // Assuming sorting by the last column
    const hourA = hours[columnIndex];
    const hourB = hours[columnIndex];
  
    const ratioA = getRatio(hoursDataA[hourA], sortConfig.key);
    const ratioB = getRatio(hoursDataB[hourB], sortConfig.key);
  
    if (ratioA === 0 && ratioB === 0) {
      return 0;
    }
  
    if (ratioA === 0) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
  
    if (ratioB === 0) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
  
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
      info.partner.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h3 className="head2"> Globocom Support Monitoring</h3>
              <div className="custom-search-col">
                <div className="control">
                  <input className="search" placeholder="Search" type="text" name="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th className="sticky-col" rowSpan="2">Territory</th>
                    <th rowSpan="2">Operator</th>
                    <th className="sticky-col" rowSpan="2">App_serviceid</th>
                    <th className="sticky-col" rowSpan="2">Biller</th>
                    <th rowSpan="2">Servicename</th>
                    <th rowSpan="2">Partner</th>
                    <th rowSpan="2">Service_partner</th>
                    {hours.map((hour, index) => (
                      <th key={index} colSpan="2">{`${hour} AM - ${hour + 1} AM`}</th>
                    ))}
                  </tr>
                  <tr className='hrs'>
                    {hours.map((_, index) => (
                      <React.Fragment key={index}>
                        <th onClick={() => requestSort('pg')}>
                          <span className='pg'> PG</span>
                          <span className='pgs'>PVS</span>
                        </th>
                        <th onClick={() => requestSort('pv')}>
                          <span className='pv'> PV</span>
                          <span className='pvs'>PVS</span>
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
                        <td className={`sticky-col ${rowClass}`}>{info.territory}</td>
                        <td className={rowClass}>{info.operator}</td>
                        <td className={`sticky-col ${rowClass}`}>{serviceId}</td>
                        <td className={`sticky-col ${rowClass}`}>{info.billername}</td>
                        <td className={rowClass}>{info.servicename}</td>
                        <td className={rowClass}>{info.partner}</td>
                        <td className={rowClass}>{info.service_partner}</td>
                        {hours.map((hour, index) => {
                          const hourData = serviceHours[hour];
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
        </div>
      </div>
    </div>
  );
};

export default DataList;
