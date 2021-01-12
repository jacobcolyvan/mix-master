import React from 'react';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import SearchBar from '../components/SearchBar';

const SearchOptions = ({
  searchType,
  setSearchType,
  setArtist,
  setAlbumSearchQuery,
  albumSearchQuery,
  trackSearchQuery,
  setTrackSearchQuery,
  getResults }) => {

  return (
    <div>
      <Select
        labelId='Search Type'
        id='search-type'
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        fullWidth
        variant='outlined'
      >
        <MenuItem value={'album'}>Album</MenuItem>
        <MenuItem value={'track'}>Track</MenuItem>
      </Select>

      <SearchBar label={"artist"} setParam={setArtist} />
      <br/>

      {searchType === "album" ?
        <SearchBar label={"album name"} setParam={setAlbumSearchQuery} param={albumSearchQuery} /> :
        <SearchBar label={"track name"} setParam={setTrackSearchQuery} param={trackSearchQuery}/>
       }

      <br/><br/><br/>

      < Button
        variant='outlined'
        color='primary'
        onClick={getResults}
        className="button"
        fullWidth
      >
        Search
      </ Button>
    </div>
  )
};

export default SearchOptions;
