import React, { useEffect, useState } from 'react';
import './style.css';

const DataList = () => {
  const [data, setData] = useState({});
  const [serviceIds, setServiceIds] = useState([]);
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [blinkState, setBlinkState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('', {
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
        const hoursArray = Array.from({ length: currentHour + 1 }, (_, i) => i).reverse();

        setData(processedData);
        setServiceIds(Object.keys(processedData));
        setHours(hoursArray);
        setLoading(false);

        // Determine blinking state
        const newBlinkState = {};

        Object.keys(processedData).forEach(serviceId => {
          const serviceHours = processedData[serviceId].hours;
          const lastThreeHours = [currentHour, (currentHour - 1 + 24) % 24, (currentHour - 2 + 24) % 24];
          const shouldBlink = lastThreeHours.every(hour => {
            const hourData = serviceHours[hour];
            return (
              hourData.pingenCount === 0 &&
              hourData.pingenCountSuccess === 0 &&
              hourData.pinverCount === 0 &&
              hourData.pinverCountSuccess === 0
            );
          });

          if (shouldBlink) {
            newBlinkState[serviceId] = true;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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

  const filteredServiceIds = serviceIds.filter(serviceId => {
    const { info } = data[serviceId];
    return (
      serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.territory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.servicename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.partner.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="billex-main">
      <div className="table-one p-2">
        <div>
          <div className="p-2">
            <div className="row" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between',width:'90%' }}>
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
                        <th><span className="pg-head">PG</span> <span className="pgs-head">PGS</span></th>
                        <th><span className="pg-head">PV</span> <span className="pgs-head">PVS</span></th>
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
                              <td className={`text-center ${getColorClass(hourData.pingenCountSuccess, hourData.pingenCount)} `}>
                                <span className='pg'>{hourData.pingenCount}</span>
                                <span className='pgs'>{hourData.pingenCountSuccess}</span>
                              </td>
                              <td className={`text-center ${getColorClass(hourData.pinverCountSuccess, hourData.pinverCount)} `}>
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
