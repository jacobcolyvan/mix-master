import React, {useState, useContext} from 'react';
import axios from 'axios';
// import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import SearchBar from '../components/SearchBar';
// import SearchResults from '../components/SearchResults';


// Searches for albums
// https://api.spotify.com/v1/search?q=tania%20bowra&type=artist
// q=name:abacab&type=album,track


// TODO: add second artist name to tracks tab
//       seperate followed and owned playlists
//       add error handling for search without

const Search = () => {
  const {token} = useContext(UserContext);

  const [searchType, setSearchType] = useState('album')
  const [albums, setAlbums] = useState(false);
  const [tracks, setTracks] = useState(false);

  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');

  // const [albumLink, setAlbumLink] = useState(false);
  const [artist, setArtist] = useState(false);


  const createRequestUrl = () => {
    if (searchType === 'album') {
      return `https://api.spotify.com/v1/search?q=${albumSearchQuery ? 'album%3A$' + encodeURI(albumSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20' : encodeURI('')}&type=album`
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
    } catch (err) {
      console.log(err.message);
    }
};



  return (
    <div>
      <h1><i>Search</i></h1>

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
        onClick={getTracks}
        className="button"
        fullWidth>
            Search
        </ Button>
    </div>
  )
};

export default Search;
