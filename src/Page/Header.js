import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import InactiveData from '../components/InactiveData';
import '../css/style.css';
import '../css/header.css';
import { processDataByServiceId } from '../utils';
import ApiRequest from '../APi';

const Header = () => {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest();
        setData(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const processData = processDataByServiceId(data);

    const checkAlerts = () => {
      const currentTime = new Date().getTime();
      let lastCheckTime = localStorage.getItem('lastCheckTime');

      if (!lastCheckTime) {
        lastCheckTime = currentTime.toString();
        localStorage.setItem('lastCheckTime', lastCheckTime);
      }

      const interval = 45 * 60 * 1000; // 45 minutes
      if (currentTime - parseInt(lastCheckTime, 10) < interval) {
        console.log('Skipping check. Last checked recently');
        return;
      }

      let newNotifications = {};

      // Iterate over processed data to check for alert conditions
      Object.keys(processData).forEach((serviceId) => {
        const serviceData = processData[serviceId];

        if (!Array.isArray(serviceData)) {
          console.error(`Service data for ${serviceId} is not an array`, serviceData);
          return; // Skip if data is not an array
        }

        const lastTwoHours = serviceData.filter(item => {
          const itemTime = new Date(item.timestamp).getTime();
          return currentTime - itemTime < 2 * 60 * 60 * 1000; // last 2 hours
        });

        const pingenCountSum = lastTwoHours.reduce((sum, item) => sum + item.pingenCount, 0);
        const pinverCountSum = lastTwoHours.reduce((sum, item) => sum + item.pinverCount, 0);

        if (pingenCountSum === 0 && pinverCountSum === 0) {
          newNotifications[serviceId] = {
            message: `No activity for service ${serviceId} in the last 2 hours.`,
            timestamp: new Date().toISOString(),
          };
          console.log(`Generated notification: No activity for ${serviceId}`);
        }

        lastTwoHours.forEach(item => {
          if ((item.pingenCount === 30 && item.pingenCountSuccess === 0) || 
              (item.pinverCount === 30 && item.pinverCountSuccess === 0)) {
            newNotifications[serviceId] = {
              message: `Alert for service ${serviceId}: Ping/Pinver count is 30 but success is 0.`,
              timestamp: new Date().toISOString(),
            };
            console.log(`Generated alert: Ping/Pinver issue for ${serviceId}`);
          }
        });
      });

      if (Object.keys(newNotifications).length > 0) {
        setNotifications((prevNotifications) => {
          const updatedNotifications = {
            ...prevNotifications,
            ...newNotifications,
          };
          console.log('New notifications:', updatedNotifications); // Log the new notifications
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
      }

      localStorage.setItem('lastCheckTime', currentTime.toString());
    };

    checkAlerts();
    const intervalId = setInterval(checkAlerts, 0.5 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(intervalId);
  }, [loading, data]);

  // Remove notifications older than 6 hours
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const currentTime = new Date().getTime();
      const updatedNotifications = Object.keys(notifications).reduce((result, serviceId) => {
        const notification = notifications[serviceId];
        const notificationTime = new Date(notification.timestamp).getTime();

        // Keep only notifications from the last 6 hours
        if (currentTime - notificationTime < 6 * 60 * 60 * 1000) {
          result[serviceId] = notification;
        }

        return result;
      }, {});

      if (Object.keys(updatedNotifications).length !== Object.keys(notifications).length) {
        setNotifications(updatedNotifications);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
    };

    const cleanupInterval = setInterval(cleanupOldNotifications, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [notifications]);

  return (
    <>
      <div className="billex-main">
        <div className="table-one p-2">
          <div className="p-2">
            <div className="row">
              <div className="tabs">
                {['all', 'inactive', 'notification'].map((tabName) => (
                  <button
                    key={tabName}
                    onClick={() => setTab(tabName)}
                    className={tab === tabName ? 'active' : ''}
                  >
                    {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Data
                  </button>
                ))}
              </div>
              <h3 className="head_black">Globocom Support Monitoring</h3>
            </div>
          </div>
        </div>
      </div>
      <hr />
      {tab === 'all' && <DataList data={data} />}
      {tab === 'inactive' && <InactiveData data={data} />}
      {tab === 'notification' && (
        <div className="notifications-container">
          {Object.keys(notifications).length === 0 ? (
            <p className="no-notifications">No notifications at the moment.</p>
          ) : (
            Object.values(notifications).map((notification, index) => (
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
