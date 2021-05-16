import React, {useState, useContext, useEffect} from 'react';
import { useHistory } from 'react-router-dom';
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
  const {
    token,
    setTracks,
    setSortedTracks,
    setRecommendedTrack
  } = useContext(UserContext);

  const [currentSearchResults, setCurrentSearchResults] = useState(false);
  // const [searchType, setSearchType] = useState('track');
  // const [albumSearchQuery, setAlbumSearchQuery] = useState('');
  // const [trackSearchQuery, setTrackSearchQuery] = useState('');
  // const [playlistSearchQuery, setPlaylistSearchQuery ] = useState('');
  // const [artist, setArtist] = useState('');
  // const [albums, setAlbums] = useState(false);
  // const [albumName, setAlbumName] = useState(false);
  // const [playlistSearchResults, setPlaylistSearchResults ] = useState('');

  const [ searchOptionValues, setSearchOptionValues ] = useState({
    albumSearchQuery: '',
    artist: '',
    playlistSearchQuery: '',
    searchType: 'track',
    trackSearchQuery: '',
  });
  const [ searchResultValues, setSearchResultValues ] = useState({
    albums: false,
    albumName: false,
    playlistSearchResults: '',
  });
  

  const history = useHistory();
  const state = history.location.state;

  // useEffect(() => {
  //   if (state) {
  //     console.log('state :>> ', state);
  //     setSearchResultValues(state.searchResultValues)
  //     setCurrentSearchResults(state.currentSearchResults)
  //   } else {
  //     console.log('state :>> ', "no state");
  //     setSearchResultValues({
  //       albums: false,
  //       albumName: false,
  //       playlistSearchResults: '',
  //     });
  //   }
  // }, [state, setSearchResultValues, setCurrentSearchResults])


  useEffect(() => {
    console.log("state", state)

  }, [state])



  const updateUrl = (slug) => {
    history.push({
      pathname: '/search',
      search: `?${slug}`
    },
    { 
      searchResultValues: searchResultValues,
      currentSearchResults: currentSearchResults
    })
  }


  const handleOptionsChange = (prop, value) => {
    setSearchOptionValues({ ...searchOptionValues, [prop]: value });
  };

  const handleResultsChange = (prop, value) => {
    setSearchResultValues({ ...searchResultValues, [prop]: value });
  };


  const createRequestUrl = () => {
    if (searchOptionValues.searchType === 'album') {
      return `https://api.spotify.com/v1/search?q=${searchOptionValues.albumSearchQuery ?
      'album%3A$' + encodeURI(searchOptionValues.albumSearchQuery) + '%20' : ''}${searchOptionValues.artist ? 'artist%3A$' + encodeURI(searchOptionValues.artist) + '%20'
      : encodeURI('')}&type=album`;
    } else if (searchOptionValues.searchType === 'track') {
      return `https://api.spotify.com/v1/search?q=${searchOptionValues.trackSearchQuery ?
      'album%3A$' + encodeURI(searchOptionValues.trackSearchQuery) + '%20' : ''}${searchOptionValues.artist ? 'artist%3A$' + encodeURI(searchOptionValues.artist) + '%20'
      : encodeURI('')}&type=track&limit=50`;
    } else {
      return `https://api.spotify.com/v1/search?q=${searchOptionValues.playlistSearchQuery}&type=playlist`;
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

    const trackFeatures = [...featuresResponse.data.audio_features];
    const splicedTracks = tracks.filter((item, index) => trackFeatures[index] != null)
        .map((item, index) => {
          return {
            "name": item.name,
            "artists": item.artists.length > 1 ? [item.artists[0].name, item.artists[1].name] : [item.artists[0].name],
            "id": item.id && item.id,
            "tempo": trackFeatures[index] != null ? Math.round(trackFeatures[index].tempo) : "",
            "key": trackFeatures[index] != null ? trackFeatures[index].key : "",
            "mode": trackFeatures[index] != null ? parseInt(trackFeatures[index].mode) : "",
            "energy": trackFeatures[index] != null ? Math.round((100-trackFeatures[index].energy.toFixed(2)*100))/100 : "",
            "danceability": trackFeatures[index] != null ? trackFeatures[index].danceability : ""
          }
        })

    updateUrl('tracks')
    setSortedTracks([...splicedTracks]);
    setTracks([...splicedTracks]);
  }


  // useCallback() here?
  const getResults = async () => {
    if (searchOptionValues.artist.length || searchOptionValues.albumSearchQuery.length || searchOptionValues.trackSearchQuery.length || searchOptionValues.playlistSearchQuery.length ) {
      try {
        const response = await axios({
          method: 'get',
          url: createRequestUrl(),
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (searchOptionValues.searchType === 'album') {
          updateUrl('albums')
          handleResultsChange("albums", response.data.albums.items);
        } else if (searchOptionValues.searchType === 'track') {
          getTrackFeatures(response.data.tracks.items);
        } else {
          updateUrl('playlists')
          handleResultsChange("playlistSearchResults", response.data.playlists.items);
        }

        setCurrentSearchResults(true);
      } catch (err) {
        console.log(err.message);
      }
    }
  };


  const resetSearch = () => {
    setCurrentSearchResults(false);
    setRecommendedTrack(false);
    setTracks(false);

    // setAlbumSearchQuery('');
    // setTrackSearchQuery('');
    // setArtist('');
    // setAlbumName(false);
    // setPlaylistSearchQuery('');
    // setPlaylistSearchResults(false);
    // setAlbums(false);

    setSearchOptionValues({
      albumSearchQuery: '',
      artist: '',
      playlistSearchQuery: '',
      searchType: 'track',
      trackSearchQuery: '',
    });

    setSearchResultValues({
      albums: false,
      albumName: false,
      playlistSearchResults: '',
    })

    history.push('/search')
  }

  const showOnlyPlaylistTracks = () => {
    handleResultsChange("playlistSearchResults", false);
  }

  const showOnlyPlaylists = () => {
    handleResultsChange("albums", false);
  }


  return (
    <div>
      <SearchTitle>Search</SearchTitle>

      {!currentSearchResults ? (
        <SearchOptions
          getResults={getResults}
          handleOptionsChange={handleOptionsChange}
          searchOptionValues={searchOptionValues}
          history={history}
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

          <br/><br/>

          <SearchResults
            handleResultsChange={handleResultsChange}
            searchResultValues={searchResultValues}
            showOnlyPlaylists={showOnlyPlaylists}
            showOnlyPlaylistTracks={showOnlyPlaylistTracks}
          />
        </div>
      )}
    </div>
  )
};

export default Search;
