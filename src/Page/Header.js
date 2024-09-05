import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import InactiveData from '../components/InactiveData';
import '../css/style.css';
import '../css/header.css';
import { fetchDataAndCount, processDataByServiceId } from '../utils';

const Header = () => {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

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

    const checkAlerts = () => {
      const currentTime = new Date().getTime();
      const lastCheckTime = localStorage.getItem('lastCheckTime');
      const interval = 45 * 60 * 1000; // 45 minutes

      if (lastCheckTime && currentTime - lastCheckTime < interval) {
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
            newNotifications.push({
              message: `Hey there! Service ID ${serviceId} has no recent data.`,
              timestamp: new Date().toLocaleString(),

            });
        
        }
      });
      if (newNotifications.length > 0) {
        const updatedNotifications = [...notifications, ...newNotifications];
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
      localStorage.setItem('lastCheckTime', currentTime.toString());
    };
    checkAlerts();
    const intervalId = setInterval(checkAlerts, 0 * 60 * 1000); // Check every 45 minutes

    return () => clearInterval(intervalId);
  }, [loading, data, notifications]);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const updatedNotifications = notifications.filter(notification => {
        const notificationTime = new Date(notification.timestamp).getTime();
        return currentTime - notificationTime < 6 * 60 * 60 * 1000; // 6 hours
      });

      if (updatedNotifications.length !== notifications.length) {
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(timer);
  }, [notifications]);

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
            <p className="no-notifications">No notifications at the moment.</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="notification-item">
        
                <div className="notification-message">{notification.message}</div>
                <div className="notification-timestamp">{notification.timestamp}</div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default Header;
