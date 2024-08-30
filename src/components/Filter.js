import React, { useState } from 'react';
import './FIlter.css';

const MultiFilter = () => {
  const [selectedOptions, setSelectedOptions] = useState({});

  const DemoData = [
    { id: 1, name: 'John Doe', age: 32 },
    { id: 2, name: 'Jane Doe', age: 25 },
    { id: 3, name: 'James Smith', age: 45 },
    { id: 4, name: 'Jill Smith', age: 35 },
    { id: 5, name: 'John Doe', age: 32 },
    { id: 6, name: 'Jane Doe', age: 25 },
    { id: 7, name: 'James Smith', age: 45 },

  ];

  const handleCheckboxChange = (id) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  return (
    <div className='filter-main'>
      <div className='filter-container'>
        <div className='filter'>
          <label htmlFor='dropdown'>Filter by 1: Territory</label>
          <div className='dropdown'>
            <input type='text' id='search' placeholder='Search...' />
            <br />
            <input type='checkbox' id='checkbox-1' />
            <label htmlFor='checkbox' >All</label>
            {DemoData.map((data) => (
              <div key={data.id} className='dropdown-option'>
                <input
                  type='checkbox'
                  id={`checkbox-${data.id}`}
                  checked={selectedOptions[data.id] || false}
                  onChange={() => handleCheckboxChange(data.id)}
                />
                <label htmlFor={`checkbox-${data.id}`}>{data.name}</label>
              </div>
            ))}
          </div>
        </div>
        <div className='filter'>
          <label htmlFor='dropdown'>Filter by 2: operator</label>
          <div className='dropdown'>
            <input type='text' id='search' placeholder='Search...' />
            <br />
            <input type='checkbox' id='checkbox-1' />

            <label htmlFor='checkbox-1' >All</label>
            {DemoData.map((data) => (
              <div key={data.id} className='dropdown-option'>
                <input
                  type='checkbox'
                  id={`checkbox-${data.id}`}
                  checked={selectedOptions[data.id] || false}
                  onChange={() => handleCheckboxChange(data.id)}
                />
                <label htmlFor={`checkbox-${data.id}`}>{data.name}</label>
              </div>
            ))}
          </div>
        </div>
        <div className='filter'>
          <label htmlFor='dropdown'>Filter by :Biller
          </label>
          <div className='dropdown'>

            <input type='text' id='search' placeholder='Search...' />
            <br />
            <input type='checkbox' id='checkbox-1' />

            <label htmlFor='checkbox-1' >All</label>
            {DemoData.map((data) => (
              <div key={data.id} className='dropdown-option'>
                <input
                  type='checkbox'
                  id={`checkbox-${data.id}`}
                  checked={selectedOptions[data.id] || false}
                  onChange={() => handleCheckboxChange(data.id)}
                />
                <label htmlFor={`checkbox-${data.id}`}>{data.name}</label>

              </div>
            ))}
          </div>
        </div>
        <div className='filter'>
          <label htmlFor='dropdown'>Filter by :Service Name</label>
          <div className='dropdown'>
            <input type='text' id='search' placeholder='Search...' />
            <br />
            <input type='checkbox' id='checkbox-1' />

            <label htmlFor='checkbox-1' >All</label>
            {DemoData.map((data) => (
              <div key={data.id} className='dropdown-option'>
                <input
                  type='checkbox'
                  id={`checkbox-${data.id}`}
                  checked={selectedOptions[data.id] || false}
                  onChange={() => handleCheckboxChange(data.id)}
                />
                <label htmlFor={`checkbox-${data.id}`}>{data.name}</label>

              </div>
            ))}
          </div>
        </div>
        <div className='filter'>
          <label htmlFor='dropdown'>Filter by:Partner</label>
          <div className='dropdown'>
            <input type='text' id='search' placeholder='Search...' />
            <br />
            <input type='checkbox' id='checkbox-1' />

            <label htmlFor='checkbox-1' >All</label>
            {DemoData.map((data) => (
              <div key={data.id} className='dropdown-option'>
                <input
                  type='checkbox'
                  id={`checkbox-${data.id}`}
                  checked={selectedOptions[data.id] || false}
                  onChange={() => handleCheckboxChange(data.id)}
                />
                <label htmlFor={`checkbox-${data.id}`}>{data.name}</label>

              </div>
            ))}
          </div>
        </div>
        <div className='filter'>
          <label htmlFor='dropdown'>Filter by:Service Partner</label>
          <div className='dropdown'>
            <input type='text' id='search' placeholder='Search...' />
            <br />
            <input type='checkbox' id='checkbox-1' />

            <label htmlFor='checkbox-1' >All</label>
            {DemoData.map((data) => (
              <div key={data.id} className='dropdown-option'>
                <input
                  type='checkbox'
                  id={`checkbox-${data.id}`}
                  checked={selectedOptions[data.id] || false}
                  onChange={() => handleCheckboxChange(data.id)}
                />
                <label htmlFor={`checkbox-${data.id}`}>{data.name}</label>

              </div>
            ))}

          </div>
        </div>
      </div>
      <div className='button-filter'>
     
        <button>Reset All Selection </button>
        <button>Apply</button>
      </div>

    </div>
  );
};

export default MultiFilter;
