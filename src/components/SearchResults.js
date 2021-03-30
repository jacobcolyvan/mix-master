import React, { useContext, useState }  from 'react';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Albums from './Albums';
import Tracks from './Tracks';
import PlaylistList from './PlaylistList';

import SortBy from './SortBy';
import KeySelect from './KeySelect';

const AlbumsTitle = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const SearchResults = ({
  handleResultsChange,
  showOnlyPlaylistTracks,
  searchResultValues
}) => {
  const {tracks, playlist} = useContext(UserContext);
  const [sortOption, setSortOption] = useState('default');
  const [keyOption, setKeyOption] = useState('camelot');

  return (
    <div>
      {(searchResultValues.albums && !tracks)  && (
        <Albums
          albums={searchResultValues.albums}
          handleResultsChange={handleResultsChange}
        />
      )}

      {(!playlist && tracks) && (
        <>
          <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
          <br/>
          {(searchResultValues.albumName) ? (
            <AlbumsTitle>{searchResultValues.albumName}</AlbumsTitle>
          ) : (
            <AlbumsTitle>Track Results</AlbumsTitle>
          )}
          <SortBy sortOption={sortOption} setSortOption={setSortOption} />
          <br/>

          <Tracks
            sortOption={sortOption}
            keyOption={keyOption}
          />
        </>
      )}

      {searchResultValues.playlistSearchResults && (
        <>
          <AlbumsTitle>Playlist Results</AlbumsTitle>
          <PlaylistList
            playlistsToRender={searchResultValues.playlistSearchResults}
            showOnlyPlaylistTracks={showOnlyPlaylistTracks}
          />
        </>
      )}


    </div>
  )
};

export default SearchResults;
