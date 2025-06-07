import React, { memo } from 'react';
import Select, { components } from 'react-select';
import PropTypes from 'prop-types';

const CategoryFilterComponent = ({
  categories,
  onChange,
  value,
  placeholder,
  style,
  className,
}) => {
  // Format categories for react-select
  const options = categories.map(category => ({
    value: category.id,
    label: category.name,
  }));

  // Find the currently selected option
  const selectedOption =
    value && options.length ? options.find(option => option.value === value) || null : null;

  // Handle selection
  const handleChange = selected => {
    onChange(selected ? selected.value : undefined);
  };

  // Custom dropdown indicator
  const customSelectComponents = {
    DropdownIndicator: props => {
      return (
        <components.DropdownIndicator {...props}>
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            className="css-8mmkcg"
          >
            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
          </svg>
        </components.DropdownIndicator>
      );
    },
  };

  return (
    <Select
      className={`category-filter ${className || ''}`}
      classNamePrefix="react-select"
      placeholder={placeholder || 'Filter by Category'}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      isClearable
      isSearchable
      components={customSelectComponents}
      styles={{
        container: provided => ({
          ...provided,
          width: '100%',
          ...style,
        }),
        control: provided => ({
          ...provided,
          minHeight: '32px',
          cursor: 'pointer',
        }),
        valueContainer: provided => ({
          ...provided,
          padding: '0 8px',
        }),
        indicatorsContainer: provided => ({
          ...provided,
          height: '32px',
        }),
        menu: provided => ({
          ...provided,
          zIndex: 1050,
        }),
      }}
    />
  );
};

const CategoryFilter = memo(CategoryFilterComponent);

CategoryFilter.displayName = 'CategoryFilter';

CategoryFilter.propTypes = {
  categories: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
};

export default CategoryFilter;
