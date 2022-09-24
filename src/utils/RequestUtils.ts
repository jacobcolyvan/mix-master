import axios from 'axios';
import { CurrentSearchQueryOptions } from '../types';
import { scopes } from '../utils/CommonVariables';

/* Use .get() on returned value, with everything in url after v1/ */
export const spotifyBaseRequest = (token: string) => {
  // try/catch should go here (?)
  return axios.create({
    baseURL: 'https://api.spotify.com/v1/',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const createSpotifyAuthHREF = () => {
  return `https://accounts.spotify.com/authorize?response_type=token&client_id=${
    process.env.REACT_APP_SPOTIFY_CLIENT_ID2
  }&scope=${scopes.join('%20')}&redirect_uri=${encodeURIComponent(
    process.env.REACT_APP_SPOTIFY_CALLBACK_URI || ''
  )}&show_dialog=false`;
};

// TODO: refactor
export const createRequestUrl = (currentSearchQueries: CurrentSearchQueryOptions) => {
  const baseSearchUrl = 'https://api.spotify.com/v1/search?q=';

  if (currentSearchQueries.searchType === 'album') {
    return (
      baseSearchUrl +
      `${
        currentSearchQueries.albumSearchQuery
          ? 'album%3A$' + encodeURI(currentSearchQueries.albumSearchQuery) + '%20'
          : ''
      }${
        currentSearchQueries.artistSearchQuery
          ? 'artist%3A$' + encodeURI(currentSearchQueries.artistSearchQuery) + '%20'
          : ''
      }&type=album&limit=50`
    );
  } else if (currentSearchQueries.searchType === 'track') {
    return (
      baseSearchUrl +
      `${
        currentSearchQueries.trackSearchQuery
          ? 'track%3A$' + encodeURI(currentSearchQueries.trackSearchQuery) + '%20'
          : ''
      }${
        currentSearchQueries.artistSearchQuery
          ? 'artist%3A$' + encodeURI(currentSearchQueries.artistSearchQuery) + '%20'
          : ''
      }&type=track&limit=50`
    );
  } else {
    return (
      baseSearchUrl +
      `${encodeURI(currentSearchQueries.playlistSearchQuery)}&type=playlist&limit=50`
    );
  }
};
