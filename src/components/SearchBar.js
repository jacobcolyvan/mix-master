import React from 'react';
import TextField from '@material-ui/core/TextField';

const SearchBar = ({ label, param, paramName, setParam, getResults }) => {
  const searchOnEnter = (e) => {
    if (e.key === 'Enter') getResults();
  };

  return (
    <>
      <TextField
        className="searchbar-textfield"
        fullWidth
        label={label}
        onChange={(e) => setParam(paramName, e.target.value)}
        value={param}
        onKeyDown={searchOnEnter}
      />
    </>
  );
};

export default SearchBar;
