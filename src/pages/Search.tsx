import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';

import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';
import Loading from '../components/Loading';

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
    setSearchResultValues,
    setAuthError,
  } = useContext(UserContext);

  const [currentSearchResults, setCurrentSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [albumName, setAlbumName] = useState<boolean | string>(false);
  const history: any = useHistory();
  const browserState: any = history.location.state;

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
      tracks: false,
    });
  }, [
    setRecommendedTrack,
    setSearchOptionValues,
    setSearchResultValues,
    setTracks,
    setSortedTracks,
  ]);

  const updateHooksFromState = useCallback(() => {
    if (browserState) {
      setSearchOptionValues(browserState.searchOptionValues);

      if (history.location.search === '?' || history.location.search === '') {
        setCurrentSearchResults(false);
        // Reset searchValues without resetting searchOptions
        setSearchResultValues({
          albums: false,
          playlistSearchResults: '',
          tracks: false,
        });
        setAlbumName(false);
        setSortedTracks(false);
        setTracks(false);
      } else {
        setTracks(browserState.searchResultValues['tracks']);
        setCurrentSearchResults(true);
        setSearchResultValues(browserState.searchResultValues);
      }
    } else {
      resetSearch();
    }
  }, [
    browserState,
    history.location.search,
    resetSearch,
    setSearchResultValues,
    setSearchOptionValues,
    setTracks,
    setSortedTracks,
  ]);

  // Refresh state on search re-render
  useEffect(() => {
    updateHooksFromState();
  }, [history.location, updateHooksFromState]);

  const updateUrl = (slug = 'rand', results = false) => {
    history.push(
      {
        pathname: '/search',
        search: `?${slug}`,
      },
      {
        searchOptionValues: searchOptionValues,
        searchResultValues: results || searchResultValues,
        currentSearchResults: currentSearchResults,
        tracks: tracks,
      }
    );
  };

  const handleOptionsChange = (key, value) => {
    setCurrentSearchResults(false);
    setSearchResultValues({
      albums: false,
      playlistSearchResults: '',
      tracks: false,
    });

    setSearchOptionValues({ ...searchOptionValues, [key]: value });
  };

  const handleResultsChange = (key, value) => {
    setSearchResultValues({ ...searchResultValues, [key]: value });
    return { ...searchResultValues, [key]: value };
  };

  const createRequestUrl = () => {
    if (searchOptionValues.searchType === 'album') {
      return `https://api.spotify.com/v1/search?q=${
        searchOptionValues.albumSearchQuery
          ? 'album%3A$' + encodeURI(searchOptionValues.albumSearchQuery) + '%20'
          : ''
      }${
        searchOptionValues.artist
          ? 'artist%3A$' + encodeURI(searchOptionValues.artist) + '%20'
          : encodeURI('')
      }&type=album`;
    } else if (searchOptionValues.searchType === 'track') {
      return `https://api.spotify.com/v1/search?q=${
        searchOptionValues.trackSearchQuery
          ? 'album%3A$' + encodeURI(searchOptionValues.trackSearchQuery) + '%20'
          : ''
      }${
        searchOptionValues.artist
          ? 'artist%3A$' + encodeURI(searchOptionValues.artist) + '%20'
          : encodeURI('')
      }&type=track&limit=50`;
    } else {
      return `https://api.spotify.com/v1/search?q=${searchOptionValues.playlistSearchQuery}&type=playlist`;
    }
  };

  const getTrackAndArtistFeatures = async (tracks) => {
    const trackIds = tracks.map((item) => item.id);
    const artistIds = tracks.map((track) => track.artists[0].id);

    let trackFeatures: any[] | AxiosResponse<any> = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(
        ','
      )}`,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });

    let artistFeatures: any[] | AxiosResponse<any> = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });

    trackFeatures = [...trackFeatures.data.audio_features];
    artistFeatures = [...artistFeatures.data.artists];

    const splicedTracks = tracks
      .filter((_, index) => trackFeatures[index] != null)
      .map((item, index) => {
        return {
          name: item.name,
          artists:
            item.artists.length > 1
              ? [item.artists[0].name, item.artists[1].name]
              : [item.artists[0].name],
          id: item.id && item.id,
          tempo:
            trackFeatures[index] != null
              ? Math.round(trackFeatures[index].tempo)
              : '',
          key: trackFeatures[index] != null ? trackFeatures[index].key : '',
          mode:
            trackFeatures[index] != null
              ? parseInt(trackFeatures[index].mode)
              : '',
          energy:
            trackFeatures[index] != null
              ? Math.round(trackFeatures[index].energy.toFixed(2) * 100) / 100
              : '',
          danceability:
            trackFeatures[index] != null
              ? trackFeatures[index].danceability
              : '',
          acousticness:
            trackFeatures[index] != null
              ? trackFeatures[index].acousticness
              : '',
          liveness:
            trackFeatures[index] != null ? trackFeatures[index].liveness : '',
          loudness:
            trackFeatures[index] != null ? trackFeatures[index].loudness : '',
          speechiness:
            trackFeatures[index] != null
              ? trackFeatures[index].speechiness
              : '',
          valence:
            trackFeatures[index] != null ? trackFeatures[index].valence : '',

          duration:
            item.duration_ms != null
              ? millisToMinutesAndSeconds(item.duration_ms)
              : '',
          track_popularity: item.popularity != null ? item.popularity : '',
          artist_genres:
            artistFeatures[index] != null ? artistFeatures[index].genres : '',
          album: item.album.name && item.album.name,
          release_date: item.album.release_date ? item.album.release_date : '',
        };
      });

    setSortedTracks([...splicedTracks]);
    setTracks([...splicedTracks]);
  };

  const getResults = async () => {
    // updateUrl to save searchOption params
    setSearching(true);
    updateUrl('');

    if (
      searchOptionValues.artist.length ||
      searchOptionValues.albumSearchQuery.length ||
      searchOptionValues.trackSearchQuery.length ||
      searchOptionValues.playlistSearchQuery.length
    ) {
      try {
        const response = await axios({
          method: 'get',
          url: createRequestUrl(),
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
        });

        if (searchOptionValues.searchType === 'album') {
          const results = handleResultsChange(
            'albums',
            response.data.albums.items
          );
          updateUrl('albums', results);
        } else if (searchOptionValues.searchType === 'track') {
          getTrackAndArtistFeatures(response.data.tracks.items);
          updateUrl('tracks');
        } else {
          const results = handleResultsChange(
            'playlistSearchResults',
            response.data.playlists.items
          );
          updateUrl('playlists', results);
        }

        setCurrentSearchResults(true);
        setSearching(false);
      } catch (err) {
        if (err.response?.status === 401) setAuthError(true);
        console.log(err.message);
      }
    }
  };

  const showOnlyPlaylistTracks = () => {
    handleResultsChange('playlistSearchResults', false);
  };

  // const showOnlyPlaylists = () => {
  //   handleResultsChange('albums', false);
  // };

  return (
    <div>
      <h1 className="search-page-title">Search</h1>
      <SearchOptions
        getResults={getResults}
        handleOptionsChange={handleOptionsChange}
        searchOptionValues={searchOptionValues}
      />

      {currentSearchResults && (
        <div>
          <hr className="search-page-results__hr" />
          <SearchResults
            handleResultsChange={handleResultsChange}
            searchResultValues={searchResultValues}
            showOnlyPlaylistTracks={showOnlyPlaylistTracks}
            updateUrl={updateUrl}
            albumName={albumName}
            setAlbumName={setAlbumName}
          />
        </div>
      )}
      {searching && <Loading />}
    </div>
  );
};

export default Search;
