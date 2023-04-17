import { Track } from '../types';
import { camelotMajorKeyDict, camelotMinorKeyDict, keyDict } from './commonVariables';

export const getArtistNames = (artistNameArray: String[]) => {
  // only show first two artists
  if (artistNameArray.length > 1) {
    return `${artistNameArray[0]}, ${artistNameArray[1]}`;
  } else {
    return artistNameArray[0];
  }
};

const getCamelotKeyValue = (track: Track) => {
  // 0.1 is added to the value of the major key so that it is sorted after the minor key
  const keyValue =
    track.mode === '0'
      ? parseInt(camelotMinorKeyDict[track.key])
      : parseInt(camelotMajorKeyDict[track.key]) + 0.1;

  return keyValue;
};

export const camelotKeySort = (tempTracks: Track[]): Track[] => {
  const sortedTracks = [...tempTracks];
  sortedTracks.sort((a: Track, b: Track) => {
    const aValue = getCamelotKeyValue(a);
    const bValue = getCamelotKeyValue(b);

    return aValue > bValue ? 1 : -1;
  });

  return sortedTracks;
};

export const standardKeySort = (tempTracks: Track[]): Track[] => {
  const sortedTracks = [...tempTracks];

  sortedTracks.sort((a, b) => {
    const { key: aKey, mode: aMode } = a;
    const { key: bKey, mode: bMode } = b;

    // Adjust keys so that A is at 1 and G# is at 12
    const aKeyAdjusted = ((parseInt(aKey) + 3) % 12) + 1;
    const bKeyAdjusted = ((parseInt(bKey) + 3) % 12) + 1;

    if (aKeyAdjusted !== bKeyAdjusted) {
      return aKeyAdjusted - bKeyAdjusted;
    }

    return parseInt(bMode) - parseInt(aMode);
  });

  return sortedTracks;
};

export const getKeyInfoArray = (trackKey, trackMode): any[] => {
  const camelotKey =
    trackMode === '1'
      ? camelotMajorKeyDict[trackKey] + 'B'
      : camelotMinorKeyDict[trackKey] + 'A';

  const standardKey = `${keyDict[trackKey]}${trackMode === '1' ? '' : 'm'}`;

  // 9 is the number of semitones between the major and minor key, while
  // 3 is the number of semitones between the minor and major key
  const inverseKey =
    trackMode === '1'
      ? [String((parseInt(trackKey) + 9) % 12), '0']
      : [String((parseInt(trackKey) + 3) % 12), '1'];

  return [camelotKey, standardKey, inverseKey];
};
