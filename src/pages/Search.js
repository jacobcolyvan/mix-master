import React, {useEffect, useState, useContext} from 'react';
import axios from 'axios';
// import styled from 'styled-components';
import UserContext from '../context/UserContext';
import Button from '@material-ui/core/Button';

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

// Searches for albums
// https://api.spotify.com/v1/search?q=tania%20bowra&type=artist


// TODO: add second artist name to tracks tab
//       seperate followed and owned playlists

const Search = () => {
  const {token} = useContext(UserContext);
  const [albums, setAlbums] = useState(false);
  const [albumName, setAlbumName] = useState(false);
  const [albumLink, setAlbumLink] = useState(false);
  const [artist, setArtist] = useState(false);

  // useCallback() here?
  const getTracks = async () => {
    try {
      const tracksResponse = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/search?q=${albumName ? 'album%3A$' + encodeURI(albumName) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20' : encodeURI('jon hopkins')}&type=album`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      console.log(tracksResponse.data.albums.items);
      // setAlbums(tracksResponse.data.albums.items);
    } catch (err) {
      console.log(err.message);
    }
  };

  getTracks();


  return (
    <div>
      <p>SEARCH PAGE</p>
    </div>
  )
};

export default Search;
