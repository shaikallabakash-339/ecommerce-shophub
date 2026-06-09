import React, { useState } from 'react';
import '../styles/FilterSidebar.css';

const FilterSidebar = ({ filterOptions, onFilterChange, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters };
    if (newFilters[key] === value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (min, max) => {
    const newFilters = { ...localFilters, priceMin: min, priceMax: max };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  return (
    <>
      <button className="filter-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰ Filters
      </button>

      <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="close-filter" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="filter-content">
          {/* Gender Filter */}
          {filterOptions.genders && filterOptions.genders.length > 0 && (
            <div className="filter-group">
              <h4>👥 Gender</h4>
              <div className="filter-options">
                {filterOptions.genders.map((gender) => (
                  <label key={gender} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.gender === gender}
                      onChange={() => handleFilterChange('gender', gender)}
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Product Type Filter */}
          {filterOptions.productTypes && filterOptions.productTypes.length > 0 && (
            <div className="filter-group">
              <h4>👕 Type</h4>
              <div className="filter-options">
                {filterOptions.productTypes.map((type) => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.productType === type}
                      onChange={() => handleFilterChange('productType', type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Size Filter */}
          {filterOptions.sizes && filterOptions.sizes.length > 0 && (
            <div className="filter-group">
              <h4>📏 Size</h4>
              <div className="filter-options size-grid">
                {filterOptions.sizes.slice(0, 10).map((size) => (
                  <label key={size} className="size-option">
                    <input
                      type="checkbox"
                      checked={localFilters.sizeFilter === size}
                      onChange={() => handleFilterChange('sizeFilter', size)}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Age Group Filter */}
          {filterOptions.ageGroups && filterOptions.ageGroups.length > 0 && (
            <div className="filter-group">
              <h4>🎂 Age Group</h4>
              <div className="filter-options">
                {filterOptions.ageGroups.map((age) => (
                  <label key={age} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={localFilters.ageGroup === age}
                      onChange={() => handleFilterChange('ageGroup', age)}
                    />
                    <span>{age}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          {filterOptions.priceRange && (
            <div className="filter-group">
              <h4>💰 Price</h4>
              <div className="price-range">
                <input
                  type="range"
                  min={filterOptions.priceRange.min}
                  max={filterOptions.priceRange.max}
                  value={localFilters.priceMax || filterOptions.priceRange.max}
                  onChange={(e) =>
                    handlePriceChange(
                      localFilters.priceMin || filterOptions.priceRange.min,
                      e.target.value
                    )
                  }
                  className="price-slider"
                />
                <p className="price-display">
                  ₹{localFilters.priceMin || filterOptions.priceRange.min} - ₹
                  {localFilters.priceMax || filterOptions.priceRange.max}
                </p>
              </div>
            </div>
          )}

          {/* Sale Items Only */}
          <div className="filter-group">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={localFilters.onSale === 'true'}
                onChange={() =>
                  handleFilterChange('onSale', localFilters.onSale === 'true' ? undefined : 'true')
                }
              />
              <span>🔥 Sale Items Only</span>
            </label>
          </div>
        </div>

        <button className="reset-filters" onClick={handleReset}>
          🔄 Reset Filters
        </button>
      </aside>
    </>
  );
};

export default FilterSidebar;
