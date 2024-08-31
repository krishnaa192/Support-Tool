import React, { useState } from 'react';
import MultiSelectDropdown from './MultiSelectDropdown'; // Make sure to adjust the import path accordingly

const FilterButton = ({ uniqueTerritory, territoryFilter, setTerritoryFilter, 
                        uniqueOperator, operatorFilter, setOperatorFilter,
                        uniqueBillerName, billerNameFilter, setBillerNameFilter,
                        uniqueServiceName, serviceNameFilter, setServiceNameFilter,
                        uniqueAdPartners, adPartnerFilter, setAdPartnerFilter,
                        uniqueServicePartner, servicePartnerFilter, setServicePartnerFilter
                      }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
        Filter
      </button>
      {showFilters && (
        <div className="filter-dropdown">
          <MultiSelectDropdown
            id="territory-filter"
            title="Territory"
            options={uniqueTerritory}
            selectedValue={territoryFilter}
            setSelectedValue={setTerritoryFilter}
          />
          <MultiSelectDropdown
            id="operator-filter"
            title="Operator"
            options={uniqueOperator}
            selectedValue={operatorFilter}
            setSelectedValue={setOperatorFilter}
          />
          <MultiSelectDropdown
            id="biller-name-filter"
            title="Biller Name"
            options={uniqueBillerName}
            selectedValue={billerNameFilter}
            setSelectedValue={setBillerNameFilter}
          />
          <MultiSelectDropdown
            id="service-name-filter"
            title="Service Name"
            options={uniqueServiceName}
            selectedValue={serviceNameFilter}
            setSelectedValue={setServiceNameFilter}
          />
          <MultiSelectDropdown
            id="ad-partner-filter"
            title="Ad Partner"
            options={uniqueAdPartners}
            selectedValue={adPartnerFilter}
            setSelectedValue={setAdPartnerFilter}
          />
          <MultiSelectDropdown
            id="service-partner-filter"
            title="Service Partner"
            options={uniqueServicePartner}
            selectedValue={servicePartnerFilter}
            setSelectedValue={setServicePartnerFilter}
          />
        </div>
      )}
    </>
  );
};

export default FilterButton;
