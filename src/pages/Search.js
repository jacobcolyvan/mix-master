import React, {useState, useContext} from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Button from '@material-ui/core/Button';

import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';


const SearchTitle = styled.h1`
  text-decoration: underline;
  font-style: italic;
`;



const Search = () => {
  const {token, setTracks, setSortedTracks, setPlaylist} = useContext(UserContext);

  const [searchType, setSearchType] = useState('album');

  const [currentSearchResults, setCurrentSearchResults] = useState(false);
  const [albums, setAlbums] = useState(false);
  const [albumName, setAlbumName] = useState(false);

  const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [playlistSearchQuery, setPlaylistSearchQuery ] = useState('');
  const [artist, setArtist] = useState('');

  const [playlistSearchResults, setPlaylistSearchResults ] = useState('');


  const createRequestUrl = () => {
    if (searchType === 'album') {
      return `https://api.spotify.com/v1/search?q=${albumSearchQuery ?
      'album%3A$' + encodeURI(albumSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20'
      : encodeURI('')}&type=album`;
    } else if (searchType === 'track') {
      return `https://api.spotify.com/v1/search?q=${trackSearchQuery ?
      'album%3A$' + encodeURI(trackSearchQuery) + '%20' : ''}${artist ? 'artist%3A$' + encodeURI(artist) + '%20'
      : encodeURI('')}&type=track`;
    } else {
      return `https://api.spotify.com/v1/search?q=${playlistSearchQuery}&type=playlist`;
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
    if (artist.length || albumSearchQuery.length || trackSearchQuery.length || playlistSearchQuery.length ) {
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
        } else if (searchType === 'track') {
          getTrackFeatures(response.data.tracks.items);
        } else {
          setPlaylistSearchResults(response.data.playlists.items);
        }

        setCurrentSearchResults(true);
      } catch (err) {
        console.log(err.message);
      }
    }
  };


  const resetSearch = () => {
    setCurrentSearchResults(false);
    setAlbumSearchQuery('');
    setTrackSearchQuery('');
    setArtist('');
    setAlbumName(false);
    setTracks(false);
    setPlaylistSearchQuery('');
    setPlaylistSearchResults(false);
    setPlaylist(false);
  }


  return (
    <div>
      <SearchTitle>Search</SearchTitle>

      {!currentSearchResults ? (
        <SearchOptions
          searchType={searchType}
          setSearchType={setSearchType}
          artist={artist}
          setArtist={setArtist}
          trackSearchQuery={trackSearchQuery}
          albumSearchQuery={albumSearchQuery}
          playlistSearchQuery={playlistSearchQuery}
          setAlbumSearchQuery={setAlbumSearchQuery}
          setTrackSearchQuery={setTrackSearchQuery}
          setPlaylistSearchQuery={setPlaylistSearchQuery}
          getResults={getResults}
        />
        ) : (
        <div>
          <Button
            variant='outlined'
            color='primary'
            onClick={resetSearch}
            className="button"
            fullWidth
          >
            Back to Search
          </Button>

          <SearchResults
            albums={albums}
            albumName={albumName}
            setAlbumName={setAlbumName}
            playlistSearchResults={playlistSearchResults}
          />
        </div>
      )}
    </div>
  )
};

export default Search;
