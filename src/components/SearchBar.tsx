import React from 'react';
import TextField from '@material-ui/core/TextField';

interface SearchBarProps {
  label: string;
  param: string;
  setParam: any; // TODO
  paramName: string;
  getResults: any; // TODO
}

const SearchBar: React.FC<SearchBarProps> = ({
  label,
  param,
  setParam,
  paramName,
  getResults,
}) => {
  const searchOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') getResults();
  };

  return (
    <TextField
      className="searchbar-textfield"
      fullWidth
      label={label}
      onChange={(e) => setParam(paramName, e.target.value)}
      value={param}
      onKeyDown={searchOnEnter}
    />
  );
};

export default SearchBar;
