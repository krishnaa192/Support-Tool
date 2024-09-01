import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import InactiveData from '../components/InactiveData';
import { fetchDataAndCount, processDataByServiceId } from '../utils';
import '../css/style.css';
import '../header.css';

const Header = () => {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await fetchDataAndCount();
      setData(data);
      setLoading(false);
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
      let newNotifications = [];

      Object.keys(processData).forEach(serviceId => {
        const serviceHours = processData[serviceId]?.hours || [];

        let hasRecentData = false;
        for (let i = 0; i < 2; i++) {
          const hourIndex = (currentHour - i + 24) % 24;
          const hourData = serviceHours[hourIndex] || {};

          if (hourData.pingenCount > 0 || hourData.pingenCountSuccess > 0 ||
              hourData.pinverCount > 0 || hourData.pinverCountSuccess > 0) {
            hasRecentData = true;
            break;
          }
        }

        if (!hasRecentData) {
          // Add to notifications for no data in last 2 hours
          newNotifications.push(`Service ID ${serviceId} has no data for the last 2 hours.`);
        }
      });

      // Update notifications state for the 'notification' tab
      setNotifications(newNotifications);

      // Update last check time in localStorage
      localStorage.setItem('lastCheckTime', currentTime.toString());
    };

    // Run checkAlerts immediately and set an interval for it
    checkAlerts();
    const intervalId = setInterval(checkAlerts, 45 * 60 * 1000); // Check every 45 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount

  }, [loading, data]);

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
                  <button onClick={() => setTab('notification')} className={tab === 'notification' ? 'active' : ''}>
                    Notifications
                  </button>
                </div>
                <h3 className="head_black">Globocom Support Monitoring</h3>
                <div className='stats-container'>
                  {/* Add any other stats you need here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      {tab === 'all' && <DataList data={data} />}
      {tab === 'inactive' && <InactiveData data={data} />}
      {tab === 'notification' && (
        <div className="notifications-container">
          {notifications.length === 0 ? (
            <p>No notifications at the moment.</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                {notification}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default Header;
