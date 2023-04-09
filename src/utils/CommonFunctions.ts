import { Track } from '../types';
import { camelotMajorKeyDict, camelotMinorKeyDict, keyDict } from './CommonVariables';

export const millisToMinutesAndSeconds = (millis: number) => {
  const minutes: string = String(Math.floor(millis / 60000) + 1);
  ('');
  const seconds: number = parseInt(((millis % 60000) / 1000).toFixed(0));

  return seconds === 60
    ? minutes + ':00'
    : minutes + ':' + (seconds < 10 ? '0' : '') + String(seconds);
};

export const getArtistNames = (artistNameArray: String[]) => {
  // only show first two artists
  if (artistNameArray.length > 1) {
    return `${artistNameArray[0]}, ${artistNameArray[1]}`;
  } else {
    return artistNameArray[0];
  }
};

const getCamelotKeyValue = (track: Track) => {
  const keyValue =
    parseInt(track.mode) === 0
      ? parseInt(camelotMinorKeyDict[parseInt(track.key)])
      : parseInt(camelotMajorKeyDict[parseInt(track.key)]) + 0.1;
  return keyValue;
};

export const camelotKeySort = (tempTracks: Track[]): Track[] => {
  tempTracks.sort((a: Track, b: Track) => {
    const aValue = getCamelotKeyValue(a);
    const bValue = getCamelotKeyValue(b);

    return aValue > bValue ? 1 : -1;
  });

  return tempTracks;
};

export const standardKeySort = (tempTracks: Track[]): Track[] => {
  // TODO: fix this
  console.log('tempTracks', tempTracks);
  tempTracks.sort((a, b) => {
    const { key: aKey, mode: aMode } = a;
    const { key: bKey, mode: bMode } = b;

    if (aMode !== bMode) {
      return parseInt(bMode) - parseInt(aMode);
    }

    return parseInt(aKey) - parseInt(bKey);
  });

  return tempTracks;
};

export const getKeyInfoArray = (trackKey, trackMode): any[] => {
  const camelotKey =
    String(trackMode) === '1'
      ? camelotMajorKeyDict[parseInt(trackKey)] + 'B'
      : camelotMinorKeyDict[parseInt(trackKey)] + 'A';

  const standardKey = `${keyDict[parseInt(trackKey)]}${
    String(trackMode) === '1' ? '' : 'm'
  }`;

  const inverseKey =
    String(trackMode) === '1'
      ? [String((parseInt(trackKey) + 9) % 12), '0']
      : [String((parseInt(trackKey) + 3) % 12), '1'];

  return [camelotKey, standardKey, inverseKey];
};
