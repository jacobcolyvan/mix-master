import React, {useState, useContext} from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';

const SearchTitle = styled.h1`
  text-decoration: underline;
  font-style: italic;
`

// TODO: seperate followed and owned playlists
//       add error handling for search without


const Search = () => {
  const {token, setTracks, setSortedTracks} = useContext(UserContext);

  const [searchType, setSearchType] = useState('album');

  const [currentSearchResults, setCurrentSearchResults] = useState(false);
  const [albums, setAlbums] = useState(false);

  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [artist, setArtist] = useState(false);


  const createRequestUrl = () => {
    if (searchType === 'album') {
      return `https://api.spotify.com/v1/search?q=${albumSearchQuery ? 'album%3A$' + encodeURI(albumSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20' : encodeURI('jon hopkins')}&type=album`
    } else {
      return `https://api.spotify.com/v1/search?q=${trackSearchQuery ? 'album%3A$' + encodeURI(trackSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20' : encodeURI('jon hopkins')}&type=track`
    }
  }

  const getTrackFeatures = async (tracks) => {
    const trackIds = tracks.map((item) => item.id);
    const featuresResponse = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    const trackFeatures = [featuresResponse.data.audio_features];
    const splicedTracks = tracks.map((item, index) => {
      return {
        "name": item.name,
        "artists": item.artists.length > 1 ? [item.artists[0].name, item.artists[1].name] : [item.artists[0].name],
        "id": item.id,
        "tempo": Math.round(trackFeatures[0][index].tempo),
        "key": trackFeatures[0][index].key,
        "mode": parseInt(trackFeatures[0][index].mode)
      }
    })

    setSortedTracks([...splicedTracks]);
    setTracks([...splicedTracks]);
  }


  // useCallback() here?
  const getResults = async () => {
    try {
      const response = await axios({
        method: 'get',
        url: createRequestUrl(),
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      if (searchType === 'album') {
        setAlbums(response.data.albums.items);
      } else {
        getTrackFeatures(response.data.tracks.items);
      }

      setCurrentSearchResults(true);
    } catch (err) {
      console.log(err.message);
    }
  };


  return (
    <div>
      <SearchTitle>Search</SearchTitle>

      {!currentSearchResults ? (
        <SearchOptions
          searchType={searchType}
          setSearchType={setSearchType}
          setArtist={setArtist}
          setAlbumSearchQuery={setAlbumSearchQuery}
          setTrackSearchQuery={setTrackSearchQuery}
          getResults={getResults}
        />
        ) : (
        <SearchResults
          albums={albums}
        />
      )}
    </div>
  )
};

export default Search;
