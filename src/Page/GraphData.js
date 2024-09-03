import React, { useState, useEffect } from 'react';
import D3Chart from '../Graph/Graph';
import { processDataByServiceId } from '../utils';
import ApiRequest from '../APi';
import '../css/D3chart.css';



const GraphData = ({ Id }) => {
  
  const [data, setData] = useState({});
  const [selectedId, setSelectedId] = useState(Id || null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest();
        const processedData = processDataByServiceId(response);
        setData(processedData);

        // Select the current serviceId or default to the first one
        const idToSelect = Id || Object.keys(processedData)[0] || null;
        setSelectedId(Id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [Id]); // Refetch data whenever serviceId changes

  const selectedData = selectedId ? data[selectedId] : null;
  const getcurrentYear = new Date().getFullYear();
  const getCurrentMonth = new Date().getMonth();

  const chartData = selectedData ? selectedData.hours.map((hour, index) => ({
    date: new Date(getcurrentYear, getCurrentMonth, new Date().getDate(), index),
    pingenCount: hour.pingenCount,
    pingenCountSuccess: hour.pingenCountSuccess,
    pinverCount: hour.pinverCount,
    pinverCountSuccess: hour.pinverCountSuccess
  })) : [];

  return (
    <div className='graph-data'>
      <div className='data-card'>
        {selectedData && (
          <ul>
            <li>Territory: {selectedData.info.territory || 'N/A'}</li>
            <li>Service Name: {selectedData.info.servicename || 'N/A'}</li>
            <li>Operator: {selectedData.info.operator || 'N/A'}</li>
            <li>Partner: {selectedData.info.partner || 'N/A'}</li>
            <li>Biller: {selectedData.info.billername || 'N/A'}</li>
            <li>Service Partner: {selectedData.info.service_partner || 'N/A'}</li>
          </ul>
        )}
      </div>
      <div className='graphs'>
        {selectedData && chartData.length > 0 && (
          <D3Chart
            data={chartData}
            title={`PVS for Service ID ${selectedId}`}
          />
        )}
      </div>
    </div>
  );
};

export default GraphData;
