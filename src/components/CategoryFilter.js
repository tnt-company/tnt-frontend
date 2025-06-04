import React, { memo, useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import PropTypes from 'prop-types';

const CategoryFilterComponent = ({
  categories,
  onChange,
  value,
  placeholder,
  style,
  className,
}) => {
  // State for input value
  const [inputValue, setInputValue] = useState('');
  // State for filtered options
  const [options, setOptions] = useState([]);

  // Initialize options and input value when categories or value changes
  useEffect(() => {
    // Set all categories as options
    setOptions(
      categories.map(category => ({
        key: category.id,
        value: category.name,
        label: category.name,
      }))
    );

    // If there's a selected value, update the input field
    if (value) {
      const selectedCategory = categories.find(cat => cat.id === value);
      setInputValue(selectedCategory ? selectedCategory.name : '');
    }
  }, [categories, value]);

  // Handle searching
  const handleSearch = text => {
    setInputValue(text);

    // If text is empty, clear the selection
    if (!text) {
      onChange(undefined);
    }
  };

  // Handle selection
  const handleSelect = (selectedText, option) => {
    setInputValue(selectedText);
    onChange(option.key);
  };

  return (
    <AutoComplete
      value={inputValue}
      options={options}
      style={{ ...style }}
      className={`category-filter ${className || ''}`}
      placeholder={placeholder || 'Filter by Category'}
      onSearch={handleSearch}
      onSelect={handleSelect}
      allowClear
      getPopupContainer={trigger => trigger.parentNode}
      filterOption={(inputValue, option) =>
        option.value.toLowerCase().includes(inputValue.toLowerCase())
      }
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
