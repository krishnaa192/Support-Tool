import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InactiveData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState([]);
  const [inactiveServices, setInactiveServices] = useState([]);

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
        const lastThreeHours = [
          (currentHour - 2 + 24) % 24,
          (currentHour - 1 + 24) % 24,
          currentHour
        ].reverse();

        const newInactiveServices = Object.keys(inactiveData).filter(serviceId => {
          const hourData0 = inactiveData[serviceId].hours[(currentHour - 0 + 24) % 24];
          

          return (
            hourData0.pingenCount === 0 && hourData0.pinverCount === 0 
           
          );
        }).map(serviceId => ({
          serviceId,
          ...inactiveData[serviceId]
        }));

        setData(inactiveData);
        setInactiveServices(newInactiveServices);
        setHours(lastThreeHours);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

const calculateRatio=(id, hour,type)=>{
  const service = data[id];
  if (!service) return 0;
  const hourData = service.hours[hour];
  if (!hourData) return 0;
  if(type==='pg'){
    return hourData.pingenCount === 0 ? 0 : hourData.pingenCountSuccess / hourData.pingenCount;
  }
  else if (type==='pv'){
    return hourData.pinverCount === 0 ? 0 : hourData.pinverCountSuccess / hourData.pinverCount;
  }
  return 0;
}




  const getColorClass = (successCount, totalCount) => {
    const ratio = totalCount === 0 ? 0 : successCount / totalCount;
    if (ratio < 0.25) return 'red';
    if (ratio >= 0.4 && ratio <= 0.6) return 'orange';
    if (ratio > 0.6 && ratio <= 0.8) return 'light-green';
    return 'dark-green';
  };
  
  return (
    <div className='table-container'>
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
                <th >
                              <span className='pg'>PG</span>
                              <span className='pgs'>PGS</span>
                            </th>
                            <th>
                              <span className='pg'>PV</span>
                              <span className='pgs'>PVS</span>
                            </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {inactiveServices.map(service => {
            const { info, hours: serviceHours } = service;
            return (
              <tr key={service.serviceId} className='rows'>
                <td>{info.territory}</td>
                <td>{info.operator}</td>
                <td>{service.serviceId}</td>
                <td>{info.billername}</td>
                <td>{info.servicename}</td>
                <td>{info.partner}</td>
                <td>{info.service_partner}</td>
                {hours.map(hour => {
                  const hourData = serviceHours[hour] || {};
                  return (
                    <React.Fragment key={hour}>
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
  );
};

export default InactiveData;
