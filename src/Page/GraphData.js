import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import D3Chart from '../Graph/Graph';
import { processDataByServiceId } from '../utils';
import ApiRequest from '../APi';
import '../css/D3chart.css';
import Loading from '../components/Loading';



const GraphData = () => {
  const { serviceId } = useParams(); // Extract serviceId from route parameters
  const [data, setData] = useState({});
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest();
        const processedData = processDataByServiceId(response);
        setData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Fetch data once on mount

  useEffect(() => {
    if (serviceId && data[serviceId]) {
      setSelectedData(data[serviceId]);
    }
  }, [serviceId, data]); // Update selectedData when serviceId or data changes

  const getCurrentYear = new Date().getFullYear();
  const getCurrentMonth = new Date().getMonth();

  const chartData = selectedData ? selectedData.hours.map((hour, index) => ({
    date: new Date(getCurrentYear, getCurrentMonth, new Date().getDate(), index),
    pingenCount: hour.pingenCount,
    pingenCountSuccess: hour.pingenCountSuccess,
    pinverCount: hour.pinverCount,
    pinverCountSuccess: hour.pinverCountSuccess
  })) : [];


  //get totoal pingenCount, pingenCountSuccess, pinverCount, pinverCountSuccess count for the selected serviceId till current time
  const pgCount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pingenCount, 0) : 0;
  const pgsCount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pingenCountSuccess, 0) : 0;
  const pvcount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pinverCount, 0) : 0;
  const pvscount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pinverCountSuccess, 0) : 0;


//add loading spinner
  if (!selectedData) {
    return <Loading />;
  }


  return (
    <div className='graph-data'>
    
      <h2>PVS Graph</h2>
      <div className='data-card'>
        {selectedData && (
          <ul>
            <li>Territory: {selectedData.info.territory || 'N/A'}</li>
            <li>Service Name: {selectedData.info.servicename || 'N/A'}</li>
            <li>Operator: {selectedData.info.operator || 'N/A'}</li>
            <li>Partner: {selectedData.info.partner || 'N/A'}</li>
            <li>Biller: {selectedData.info.billername || 'N/A'}</li>
            <li>Service Partner: {selectedData.info.service_partner || 'N/A'}</li>
            <li>Service ID: {serviceId}</li>
          </ul>
        )}
      </div>
    

      <div className='graph-container'>
     
      <div className='graph-stats'>
        {selectedData && chartData.length > 0 && (
          <D3Chart
            data={chartData}
            title={`PVS for Service ID ${serviceId}`}
          />
        )}
      </div>
      <div className='data-stats'>
        
        <ul>
          <li>Total PG: {pgCount}</li>
          <li>Total PGS: {pgsCount}</li>
          <li>Total PV: {pvcount}</li>
          <li>Total PVS: {pvscount}</li>
          <li>CR: {pgsCount ? ((pvscount / pgsCount)*100).toFixed(2) : 'N/A'}%</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default GraphData;
