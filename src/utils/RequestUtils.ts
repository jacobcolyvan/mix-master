import axios from 'axios';
import { scopes } from '../utils/CommonVariables';

export const spotifyBaseRequest = (token: string | null) => {
  // try/catch should go here (?)
  return axios.create({
    baseURL: 'https://api.spotify.com/v1/me',
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
