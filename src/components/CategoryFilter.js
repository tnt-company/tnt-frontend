import React, { memo } from 'react';
import { Select } from 'antd';
import PropTypes from 'prop-types';

const CategoryFilterComponent = ({
  categories,
  onChange,
  value,
  placeholder,
  style,
  className,
}) => {
  return (
    <Select
      placeholder={placeholder || 'Filter by Category'}
      onChange={onChange}
      value={value}
      style={{ ...style }}
      className={`category-filter ${className || ''}`}
      allowClear
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={categories.map(category => ({
        value: category.id,
        label: category.name,
      }))}
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
