import React, { useState, useEffect } from 'react';

const MultiSelectDropdown = ({ id, title, options, selectedValue, setSelectedValue }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Effect to update selectedOptions when selectedValue changes
  useEffect(() => {
    if (selectedValue === 'all') {
      setSelectedOptions(options);
    } else {
      setSelectedOptions(selectedValue.split(','));
    }
  }, [selectedValue, options]);

  const handleCheckboxChange = (value) => {
    if (value === 'all') {
      if (selectedOptions.length === options.length) {
        setSelectedOptions([]);
        setSelectedValue('');
      } else {
        setSelectedOptions(options);
        setSelectedValue('all');
      }
    } else {
      setSelectedOptions(prevSelected => {
        const newSelection = prevSelected.includes(value)
          ? prevSelected.filter(item => item !== value)
          : [...prevSelected, value];
        if (newSelection.length === options.length) {
          setSelectedValue('all');
        } else {
          setSelectedValue(newSelection.join(','));
        }
        return newSelection;
      });
    }
  };

  const handleClear = () => {
    setSelectedOptions([]);
    setSelectedValue('');
  };

  const handleSort = () => {
    const sorted = [...selectedOptions].sort();
    setSelectedOptions(sorted);
    setSelectedValue(sorted.join(','));
  };

  const handleApply = () => {
    setSelectedValue(selectedOptions.length === options.length ? 'all' : selectedOptions.join(','));
  };

  const isSelected = (value) => selectedOptions.includes(value);

  return (
    <div className="multi-select-dropdown">
      <button className="dropdown-toggle" type="button">
        {title}
      </button>
      <div className="dropdown-menu">
        <div className="checkbox-list">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id={`${id}-checkbox-all`}
              value="all"
              checked={selectedOptions.length === options.length}
              onChange={() => handleCheckboxChange('all')}
            />
            <label htmlFor={`${id}-checkbox-all`}>All</label>
          </div>
          {options.map((option, index) => (
            <div key={index} className="checkbox-item">
              <input
                type="checkbox"
                id={`${id}-checkbox-${index}`}
                value={option}
                checked={isSelected(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <label htmlFor={`${id}-checkbox-${index}`}>
                {option}
              </label>
            </div>
          ))}
        </div>
        <div className="dropdown-buttons">
          <button onClick={handleSort}>Sort</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleApply}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
