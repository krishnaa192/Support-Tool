import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './select.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCheckSquare, faChevronDown, faSquare } from '@fortawesome/free-solid-svg-icons';

const MultiSelectDropdown = ({ id, title, options = [], selectedValue = '', setSelectedValue }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [sortedOptions, setSortedOptions] = useState([]);

  useEffect(() => {
    // Sort options in ascending order
    const sorted = [...options].sort();
    setSortedOptions(sorted);

    if (selectedValue === 'all') {
      setSelectedOptions(sorted);
    } else {
      setSelectedOptions(
        typeof selectedValue === 'string' 
          ? selectedValue.split(',').filter(Boolean) 
          : []
      );
    }
  }, [selectedValue, options]);

  const handleCheckboxChange = (value) => {
    if (value === 'all') {
      if (isAllSelected()) {
        setSelectedOptions([]);
        setSelectedValue('');
      } else {
        setSelectedOptions(sortedOptions);
        setSelectedValue('all');
      }
    } else {
      setSelectedOptions(prevSelected => {
        const newSelection = prevSelected.includes(value)
          ? prevSelected.filter(item => item !== value)
          : [...prevSelected, value];
        
        const allSelected = newSelection.length === sortedOptions.length;
        setSelectedValue(allSelected ? 'all' : newSelection.join(','));
        return newSelection;
      });
    }
  };

  const handleClear = () => {
    setSelectedOptions([]);
    setSelectedValue('');
  };

  const isSelected = (value) => selectedOptions.includes(value);

  const isAllSelected = () => selectedOptions.length === sortedOptions.length && sortedOptions.length > 0;

  return (
    <div className="multi-select-dropdown">
      <button className="dropdown-toggle" type="button">
        {title} <FontAwesomeIcon icon={faChevronDown} />
      </button>
      <div className="dropdown-menu">
        <div className="checkbox-list">
          {Array.isArray(sortedOptions) && sortedOptions.map((option, index) => (
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
          <button onClick={() => handleCheckboxChange('all')}>
            <FontAwesomeIcon icon={isAllSelected() ? faCheckSquare : faSquare} /> All
          </button>
          <button onClick={handleClear}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      </div>
    </div>
  );
};

MultiSelectDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  selectedValue: PropTypes.string,
  setSelectedValue: PropTypes.func.isRequired,
};

export default MultiSelectDropdown;
