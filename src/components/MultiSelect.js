import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../css/select.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faChevronDown, faSquare, faFilter } from '@fortawesome/free-solid-svg-icons';

const MultiSelectDropdown = ({ id, title, options = [], selectedValue = '', setSelectedValue }) => {
  const [tempSelectedOptions, setTempSelectedOptions] = useState([]); // Temp state for selections
  const [sortedOptions, setSortedOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplied, setIsApplied] = useState(false); // Track if "Apply" has been pressed

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

    // Initialize tempSelectedOptions based on selectedValue
    if (selectedValue === 'all') {
      setTempSelectedOptions(sorted);
    } else {
      setTempSelectedOptions(
        typeof selectedValue === 'string'
          ? selectedValue.split(',').filter(Boolean)
          : []
      );
    }
  }, [selectedValue, options, searchQuery]);

  const handleCheckboxChange = (value) => {
    if (value === 'all') {
      if (isAllSelected()) {
        setTempSelectedOptions([]);
      } else {
        setTempSelectedOptions(sortedOptions);
      }
    } else {
      setTempSelectedOptions(prevSelected => {
        const newSelection = prevSelected.includes(value)
          ? prevSelected.filter(item => item !== value)
          : [...prevSelected, value];
        return newSelection;
      });
    }
  };

  const handleApply = () => {
    // Apply the temporary selected options when the Apply button is clicked
    setSelectedValue(tempSelectedOptions.join(','))
    setIsApplied(true); // Mark as applied
  };
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    //when all query result is chooseed it chose all option
    if (event.target.value === '') {
      setTempSelectedOptions(sortedOptions);
    }
  };
  const isSelected = (value) => tempSelectedOptions.includes(value);
  const isAllSelected = () => tempSelectedOptions.length === sortedOptions.length && sortedOptions.length > 0;
  //after applyin filter on pressing apply button but when from unchecking all option checking all option again without usign apply it should not show filter icon

  return (
    <div className="multi-select-dropdown">
      <button className="dropdown-toggle" type="button">
        {title} 
        <FontAwesomeIcon icon={faChevronDown} />
        {/* Show the filter icon only after applying and not all options are selected */}
        {isApplied && !isAllSelected()   && <FontAwesomeIcon icon={faFilter} style={{ marginLeft: '8px', color: 'red' }} />}
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
          <button className='apply' onClick={handleApply}>
            Apply
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
