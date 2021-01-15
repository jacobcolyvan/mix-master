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
  albums,
  albumName,
  setAlbumName,
  playlistSearchResults
}) => {
  const {tracks} = useContext(UserContext);
  const [sortOption, setSortOption] = useState('tempoThenKey');
  const [keyOption, setKeyOption] = useState('camelot');

  return (
    <div>
      {(albums && !tracks)  && (
        <Albums
          albums={albums}
          setAlbumName={setAlbumName}
        />
      )}

      {tracks && (
        <>
          <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
          <br/>
          {(albumName) ? (
          <AlbumsTitle>{albumName}</AlbumsTitle>
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

      {playlistSearchResults && (
        <>
          <AlbumsTitle>Playlist Results</AlbumsTitle>
          <PlaylistList playlistsToRender={playlistSearchResults} />
        </>
      )}


    </div>
  )
};

export default SearchResults;
