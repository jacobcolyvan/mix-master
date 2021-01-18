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
  getResults,
  playlistSearchQuery,
  setPlaylistSearchQuery
 }) => {

    const createSearchBars = () => {
      let searchBars;
      if (searchType === "playlist") {
        searchBars =
        <SearchBar
          label={"playlist name"}
          setParam={setPlaylistSearchQuery}
          param={playlistSearchQuery}
          getResults={getResults}
        />
      } else {
        searchBars =
        <div>
          <SearchBar
            label={"artist"}
            setParam={setArtist}
            param={artist}
            getResults={getResults}
          />

          {searchType === "album" ? (
            <SearchBar
              label={"album name"}
              setParam={setAlbumSearchQuery}
              param={albumSearchQuery}
              getResults={getResults}
            />
          ) : (
            <SearchBar
              label={"track name"}
              setParam={setTrackSearchQuery}
              param={trackSearchQuery}
              getResults={getResults}
            />
          )}
        </div>
      }

      return searchBars;
    }




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
        <MenuItem value={'track'}>Tracks</MenuItem>
        <MenuItem value={'album'}>Albums</MenuItem>
        <MenuItem value={'playlist'}>Playlists</MenuItem>
      </Select>

      <SearchBarDiv>
         {createSearchBars()}
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
