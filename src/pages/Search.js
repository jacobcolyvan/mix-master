import React, {useState, useContext} from 'react';
import axios from 'axios';
// import styled from 'styled-components';
import UserContext from '../context/UserContext';

import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';


// Searches for albums
// https://api.spotify.com/v1/search?q=tania%20bowra&type=artist
// q=name:abacab&type=album,track


// TODO: add second artist name to tracks tab
//       seperate followed and owned playlists
//       add error handling for search without

const Search = () => {
  const {token, tracks, setTracks} = useContext(UserContext);

  const [searchType, setSearchType] = useState('album');
  // put this at the top level and change with navbar link changes
  const [currentSearchResults, setcurrentSearchResults] = useState(false);
  const [albums, setAlbums] = useState(false);
  // const [tracks, setTracks] = useState(false);

  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');

  const [albumLink, setAlbumLink] = useState(false);
  const [artist, setArtist] = useState(false);


  const createRequestUrl = () => {
    if (searchType === 'album') {
      return `https://api.spotify.com/v1/search?q=${albumSearchQuery ? 'album%3A$' + encodeURI(albumSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20' : encodeURI('jon hopkins')}&type=album`
    } else {
      return `https://api.spotify.com/v1/search?q=${trackSearchQuery ? 'album%3A$' + encodeURI(trackSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20' : encodeURI('jon hopkins')}&type=track`
    }
  }

  // useCallback() here?
  const getTracks = async () => {
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
        console.log(response.data.albums.items);
        setAlbums(response.data.albums.items);
      } else {
        console.log(response.data.tracks.items);
        setTracks(response.data.tracks.items);
      }

      setcurrentSearchResults(true);
    } catch (err) {
      console.log(err.message);
    }
};



  return (
    <div>
      <h1><i>Search</i></h1>

      {!currentSearchResults ? (
      <SearchOptions
        searchType={searchType}
        setSearchType={setSearchType}
        setArtist={setArtist}
        setAlbumSearchQuery={setAlbumSearchQuery}
        setTrackSearchQuery={setTrackSearchQuery}
        getTracks={getTracks}
      />
      ) : (
      <SearchResults
        albums={albums}
        tracks={tracks}
        albumLink={albumLink}
        setAlbumLink={setAlbumLink}
      />
      )}
    </div>
  )
};

export default Search;
