import React from 'react';
import './alerts.css'; // Add your CSS for notifications

const Notification = ({ notifications }) => {





    
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div key={notification.id} className="notification">
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
