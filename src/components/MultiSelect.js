import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './select.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCheckSquare, faChevronDown, faSquare } from '@fortawesome/free-solid-svg-icons';

const MultiSelectDropdown = ({ id, title, options = [], selectedValue = '', setSelectedValue }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [sortedOptions, setSortedOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Sort options in ascending order
    const sorted = [...options].sort();
    setSortedOptions(sorted);

    // Filter options based on search query
    const filtered = sorted.filter(option => {
      if (typeof option === 'string') {
        return option.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
    setFilteredOptions(filtered);

    if (selectedValue === 'all') {
      setSelectedOptions(sorted);
    } else {
      setSelectedOptions(
        typeof selectedValue === 'string' 
          ? selectedValue.split(',').filter(Boolean) 
          : []
      );
    }
  }, [selectedValue, options, searchQuery]);

  const handleCheckboxChange = (value) => {
    if (value === 'all') {
      if (isAllSelected()) {
        setSelectedOptions([]);
        setSelectedValue('');
      }
       else {
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
    setSearchQuery(''); // Clear the search query when clearing selections
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const isSelected = (value) => selectedOptions.includes(value);

  const isAllSelected = () => selectedOptions.length === sortedOptions.length && sortedOptions.length > 0;

  return (
    <div className="multi-select-dropdown">
      <button className="dropdown-toggle" type="button">
        {title} <FontAwesomeIcon icon={faChevronDown} />
      </button>
      <div className="dropdown-menu">
        <input
          type="text"
          className="search-filter"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="checkbox-list">
          {Array.isArray(filteredOptions) && filteredOptions.map((option, index) => (
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
