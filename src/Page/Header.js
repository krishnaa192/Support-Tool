import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import InactiveData from '../components/InactiveData';
import '../css/style.css';
import '../css/header.css';
import {  processDataByServiceId } from '../utils';
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
      
      // Initialize lastCheckTime if not set
      if (!lastCheckTime) {
        lastCheckTime = currentTime.toString();
        localStorage.setItem('lastCheckTime', lastCheckTime);
      }
      
      console.log('Last check time:', lastCheckTime); // Log to verify if it's being retrieved
    
      const interval = 45 * 60 * 1000; // 45 minutes
    
      if (currentTime - parseInt(lastCheckTime, 10) < interval) {
        console.log('Skipping check. Last checked recently');
        return;
      }
    
      // Proceed with your alert checking logic
      let newNotifications = {};
    
      // Your existing logic for processing and checking data
    
      if (Object.keys(newNotifications).length > 0) {
        setNotifications((prevNotifications) => {
          const updatedNotifications = {
            ...prevNotifications, // Retain existing notifications
            ...newNotifications,  // Add or update with new ones
          };
    
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });
      }
    
      localStorage.setItem('lastCheckTime', currentTime.toString());
      console.log('Updated last check time:', currentTime); // Log the updated time
    };
    

    checkAlerts();
    const intervalId = setInterval(checkAlerts, 45 * 60 * 1000); // Check every 45 minutes

    return () => clearInterval(intervalId);
  }, [loading, data]);

  // Remove notifications older than 6 hours
  useEffect(() => {
    const timer = setInterval(() => {
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
                <div className="tabs">
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
