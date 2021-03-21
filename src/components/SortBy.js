import React from 'react'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const SortBy = ({sortOption, setSortOption, sorter}) => {
  const sortOptionChange = (event) => {
    setSortOption(event.target.value)
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
        <MenuItem value={'default'}>Original Order</MenuItem>
        <MenuItem value={'key'}>Sort by Key</MenuItem>
        <MenuItem value={'tempo'}>Sort by Tempo</MenuItem>
        <MenuItem value={'tempoThenKey'}>Sort by Tempo, then Key</MenuItem>
      </Select>
    </div>
  )
}

export default SortBy
