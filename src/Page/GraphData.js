import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import D3Chart from '../Graph/Graph';
import { processDataByServiceId } from '../utils';
import ApiRequest from '../APi';
import '../css/D3chart.css';

const GraphData = () => {
  const { serviceId } = useParams(); // Get serviceId from URL
  const [data, setData] = useState({});
  const [selectedId, setSelectedId] = useState(serviceId || null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest();
        const processedData = processDataByServiceId(response);
        setData(processedData);
        if (serviceId) {
          setSelectedId(serviceId);
        } else {
          const firstId = Object.keys(processedData)[0];
          if (firstId) setSelectedId(firstId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [serviceId]); // Fetch data when serviceId changes

  useEffect(() => {
    if (serviceId) {
      setSelectedId(serviceId);
    }
  }, [serviceId]);

  const selectedData = selectedId ? data[selectedId] : null;

  const chartData = selectedData ? selectedData.hours.map((hour, index) => ({
    date: new Date(2024, 0, 1, index), // Adjust as needed
    pingenCount: hour.pingenCount,
    pingenCountSuccess: hour.pingenCountSuccess,
    pinverCount: hour.pinverCount,
    pinverCountSuccess: hour.pinverCountSuccess
  })) : [];

  return (
    <div className='graph-data'>
      <h1>Hourly Data</h1>
      <div className='data-card'>
        {selectedData && (
          <div>
            <ul>
              <li>Territory: {selectedData.info.territory || 'N/A'}</li>
              <li>Service Name: {selectedData.info.servicename || 'N/A'}</li>
              <li>Operator: {selectedData.info.operator || 'N/A'}</li>
              <li>Partner: {selectedData.info.partner || 'N/A'}</li>
              <li>Biller: {selectedData.info.billername || 'N/A'}</li>
              <li>Service Partner: {selectedData.info.service_partner || 'N/A'}</li>
            </ul>
          </div>
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
