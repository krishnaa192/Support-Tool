import React, { useState, useEffect } from 'react';
import BarChart from '../Graph/BarGraph';
import LinearChart from '../Graph/Graph';
import { processDataByServiceId } from '../utils';
import { ApiRequest,dailyData } from '../APi';
import '../css/D3chart.css';
import '../css/Modal.css'
import Loading from '../components/Loading';
import { FaWindowClose } from "react-icons/fa";
import {preprocess} from '../preprocess' 




const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
  marginTop: '20px'
};

const thStyle = {
  border: '1px solid #dddddd',
  textAlign: 'left',
  padding: '8px',
  backgroundColor: '#f2f2f2'
};

const tdStyle = {
  border: '1px solid #dddddd',
  textAlign: 'right',
  padding: '8px'
};

const GraphData = ({ isOpen, onClose, serviceId }) => {

  // Extract serviceId from route parameters

  const [data, setData] = useState({});
  const [weekli,getweekly]=useState({});
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiRequest();
        const processedData = processDataByServiceId(response);
        setData(processedData);
        const WeeklyData= await dailyData();
        console.log(WeeklyData)
        const getWeekly=preprocess(WeeklyData)
        console.log(getWeekly,"Weeklydata")
        getweekly(getWeekly)
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Fetch data once on mount
console.log("weeky",weekli)

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
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}><FaWindowClose className='exit' /></button>

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




          <div className='graph'>

            {selectedData && chartData.length > 0 && (
              <LinearChart
                data={chartData}
                title={`PVS for Service ID ${serviceId}`}
              />
            )}


            <div className='data-stats'>

              <ul>
                <li>Total PG: {pgCount}</li>
                <li>Total PGS: {pgsCount}</li>
                <li>Total PV: {pvcount}</li>
                <li>Total PVS: {pvscount}</li>
                <li>CR: {pgsCount ? ((pvscount / pgsCount) * 100).toFixed(2) : 'N/A'}%</li>
              </ul>
            </div>
          </div>
          <div className='graph-cont'>
          <h2>Weekly PG, PGS, PV, and PVS Data</h2>
          <div className='graph'>
        
            <BarChart 
            />
            <div className='data-table'>
         
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Day</th>
                    <th style={thStyle}>PG</th>
                    <th style={thStyle}>PV</th>
                    <th style={thStyle}>CR (%)</th>
                  </tr>
                </thead>
                <tbody>

                  <tr >
                    <td style={tdStyle}>Monday</td>
                    <td style={tdStyle}>pg</td>
                    <td style={tdStyle}>pv</td>
                    <td style={tdStyle}>24%</td>

                </tr>

              </tbody>
            </table>

          </div>
        </div>
        </div>
      </div>
    </div>
    </div >
  );
};

export default GraphData;
