/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import InactiveData from '../components/InactiveData';
import { fetchDataAndCount, processDataByServiceId } from '../utils';
import Loading from '../components/Loading';
import '../css/style.css';
import '../header.css';

const Header = () => {
  const [tab, setTab] = useState('all');
  const [allIdsCount, setAllIdsCount] = useState(0);
  const [inactiveIdsCount, setInactiveIdsCount] = useState(0);
  const [activeIdsCount, setActiveIdsCount] = useState(0);
  const [noTrafficIdsCount, setNoTrafficIdsCount] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data,
          totalCount,
          inactiveCount,
          activeCount,
          noTrafficCount,
        } = await fetchDataAndCount();

        setData(data);
        setAllIdsCount(totalCount);
        setInactiveIdsCount(inactiveCount);
        setActiveIdsCount(activeCount);
        setNoTrafficIdsCount(noTrafficCount);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const processData = processDataByServiceId(data);
    
    const checkAlerts = async () => {
      const currentTime = new Date().getTime();
      const lastCheckTime = localStorage.getItem('lastCheckTime');
      const interval = 45 * 60 * 1000; // 45 minutes in milliseconds

      if (lastCheckTime && currentTime - lastCheckTime < interval) {
        // Skip checking if it hasn't been 45 minutes since the last check
        return;
      }

      const currentHour = new Date().getHours();
      const alertServiceIds = [];

      Object.keys(processData).forEach(serviceId => {
        const serviceHours = processData[serviceId]?.hours || [];
        let noTraffic = true;

        for (let i = 0; i < 2; i++) {
          const hourIndex = (currentHour - i + 24) % 24;
          const hourData = serviceHours[hourIndex] || {}; // Initialize hourData here

          if (
            hourData.pingenCount > 0 ||
            hourData.pingenCountSuccess > 0 ||
            hourData.pinverCount > 0 ||
            hourData.pinverCountSuccess > 0
          ) {
            noTraffic = false;
            break;
          }

          if (hourData.pingenCount >= 50 && hourData.pingenCountSuccess === 0) {
            alert(`Service ID ${serviceId} has high pingen count with no success.`);
            noTraffic = false; // Optional: change logic based on requirements
          }

          if (hourData.pinverCount >= 50 && hourData.pinverCountSuccess === 0) {
            alert(`Service ID ${serviceId} has high pinver count with no success.`);
            noTraffic = false; // Optional: change logic based on requirements
          }
        }

        if (noTraffic) {
          alertServiceIds.push(serviceId);
        }
      });

      if (alertServiceIds.length > 0) {
        alertServiceIds.forEach(id => {
          alert(`Service ID ${id} has no traffic for the last two hours.`);
        });
      }

      // Update the last check time
      localStorage.setItem('lastCheckTime', currentTime);
    };

    checkAlerts(); // Initial check
    const intervalId = setInterval(checkAlerts, 45 * 60 * 1000); // Check every 45 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount

  }, [loading, data]);

  if (loading) return <div><Loading/></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="billex-main">
        <div className="table-one p-2">
          <div>
            <div className="p-2">
              <div className="row">
                <div className='tabs'>
                  <button onClick={() => setTab('all')} className={tab === 'all' ? 'active' : ''}>
                    All Data
                  </button>
                  <button onClick={() => setTab('inactive')} className={tab === 'inactive' ? 'active' : ''}>
                    Inactive Data
                  </button>
                </div>
                <h3 className="head_black">Globocom Support Monitoring</h3>
                <div className='stats-container'>
                  <div className='stats-data-item'>
                    <h3>All IDs</h3>
                    <p className='green'>{allIdsCount}</p>
                  </div>
                  <div className='stats-data-item'>
                    <h3>Active IDs</h3>
                    <p className='green'>{activeIdsCount}</p>
                  </div>
                  <div className='stats-data-item'>
                    <h3>No Traffic</h3>
                    <p className='red'>{noTrafficIdsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      {tab === 'all' && <DataList data={data} />}
      {tab === 'inactive' && <InactiveData data={data} />}
    </>
  );
};

export default Header;
