import axios from 'axios';

import { CurrentSearchQueryOptions, SeedAttributes, Track } from '../types';
import { scopes } from '../utils/CommonVariables';
import { getKeyInfoArray, millisToMinutesAndSeconds } from './CommonFunctions';

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

export const createSearchRequestUrl = (
  currentSearchQueries: CurrentSearchQueryOptions
) => {
  // if all search queries are empty, return null
  if (!Object.values(currentSearchQueries).some((query) => query.length)) {
    return null;
  }

  const baseSearchUrl = 'https://api.spotify.com/v1/search?q=';
  const {
    searchType,
    albumSearchQuery,
    artistSearchQuery,
    trackSearchQuery,
    playlistSearchQuery,
  } = currentSearchQueries;

  const encodedAlbumQuery = albumSearchQuery
    ? `album%3A$${encodeURI(albumSearchQuery)}%20`
    : '';
  const encodedArtistQuery = artistSearchQuery
    ? `artist%3A$${encodeURI(artistSearchQuery)}%20`
    : '';
  const encodedTrackQuery = trackSearchQuery
    ? `track%3A$${encodeURI(trackSearchQuery)}%20`
    : '';

  if (searchType === 'album') {
    return `${baseSearchUrl}${encodedAlbumQuery}${encodedArtistQuery}&type=album&limit=50`;
  } else if (searchType === 'track') {
    return `${baseSearchUrl}${encodedTrackQuery}${encodedArtistQuery}&type=track&limit=50`;
  } else {
    return `${baseSearchUrl}${encodeURI(playlistSearchQuery)}&type=playlist&limit=50`;
  }
};

export const createTrackObject = (item, trackFeature, artistFeature): Track => {
  // we check this because sometimes the track object is nested in the item object
  const track = item.track || item;
  const keyInfoArray = getKeyInfoArray(
    String(trackFeature?.key),
    String(trackFeature?.mode)
  );

  return {
    id: track.id,
    name: track.name,
    artists:
      track.artists.length > 1
        ? [track.artists[0].name, track.artists[1].name]
        : [track.artists[0].name],
    tempo: String(trackFeature?.tempo ? Math.round(trackFeature.tempo) : ''),
    key: String(trackFeature?.key) || '',
    mode: String(trackFeature?.mode) || '',
    energy: trackFeature?.energy
      ? String(Math.round(trackFeature.energy.toFixed(2) * 100) / 100)
      : '',
    danceability: trackFeature?.danceability || '',
    acousticness: trackFeature?.acousticness || '',
    speechiness: trackFeature?.speechiness || '',
    instrumentalness: trackFeature?.instrumentalness || '',
    liveness: trackFeature?.liveness || '',
    loudness: trackFeature?.loudness || '',
    valence: trackFeature?.valence || '',
    duration: track.duration_ms ? millisToMinutesAndSeconds(track.duration_ms) : '',
    track_popularity: track.popularity || '',
    artist_genres: artistFeature?.genres || '',
    album: track.album?.name || '',
    release_date: track.album?.release_date || '',
    parsedKeys: keyInfoArray,
  };
};

export const getTrackAndArtistFeatures = async (
  rawTracks: any[],
  spotifyToken: string
) => {
  const trackIds: string[] = [];
  const artistIds: string[] = [];

  rawTracks.forEach((item: { [key: string]: any }) => {
    const track = item.track || item;

    trackIds.push(track.id);
    artistIds.push(track.artists[0].id);
  });

  const trackFeaturesResponse = await spotifyBaseRequest(spotifyToken).get(
    `audio-features/?ids=${trackIds.join(',')}`
  );
  const artistFeaturesResponse = await spotifyBaseRequest(spotifyToken).get(
    `artists?ids=${artistIds.join(',')}`
  );

  const trackFeatures = [...trackFeaturesResponse.data.audio_features];
  const artistFeatures = [...artistFeaturesResponse.data.artists];

  const splicedTracks: Track[] = rawTracks.reduce((acc, item, index) => {
    if (trackFeatures[index] != null) {
      const trackObject = createTrackObject(
        item,
        trackFeatures[index],
        artistFeatures[index]
      );
      acc.push(trackObject);
    }
    return acc;
  }, []);

  return splicedTracks;
};

export const generateRecommendedTrackUrl = (
  recommendedTrackId: string,
  seedAttributes: SeedAttributes,
  limit: number = 10,
  key?: string,
  mode?: string
) => {
  // // other available api seeds
  // if (artistSeed) url += `&seed_artists=${ artistSeed.map(artist => artist.id).join(',') }`;
  // if (trackSeed) url += `&seed_tracks=${ trackSeed.map(track => track.id).join(',') }`;
  // if (mode) url += `&target_mode=${mode}`

  const baseUrl =
    `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrackId}` +
    (key ? `&target_key=${key}` : '') +
    (mode ? `&target_mode=${mode}` : '') +
    `&limit=${limit}`;

  const urlWithSeedAttributes = Object.keys(seedAttributes).reduce((url, param) => {
    if (seedAttributes[param].value !== '') {
      if (param === 'genre') {
        return url + `&seed_genres=${seedAttributes[param].value}`;
      } else if (param === 'duration') {
        const durationInMs = parseInt(seedAttributes[param].value || '1') * 1000;
        return (
          url + `&${seedAttributes[param].maxOrMinFilter}_${param}=${durationInMs}`
        );
      } else {
        return (
          url +
          `&${seedAttributes[param].maxOrMin}_${param}=${seedAttributes[param].value}`
        );
      }
    }
    return url;
  }, baseUrl);

  return urlWithSeedAttributes;
};

export const getTracksFromSpotify = async (url: string, spotifyToken: string) => {
  const tracks = await spotifyBaseRequest(spotifyToken).get(url);

  return tracks.data.tracks;
};
