import React, { useContext, useState }  from 'react';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Albums from './Albums';
import Tracks from './Tracks'

import SortBy from './SortBy';
import KeySelect from './KeySelect';

const AlbumsTitle = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const SearchResults = ({
  albums
}) => {
  const {tracks} = useContext(UserContext);

  const [sortOption, setSortOption] = useState('tempoThenKey');
  const [keyOption, setKeyOption] = useState('camelot');
  const [albumName, setAlbumName] = useState(false);



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
          {albumName && <AlbumsTitle>{albumName}</AlbumsTitle>}
          <SortBy sortOption={sortOption} setSortOption={setSortOption} />
          <br/>

          <Tracks
            sortOption={sortOption}
            keyOption={keyOption}
          />
        </>
      )}


    </div>
  )
};

export default SearchResults;
