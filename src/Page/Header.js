import React, { useState, useEffect, useRef } from 'react';
import DataList from '../components/DataList';
import '../css/style.css';
import '../css/header.css';
import { processDataByServiceId } from '../utils';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBell,FaTimes } from 'react-icons/fa';
import { ApiRequest } from '../APi';
import Loading from '../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  });
  // To store additional alert interval IDs if needed.
  const additionalAlertIntervals = useRef({});

  // Function to remove notifications older than 5 hours.
  const cleanExpiredNotifications = () => {
    const currentTime = Date.now();
    const fiveHoursAgo = currentTime - 8 * 60 * 60 * 1000; // 8 hours in ms
    const updatedNotifications = Object.fromEntries(
      Object.entries(notifications).filter(
        ([, { timestamp }]) => new Date(timestamp).getTime() > fiveHoursAgo
      )
    );
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

  

  // Update notifications with a new message and mark it as unviewed.
  // If a notification for the same serviceId was already shown in the last 30 minutes,
  // then do not update (i.e. skip re-notifying immediately).
  const updateNotifications = (serviceId, message) => {
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;
    if (notifications[serviceId]) {
      const lastNotified = new Date(notifications[serviceId].timestamp).getTime();
      if (now - lastNotified < THIRTY_MINUTES) {
        // A notification for this serviceId was already shown less than 30 minutes ago.
        return;
      }
    }
    const timestamp = new Date().toISOString();
    const newNotifications = {
      ...notifications,
      [serviceId]: { message, timestamp, viewed: false },
    };
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);

    // Show a toast popup.
    toast.info(message, {
      position: 'top-right',
      autoClose: 5000,
      pauseOnHover: true,
    });
  };

  // When user views notifications, mark all as viewed.
  const viewNotifications = () => {
    const updatedNotifications = Object.fromEntries(
      Object.entries(notifications).map(([serviceId, data]) => [
        serviceId,
        { ...data, viewed: true },
      ])
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Check for alerts based on conditions.
  const checkAlert = () => {
    const currentHour = new Date().getHours();
    Object.keys(processdata).forEach(serviceId => {
      const serviceData = processdata[serviceId];
  
      // Filter items for the current or previous hour AND with status 'ACTIVE
       if (serviceData.info.status=== 'ACTIVE' ) {
      const hourData = serviceData.hours.filter(item =>
        (item.hour === currentHour || item.hour === currentHour - 1) 
      );
  
      if (hourData.length > 0) {
        // Check Pin Generation condition.
        const alertData = hourData.filter(
          item => item.pingenCount > 25 && item.pingenCountSuccess === 0
        );
        if (alertData.length > 0) {
          const message = `App Service Id ${serviceId}\nCheck Pin generation is getting failed`;
          updateNotifications(serviceId, message);
        }
      }
  
      if (hourData.length > 0) {
        // Check Pin Verification condition.
        const alertData = hourData.filter(
          item => item.pinverCount > 25 && item.pinverCountSuccess === 0
        );
        if (alertData.length > 0) {
          const message = `App Service Id ${serviceId}\nCheck Pin verification is getting failed 5`;
          updateNotifications(serviceId, message);
        }
      }
    }
    });
    cleanExpiredNotifications();
  };
  

  // Check additional alerts based on other conditions.
  const checkAdditionalAlert = () => {
    const currentTime = Date.now();
    const fortyFiveMinutesAgo = currentTime - 45 * 60 * 1000; // 45 minutes in ms
    Object.keys(processdata).forEach(serviceId => {
    
      const serviceData = processdata[serviceId];
      const hourData = serviceData.hours.filter(
        item => new Date().setHours(item.hour) >= fortyFiveMinutesAgo
      );
 
      if (serviceData.info.status=== 'ACTIVE') {
        const alertData = hourData.filter(
          item =>
            (item.pingenCount >= 50|| item.pinverCount >= 50) &&
            (item.pingenCountSuccess === 0 || item.pinverCountSuccess === 0)
        );
      
  
        if (alertData.length > 0) {
          const message = `App Service Id ${serviceId}\nPingenCount or PinverCount exceeds 50 with no success`;
          updateNotifications(serviceId, message);
          // Set up a recurring popup for this specific service if not already running.
          if (additionalAlertIntervals.current[serviceId]) {
            clearInterval(additionalAlertIntervals.current[serviceId]);
          }
          additionalAlertIntervals.current[serviceId] = setInterval(() => {
            updateNotifications(serviceId, message);
          }, 25 * 60 * 1000); // every 25 minutes
        }
      } 
    });
  };
  

  // Set up an interval to check alerts every minute (or adjust as needed).
  // (The checks themselves use the 30-min logic per service id.)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Object.keys(processdata).length > 0) {
        checkAlert();
        checkAdditionalAlert();
      }
    }, 20 * 60 * 1000); // every 20 minute
    return () => {
      clearInterval(intervalId);
      // Clear any additional alert intervals.
      Object.values(additionalAlertIntervals.current).forEach(clearInterval);
    };
  }, [processdata]);

  if (loading) {
    return <Loading />;
  }

  // Calculate unviewed notifications count.
  const unviewedCount = Object.values(notifications).filter(n => n.viewed === false).length;

  const handleLogout = () => {
    sessionStorage.removeItem('Requested Data');
    navigate('/login');
  };
const clearNotification = () => {
  setNotifications({});
  localStorage.removeItem('notifications');
  };



  return (
    <>
      <div className="billex-main">
        <div className="table-one p-2">
          <div className="p-2">
            <div className="row">
              <div className="head_black">
                <img src="file.png" alt="Logo" className="logo" />
                <h1 className="title">Globocom Support Monitoring</h1>
              </div>
              <div className="tabs">
                {['all', 'notification'].map(tabName => (
                  <button
                    key={tabName}
                    onClick={() => {
                      setTab(tabName);
                      if (tabName === 'notification') {
                        viewNotifications();
                      }
                    }}
                    className={tab === tabName ? 'active' : ''}
                  >
                    {tabName === 'notification' ? (
                      <div className="notification-tab">
                        <FaBell className="notification-icon" />
                        {unviewedCount > 0 && (
                          <span className="notification-badge">{unviewedCount}</span>
                        )}
                      </div>
                    ) : (
                      tabName.charAt(0).toUpperCase() + tabName.slice(1)
                    )}
                  </button>
                ))}
                <button className="logout" onClick={handleLogout}>
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tab === 'all' && <DataList data={data} />}
      {tab === 'notification' && (
        
        <div className="notifications-container">
          <button onClick={clearNotification}>Clear</button>
          {Object.keys(notifications).length === 0 ? (
            <p className="no-notifications"></p>
          ) : (
            Object.values(notifications).map((notification, index) => (
              <div key={index} className="notification-item">
               
                <div className="notification-message">{notification.message}</div>
                <div className="notification-timestamp">
                  {new Date(notification.timestamp).toLocaleTimeString([], {
                    date: 'date',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default Header;
