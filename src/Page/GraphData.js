import React, { useState, useEffect } from 'react';
import BarChart from '../Graph/BarGraph';
import LinearChart from '../Graph/Graph';
import { processDataByServiceId } from '../utils';
import { ApiRequest, dailyData } from '../APi';
import '../css/D3chart.css';
import '../css/Modal.css';
import Loading from '../components/Loading';
import { FaWindowClose } from "react-icons/fa";
import { preprocess } from '../preprocess';

const GraphData = ({ isOpen, onClose, serviceId }) => {
  const [data, setData] = useState({});
  const [weekly, setWeekly] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest();
        const processedData = processDataByServiceId(response);
        setData(processedData);

        const weeklyData = await dailyData();
        const processedWeeklyData = preprocess(weeklyData);

        // Filter the processed weekly data by serviceId
        const filteredWeeklyData = processedWeeklyData.filter(
          item => String(item.info.appServiceId) === String(serviceId)
        );

        setWeekly(Array.isArray(filteredWeeklyData) ? filteredWeeklyData : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  useEffect(() => {
    if (serviceId && data[serviceId]) {
      setSelectedData(data[serviceId]);
    }
  }, [serviceId, data]);
//loading

if (loading) {
  return <Loading />;
}
  const getCurrentDate = new Date();
  const chartData = selectedData
    ? selectedData.hours.map((hour, index) => ({
        date: new Date(getCurrentDate.getFullYear(), getCurrentDate.getMonth(), getCurrentDate.getDate(), index),
        pingenCount: hour.pingenCount,
        pingenCountSuccess: hour.pingenCountSuccess,
        pinverCount: hour.pinverCount,
        pinverCountSuccess: hour.pinverCountSuccess,
      }))
    : [];

  // Calculate totals
  const pgCount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pingenCount, 0) : 0;
  const pgsCount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pingenCountSuccess, 0) : 0;
  const pvCount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pinverCount, 0) : 0;
  const pvsCount = selectedData ? selectedData.hours.reduce((acc, curr) => acc + curr.pinverCountSuccess, 0) : 0;
// Function to format the date to MM/DD/YYYY
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Modify barChartData according to the preprocess function
const barChartData = weekly.flatMap(item => 
  item.dailyCounts.map(dailyItem => ({
    date: formatDate(dailyItem.entryDate), // Format the date here
    pingenCount: dailyItem.pinGenReqCount,
    pinverCount: dailyItem.pinVerReqCount,
    pingenCountSuccess: dailyItem.pinGenSucCount,
    pinverCountSuccess: dailyItem.pinVerSucCount,
    cr: dailyItem.pinGenReqCount > 0
      ? ((dailyItem.pinVerSucCount / dailyItem.pinGenReqCount) * 100).toFixed(2)
      : 'N/A',
  }))
);


  // Add loading spinner
  if (!selectedData) {
    return <Loading />;
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        <div className="graph-data">
        <button onClick={onClose} aria-label="Close modal">
          <FaWindowClose className="exit" />
        </button>
          <div className="data-card">
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
          <div className="graph-cont">
          <h2> PVS Graph</h2>
          <div className="graph">
          
            {selectedData && chartData.length > 0 && (
              <LinearChart data={chartData} title={`PVS for Service ID ${serviceId}`} />
            )}
            <div className="data-stats">
              <ul>
                <li>Total PG: {pgCount}</li>
                <li>Total PGS: {pgsCount}</li>
                <li>Total PV: {pvCount}</li>
                <li>Total PVS: {pvsCount}</li>
                <li>CR: {pgsCount ? ((pvsCount / pgCount) * 100).toFixed(2) : 'N/A'}%</li>
              </ul>
            </div>
          </div>
          </div>
{/* add condition that if barChartData exist for this  then render
 */}
{barChartData && barChartData.length > 0 ? (
  <div className="graph-cont">
    <h2>Weekly PG, PGS, PV, and PVS Data</h2>
    <div className="graph">
      <BarChart data={barChartData} />
      <div className="data-table">
        <table className="weekly-data-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>PG</th>
              <th>PV</th>
              <th>CR (%)</th>
            </tr>
          </thead>
          <tbody>
            {barChartData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td className='condensed'>{item.pingenCount}</td>
                <td className='condensed'>{item.pinverCount}</td>
                <td className='condensed'>{((item.pinverCountSuccess / item.pingenCount) * 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
) : (
  <div className="graph-cont">
  <h2>Weekly PG, PGS, PV, and PVS Data</h2>
  <div className="graph">
      <h2>No data available for this service</h2>
   </div>
   </div>
)}

        </div>
                
      </div>
    </div>
  );
};

export default GraphData;
