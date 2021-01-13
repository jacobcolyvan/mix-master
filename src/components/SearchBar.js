import React from 'react';
// import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';


const SearchBar = ({ label, param, setParam, getResults }) => {

  const searchOnEnter = (e) => {
    if (e.key === "Enter") getResults();
  };

  // const

  return (
    <>
      <TextField
        fullWidth
        label={label}
        onChange={(e) => setParam(e.target.value)}
        style={{ flex: 1, margin: '4px 20px 0 0', color: 'white'}}
        value={param}
        onKeyDown={searchOnEnter}
      />
    </>
  );
};


export default SearchBar;
