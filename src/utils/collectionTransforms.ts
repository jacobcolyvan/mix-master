import { KeyOptionTypes, Playlist, SortedPlaylists, Track, TrackSortByChoices } from "../types";
import { camelotKeySort, standardKeySort } from "./commonFunctions";

const sortByKeyFunction = (key) => (a, b) => {
  return parseFloat(a[key]) - parseFloat(b[key]);
};

/**
 * Derives the display order for a list of tracks.
 *
 * Always sorts from the canonical array it is given, so switching back to
 * "default" restores the original order and sorts never compound.
 * Pure: the input is never mutated and a new array is always returned.
 */
export const sortTracks = (
  tracks: Track[],
  sortBy: TrackSortByChoices,
  keyOption: KeyOptionTypes
): Track[] => {
  let tempTracks: Track[];
  let sortThenKey = false;

  switch (sortBy) {
    // cases without explicit code fall through to the next case with code
    case "tempo":
    case "duration":
    case "popularity":
    case "valence":
      tempTracks = [...tracks].sort(sortByKeyFunction(sortBy));
      break;
    case "durationThenKey":
    case "tempoThenKey":
    case "energyThenKey":
    case "valenceThenKey":
      tempTracks = [...tracks].sort(sortByKeyFunction(sortBy.slice(0, -7)));
      sortThenKey = true;
      break;
    case "major/minor":
      tempTracks = [...tracks];
      sortThenKey = true;
      break;
    default:
      tempTracks = [...tracks];
  }

  if (sortThenKey) {
    tempTracks = keyOption === "camelot" ? camelotKeySort(tempTracks) : standardKeySort(tempTracks);
  }

  return tempTracks;
};

/**
 * Buckets a user's playlists by ownership into the groups the Playlists page renders.
 * Pure: the input is never mutated and a fresh object is always returned.
 */
export const groupPlaylists = (playlists: Playlist[], username: string): SortedPlaylists => {
  const tempSortedPlaylists: SortedPlaylists = {
    created: [],
    followed: [],
  };

  playlists.forEach((playlist: Playlist) => {
    if (playlist.owner.display_name === username) {
      tempSortedPlaylists.created.push(playlist);
    } else {
      tempSortedPlaylists.followed.push(playlist);
    }
  });

  return tempSortedPlaylists;
};
