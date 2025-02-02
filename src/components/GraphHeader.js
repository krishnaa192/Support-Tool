import React from 'react';
import '../css/D3chart.css';
import '../css/Modal.css';

const GraphHeader = ({ selectedOption, onChange }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>PVS Graph</h2>
        <div className="data-card">
          <p><strong>Territory:</strong> JO</p>
          <p><strong>Service Name:</strong> GAMESWORLD</p>
          <p><strong>Operator:</strong> UMNIAH</p>
          <p><strong>Partner:</strong> Olimob</p>
          <p><strong>Biller:</strong> TPAY</p>
          <p><strong>Service Partner:</strong> Novustech</p>
          <p><strong>Service ID:</strong> 1955</p>
        </div>
        <select
          className="graph-dropdown"
          value={selectedOption}
          onChange={onChange}
        >
          <option value="unoptimized">Biller Report</option>
          <option value="optimized">Partner Report</option>
        </select>
      </div>
    </div>
  );
};

export default GraphHeader;
