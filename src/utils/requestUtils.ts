import { spotifyApi } from "../auth";
import { SeedAttributes, Track } from "../types";
import { getKeyInfoArray } from "./commonFunctions";
import { validateRecommendationTuning } from "./recommendationTuning";
import { SearchQuery } from "./searchRoute";
import { mapWithConcurrency, splitIntoChunks } from "./spotifyFetch";

const AUDIO_FEATURES_REQUEST_LIMIT = 100;
const ARTISTS_REQUEST_LIMIT = 50;
const MAX_CONCURRENT_METADATA_GROUPS = 4;

export const createSpotifySearchUrl = (route: SearchQuery): string => {
  const params = new URLSearchParams({ limit: "50" });

  // Spotify combines field filters in one space-separated `q` parameter.
  switch (route.kind) {
    case "track": {
      const query = [
        route.track && `track:${route.track}`,
        route.artist && `artist:${route.artist}`,
      ]
        .filter(Boolean)
        .join(" ");
      params.set("q", query);
      params.set("type", "track");
      break;
    }
    case "album": {
      const query = [
        route.album && `album:${route.album}`,
        route.artist && `artist:${route.artist}`,
      ]
        .filter(Boolean)
        .join(" ");
      params.set("q", query);
      params.set("type", "album");
      break;
    }
    case "playlist":
      params.set("q", route.playlist);
      params.set("type", "playlist");
      break;
  }

  return `search?${params.toString()}`;
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

const enrichTrackGroup = async (rawTrackGroup: any[]): Promise<Track[]> => {
  const tracks = rawTrackGroup.map((item) => item.track || item);
  const trackIds = tracks.map((track) => track.id);
  const artistIds = tracks.map((track) => track.artists[0].id);
  const artistIdChunks = splitIntoChunks(artistIds, ARTISTS_REQUEST_LIMIT);

  const [trackFeaturesResponse, ...artistResponses] = await Promise.all([
    spotifyApi.get(`audio-features/?ids=${trackIds.join(",")}`),
    ...artistIdChunks.map((ids) => spotifyApi.get(`artists?ids=${ids.join(",")}`)),
  ]);

  const trackFeatures = trackFeaturesResponse.data.audio_features as (any | null)[];
  const artistFeatures = artistResponses.flatMap((response) => response.data.artists);

  return rawTrackGroup.reduce((enrichedTracks, item, index) => {
    if (trackFeatures[index] !== null) {
      enrichedTracks.push(createTrackObject(item, trackFeatures[index], artistFeatures[index]));
    }
    return enrichedTracks;
  }, [] as Track[]);
};

export const getTrackAndArtistFeatures = async (rawTracks: any[]): Promise<Track[]> => {
  const trackGroups = splitIntoChunks(rawTracks, AUDIO_FEATURES_REQUEST_LIMIT);
  const enrichedTrackGroups = await mapWithConcurrency(
    trackGroups,
    MAX_CONCURRENT_METADATA_GROUPS,
    enrichTrackGroup
  );

  return enrichedTrackGroups.flat();
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

  const { tuning } = validateRecommendationTuning({ attributes: seedAttributes, matchKey: false });
  const params = new URLSearchParams({
    market: "AU",
    seed_tracks: recommendedTrackId,
    limit: String(limit),
  });
  if (key !== undefined) params.set("target_key", key);
  if (mode !== undefined) params.set("target_mode", mode);

  for (const [attributeName, criterion] of Object.entries(tuning.attributes)) {
    if (criterion.value === "") continue;
    if (attributeName === "genre") {
      params.set("seed_genres", criterion.value);
      continue;
    }

    let parameterName = attributeName;
    let parameterValue = criterion.value;
    // Tuning and URLs use seconds; Spotify's duration constraint uses milliseconds.
    if (attributeName === "duration") {
      parameterName = "duration_ms";
      parameterValue = String(Number(criterion.value) * 1000);
    }
    params.set(`${criterion.maxOrMinFilter}_${parameterName}`, parameterValue);
  }

  return `recommendations?${params.toString()}`;
};

export const getTracksFromSpotify = async (url: string) => {
  const tracks = await spotifyApi.get(url);

  return tracks.data.tracks;
};
