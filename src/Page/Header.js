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

useEffect(()=>{
  
}


)

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
