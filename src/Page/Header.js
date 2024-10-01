import React, { useState, useEffect } from 'react';
import DataList from '../components/DataList';
import InactiveData from '../components/InactiveData';
import '../css/style.css';
import '../css/header.css';
import { processDataByServiceId } from '../utils';
import { useNavigate } from 'react-router-dom'
import { FaSignOutAlt } from "react-icons/fa";
import {ApiRequest} from '../APi';
import Loading from '../components/Loading';


const Header = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  });

  // Function to remove notifications older than 5 hours
  const cleanExpiredNotifications = () => {
    const currentTime = new Date().getTime();
    const fiveHoursAgo = currentTime - 5 * 60 * 60 * 1000; // 5 hours in milliseconds
    const updatedNotifications = Object.fromEntries(
      Object.entries(notifications).filter(([serviceId, { timestamp }]) => new Date(timestamp).getTime() > fiveHoursAgo)
    );

    // Update notifications if any were removed
    if (Object.keys(updatedNotifications).length !== Object.keys(notifications).length) {
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  };

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

  const processdata = processDataByServiceId(data);
  // Helper function to generate and update notifications
  const updateNotifications = (serviceId, message) => {
    const timestamp = new Date().toISOString(); // Store timestamp in ISO format
    const newNotifications = { ...notifications, [serviceId]: { message, timestamp } };
    
    // Save the updated notifications to local storage and update state
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  };

  // Check if the last 2 hours of pingenCount and pinverCount are 0, then trigger a notification
  const checkAlert = () => {
    const currentHour = new Date().getHours();
    Object.keys(processdata).forEach(serviceId => {
      const serviceData = processdata[serviceId];
      const hourData = serviceData.hours.filter(
        item => item.hour >= currentHour - 2 && item.hour <= currentHour
      );

      if (hourData.length > 0) {
        const alertData = hourData.filter(item => item.pingenCount === 0 && item.pinverCount === 0);

        if (alertData.length > 0) {
          const message = `App Service Id ${serviceId}\nThere is no traffic for the last 2 hours`;
          updateNotifications(serviceId, message);
        }
      }
    });

    // Clean up expired notifications
    cleanExpiredNotifications();
  };

  // Check if pingenCount or pinverCount is 30 or more in the last 45 minutes, but pingenCountSuccess or pinverCountSuccess is 0
  const checkAdditionalAlert = () => {
    const currentTime = new Date().getTime();
    const fortyFiveMinutesAgo = currentTime - 45 * 60 * 1000; // 45 minutes in milliseconds

    Object.keys(processdata).forEach(serviceId => {
      const serviceData = processdata[serviceId];
      const hourData = serviceData.hours.filter(item => new Date().setHours(item.hour) >= fortyFiveMinutesAgo);

      const alertData = hourData.filter(item => 
        (item.pingenCount >= 30 || item.pinverCount >= 30) &&
        (item.pingenCountSuccess === 0 || item.pinverCountSuccess === 0)
      );

      if (alertData.length > 0) {
        const message = `App Service Id ${serviceId}\nPingenCount or PinverCount is 30 or more with 0 success count`;
        updateNotifications(serviceId, message);
        //add interval to trigger alert every 45 minutes
        // eslint-disable-next-line
        const intervalId = setInterval(() => {
        window.alert(message);
   }, 30*60*1000); // 45 minutes delays
      }
    },[]);
  };
  // Set up interval to check alerts every 45 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Object.keys(processdata).length > 0) {
        checkAlert();
        checkAdditionalAlert(); // Check additional alerts
      }
    }, .5 * 60 * 1000); // 45 minutes in milliseconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [processdata]);

  if (loading) {
    return <Loading />;
  }
  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('Requested Data');
   // If you have other user data stored, clear that too

    // Redirect to the login page
    navigate('/login');
  };
  return (
    <>
      <div className="billex-main">
        <div className="table-one p-2">
          <div className="p-2">
            <div className="row">
            <div className="head_black">
               <img
          src="file.png" 
          alt=""
          className="logo"
        />
        <h1 className="title">Globocom Support Monitoring</h1></div>
              <div className="tabs">
                {['all', 'inactive', 'notification'].map((tabName) => (
                  <button
                    key={tabName}
                    onClick={() => setTab(tabName)}
                    className={tab === tabName ? 'active' : ''}
                  >
                    {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                  </button>
                ))}
                <div className='tabs'>
              <button className='logout' onClick={handleLogout}>
              <FaSignOutAlt /></button>  
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    
      {tab === 'all' && <DataList data={data} />}
      {tab === 'inactive' && <InactiveData data={data} />}
      {tab === 'notification' && (
        <div className="notifications-container">
          {Object.keys(notifications).length === 0 ? (
            <p className="no-notifications">No Issue Here !.</p>
          ) : (
            Object.values(notifications).map((notification, index) => (
              <div key={index} className="notification-item">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-timestamp">
                  {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default Header;
