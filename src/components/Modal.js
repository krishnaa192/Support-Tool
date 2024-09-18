import React from 'react';
import '../css/Modal.css'
const Modal = ({ isOpen, onClose, serviceId }) => {
  if (!isOpen) return null; // If modal is not open, don't render anything

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Service ID: {serviceId}</h2>
        <p>This is content for service {serviceId}.</p>
        <button onClick={onClose}>Close Modal</button>
      </div>
    </div>
  );
};

export default Modal;
