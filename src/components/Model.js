import React from 'react';
import './Model.css'; // Import your CSS for modal styling

const Modal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {content}
      </div>
    </div>
  );
};

export default Modal;
