import React from 'react';
import styled from 'styled-components';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import SearchBar from '../components/SearchBar';

const ButtonDiv = styled.div`
  margin-top: 48px;
`

const SearchBarDiv = styled.div`
  margin-top: 24px;
  padding-left: 4px;
  padding-right: 4px;

  div {
    margin-bottom: 12px;
  }
`

const SearchOptions = ({
  searchType,
  setSearchType,
  artist,
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

      <SearchBarDiv>
        <SearchBar
          label={"artist"}
          setParam={setArtist}
          param={artist}
          getResults={getResults}
        />

        {searchType === "album" ?
          <SearchBar
            label={"album name"}
            setParam={setAlbumSearchQuery}
            param={albumSearchQuery}
            getResults={getResults}
          /> :
          <SearchBar
            label={"track name"}
            setParam={setTrackSearchQuery}
            param={trackSearchQuery}
            getResults={getResults}
          />
        }
       </SearchBarDiv>


      <ButtonDiv>
        <Button
          variant='outlined'
          color='primary'
          onClick={getResults}
          className="button"
          fullWidth
        >
          Search
        </ Button>
      </ButtonDiv>
    </div>
  )
};

export default SearchOptions;
