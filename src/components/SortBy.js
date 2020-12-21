import React from 'react'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const SortBy = ({sortOption, setSortOption, sorter}) => {
  const sortOptionChange = (event) => {
    setSortOption(event.target.value)
    sorter(event.target.value)
  }

  return (
    <div>
      <Select
        labelId='Sort By:'
        id='sort-by-select'
        value={sortOption}
        onChange={sortOptionChange}
        fullWidth
        variant='outlined'
      >
        <MenuItem value={'default'}>Default</MenuItem>
        <MenuItem value={'key'}>Key</MenuItem>
        <MenuItem value={'tempo'}>Tempo</MenuItem>
      </Select>
    </div>
  )
}

export default SortBy
