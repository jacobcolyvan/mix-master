import React, {useState, useContext, useEffect, useCallback } from 'react';
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
    tracks,
    setTracks,
    setSortedTracks,
    setRecommendedTrack,
    searchOptionValues,
    setSearchOptionValues,
    searchResultValues,
    setSearchResultValues
  } = useContext(UserContext);

  const [currentSearchResults, setCurrentSearchResults] = useState(false);
  const [albumName, setAlbumName] = useState(false);
  const history = useHistory();
  const state = history.location.state;


  const resetSearch = useCallback(() => {
    setCurrentSearchResults(false);
    setRecommendedTrack(false);
    setAlbumName(false);
    setSortedTracks(false);
    setTracks(false);

    setSearchOptionValues({
      albumSearchQuery: '',
      artist: '',
      playlistSearchQuery: '',
      searchType: 'track',
      trackSearchQuery: '',
    });
    setSearchResultValues({
      albums: false,
      playlistSearchResults: '',
      tracks: false
    })
  }, [
    setRecommendedTrack,
    setSearchOptionValues,
    setSearchResultValues,
    setTracks,
    setSortedTracks
  ])


  const updateHooksFromState = useCallback(() => {
    if (state) {
      setSearchOptionValues(state.searchOptionValues)

      if (history.location.search === '?' || history.location.search === '') {
        setCurrentSearchResults(false);
        // Reset searchValues witout resetting searchOptions
        setSearchResultValues({
          albums: false,
          playlistSearchResults: '',
          tracks: false
        });
        setAlbumName(false);
        setSortedTracks(false);
        setTracks(false);

      } else {
        setTracks(state.searchResultValues["tracks"]);
        setCurrentSearchResults(true);
        setSearchResultValues(state.searchResultValues);
      }

    } else {
      resetSearch()
    }
  }, [
    state,
    history.location.search,
    resetSearch,
    setSearchResultValues,
    setSearchOptionValues,
    setTracks,
    setSortedTracks,
  ]);


  // Refresh state on search re-render
  useEffect(() => {
    updateHooksFromState()
  }, [history.location, updateHooksFromState])



  const updateUrl = (slug="rand", results=false) => {
    history.push({
      pathname: '/search',
      search: `?${slug}`
    },
    {
      searchOptionValues: searchOptionValues,
      searchResultValues: results || searchResultValues,
      currentSearchResults: currentSearchResults,
      tracks: tracks
    })
  }


  const handleOptionsChange = (key, value) => {
    setSearchOptionValues({ ...searchOptionValues, [key]: value });
  };

  const handleResultsChange = (key, value) => {
    setSearchResultValues({ ...searchResultValues, [key]: value });
    return { ...searchResultValues, [key]: value }
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

      setSortedTracks([...splicedTracks]);
      setTracks([...splicedTracks]);
      // return([...splicedTracks])
  }


  const getResults = async () => {
    // updateUrl to save searchOption params
    updateUrl('')

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
          const results = handleResultsChange("albums", response.data.albums.items);
          updateUrl('albums', results)
        } else if (searchOptionValues.searchType === 'track') {
          getTrackFeatures(response.data.tracks.items);
          updateUrl('tracks')
        } else {
          const results = handleResultsChange("playlistSearchResults", response.data.playlists.items);
          updateUrl('playlists', results)
        }

        setCurrentSearchResults(true);
      } catch (err) {
        console.log(err.message);
      }
    }
  };

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
          updateUrl={updateUrl}
          handleOptionsChange={handleOptionsChange}
          searchOptionValues={searchOptionValues}
          history={history}
        />
      ) : (
        <div>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => { updateUrl(''); resetSearch(); }}
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
            updateUrl={updateUrl}
            albumName={albumName}
            setAlbumName={setAlbumName}
          />
        </div>
      )}
    </div>
  )
};

export default Search;
