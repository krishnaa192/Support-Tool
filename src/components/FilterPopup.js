// FilterPopup.js
import React from 'react';
import MultiSelectDropdown from './MultiSelect';
import './FilterPopup.css';

const FilterPopup = ({ filters, setFilters, onClose }) => {
  const handleFilterChange = (field, selectedValue) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: selectedValue
    }));
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button onClick={onClose} className="close-btn">×</button>
        <h2>Filter Options</h2>
        <MultiSelectDropdown
          id="territory-filter"
          title="Territory"
          options={filters.territoryOptions}
          selectedValue={filters.territory}
          setSelectedValue={value => handleFilterChange('territory', value)}
        />
        <MultiSelectDropdown
          id="operator-filter"
          title="Operator"
          options={filters.operatorOptions}
          selectedValue={filters.operator}
          setSelectedValue={value => handleFilterChange('operator', value)}
        />
        <MultiSelectDropdown
          id="biller-name-filter"
          title="Biller Name"
          options={filters.billerOptions}
          selectedValue={filters.biller}
          setSelectedValue={value => handleFilterChange('biller', value)}
        />
        <MultiSelectDropdown
          id="service-name-filter"
          title="Service Name"
          options={filters.serviceNameOptions}
          selectedValue={filters.serviceName}
          setSelectedValue={value => handleFilterChange('serviceName', value)}
        />
        <MultiSelectDropdown
          id="ad-partner-filter"
          title="Ad Partner"
          options={filters.adPartnerOptions}
          selectedValue={filters.adPartner}
          setSelectedValue={value => handleFilterChange('adPartner', value)}
        />
        <MultiSelectDropdown
          id="service-partner-filter"
          title="Service Partner"
          options={filters.servicePartnerOptions}
          selectedValue={filters.servicePartner}
          setSelectedValue={value => handleFilterChange('servicePartner', value)}
        />
      </div>
    </div>
  );
};

export default FilterPopup;
