import axios from "axios";

import { CurrentSearchQueryOptions, SeedAttributes, Track } from "../types";
import { getKeyInfoArray } from "./commonFunctions";
import { scopes } from "./commonVariables";

/* Use .get() on returned value, with everything in url after v1/ */
export const spotifyBaseRequest = (token: string) => {
  // try/catch should go here (?)
  return axios.create({
    baseURL: "https://api.spotify.com/v1/",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const createSpotifyAuthHREF = () => {
  return `https://accounts.spotify.com/authorize?response_type=token&client_id=${
    import.meta.env.VITE_SPOTIFY_CLIENT_ID || ""
  }&scope=${scopes.join("%20")}&redirect_uri=${encodeURIComponent(
    import.meta.env.VITE_SPOTIFY_CALLBACK_URI || ""
  )}&show_dialog=false`;
};

export const createSearchRequestUrl = (currentSearchQueries: CurrentSearchQueryOptions) => {
  // if all search queries are empty, return null
  if (!Object.values(currentSearchQueries).some((query) => query.length)) {
    return null;
  }

  const baseSearchUrl = "https://api.spotify.com/v1/search?q=";
  const { searchType, albumSearchQuery, artistSearchQuery, trackSearchQuery, playlistSearchQuery } =
    currentSearchQueries;

  const encodedAlbumQuery = albumSearchQuery ? `album%3A$${encodeURI(albumSearchQuery)}%20` : "";
  const encodedArtistQuery = artistSearchQuery
    ? `artist%3A$${encodeURI(artistSearchQuery)}%20`
    : "";
  const encodedTrackQuery = trackSearchQuery ? `track%3A$${encodeURI(trackSearchQuery)}%20` : "";

  if (searchType === "album") {
    return `${baseSearchUrl}${encodedAlbumQuery}${encodedArtistQuery}&type=album&limit=50`;
  } else if (searchType === "track") {
    return `${baseSearchUrl}${encodedTrackQuery}${encodedArtistQuery}&type=track&limit=50`;
  } else {
    return `${baseSearchUrl}${encodeURI(playlistSearchQuery)}&type=playlist&limit=50`;
  }
};

export const millisToMinutesAndSeconds = (millis: number) => {
  const minutes: string = String(Math.floor(millis / 60000) + 1);
  const seconds: number = parseInt(((millis % 60000) / 1000).toFixed(0));

  return seconds === 60
    ? minutes + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + String(seconds);
};

export const createTrackObject = (item, trackFeature, artistFeature): Track => {
  // we check this because sometimes the track object is nested in the item object
  const track = item.track || item;

  const featureToString = (num) => (num === null || num === undefined ? "" : String(num));

  const keyInfoArray = getKeyInfoArray(
    featureToString(trackFeature?.key),
    featureToString(trackFeature?.mode)
  );

  const roundToTwoDecimals = (num: number) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  return {
    id: track.id,
    name: track.name,
    artists:
      track.artists.length > 1
        ? [track.artists[0].name, track.artists[1].name]
        : [track.artists[0].name],
    tempo: featureToString(trackFeature?.tempo ? Math.round(trackFeature.tempo) : ""),
    key: featureToString(trackFeature?.key),
    mode: featureToString(trackFeature?.mode),
    energy: featureToString(trackFeature?.energy ? roundToTwoDecimals(trackFeature.energy) : ""),
    danceability: featureToString(trackFeature?.danceability),
    acousticness: featureToString(trackFeature?.acousticness),
    speechiness: featureToString(trackFeature?.speechiness),
    instrumentalness: featureToString(trackFeature?.instrumentalness),
    liveness: featureToString(trackFeature?.liveness),
    loudness: featureToString(trackFeature?.loudness),
    valence: featureToString(trackFeature?.valence),
    duration: track.duration_ms ? millisToMinutesAndSeconds(track.duration_ms) : "",
    track_popularity: featureToString(track.popularity),
    artist_genres: artistFeature?.genres || [],
    album: track.album?.name || "",
    release_date: track.album?.release_date || "",
    parsedKeys: keyInfoArray,
  };
};

export const getTrackAndArtistFeatures = async (rawTracks: any[], spotifyToken: string) => {
  const trackIds: string[] = [];
  const artistIds: string[] = [];

  rawTracks.forEach((item: { [key: string]: any }) => {
    const track = item.track || item;

    trackIds.push(track.id);
    artistIds.push(track.artists[0].id);
  });

  const trackFeaturesResponse = await spotifyBaseRequest(spotifyToken).get(
    `audio-features/?ids=${trackIds.join(",")}`
  );
  const artistFeaturesResponse = await spotifyBaseRequest(spotifyToken).get(
    `artists?ids=${artistIds.join(",")}`
  );

  const trackFeatures = [...trackFeaturesResponse.data.audio_features];
  const artistFeatures = [...artistFeaturesResponse.data.artists];

  const splicedTracks: Track[] = rawTracks.reduce((acc, item, index) => {
    if (trackFeatures[index] !== null) {
      const trackObject = createTrackObject(item, trackFeatures[index], artistFeatures[index]);
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
    (key ? `&target_key=${key}` : "") +
    (mode ? `&target_mode=${mode}` : "") +
    `&limit=${limit}`;

  const urlWithSeedAttributes = Object.keys(seedAttributes).reduce((url, param) => {
    if (seedAttributes[param].value !== "") {
      if (param === "genre") {
        return url + `&seed_genres=${seedAttributes[param].value}`;
      } else if (param === "duration") {
        const durationInMs = parseInt(seedAttributes[param].value || "1") * 1000;
        return url + `&${seedAttributes[param].maxOrMinFilter}_${param}=${durationInMs}`;
      } else {
        return url + `&${seedAttributes[param].maxOrMin}_${param}=${seedAttributes[param].value}`;
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
