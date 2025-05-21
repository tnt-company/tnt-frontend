import React, { useState, useEffect, useCallback, memo } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Search } = Input;

const SearchInputComponent = ({ placeholder, onSearch, style, className, defaultValue = '' }) => {
  const [searchText, setSearchText] = useState(defaultValue);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Handle immediate input change
  const handleChange = useCallback(e => {
    setSearchText(e.target.value);
  }, []);

  // Debounce the search text and call onSearch
  useEffect(() => {
    // Skip only the very first render
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    const timer = setTimeout(() => {
      // Always call onSearch, even with empty string
      onSearch(searchText);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(timer);
    };
  }, [searchText, onSearch, isInitialRender]);

  return (
    <Search
      placeholder={placeholder}
      value={searchText}
      onChange={handleChange}
      prefix={<SearchOutlined />}
      allowClear
      style={{ ...style }}
      className={`search-input ${className || ''}`}
    />
  );
};

const SearchInput = memo(SearchInputComponent);

SearchInput.displayName = 'SearchInput';

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  style: PropTypes.object,
  className: PropTypes.string,
  defaultValue: PropTypes.string,
};

export default SearchInput;
