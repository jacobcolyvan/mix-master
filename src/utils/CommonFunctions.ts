import { Track } from '../types';
import { camelotMajorKeyDict, camelotMinorKeyDict } from './CommonVariables';

export const millisToMinutesAndSeconds = (millis: number) => {
  const minutes: string = String(Math.floor(millis / 60000) + 1);
  const seconds: number = parseInt(((millis % 60000) / 1000).toFixed(0));

  return seconds === 60
    ? minutes + ':00'
    : minutes + ':' + (seconds < 10 ? '0' : '') + String(seconds);
};

export const camelotKeySort = (tempTracks: Track[]): Track[] => {
  tempTracks = tempTracks.sort((a: any, b: any) => {
    a =
      a.mode === 0
        ? parseInt(camelotMinorKeyDict[a.key])
        : parseInt(camelotMajorKeyDict[a.key]) + 0.1;
    b =
      b.mode === 0
        ? parseInt(camelotMinorKeyDict[b.key])
        : parseInt(camelotMajorKeyDict[b.key]) + 0.1;

    return a > b ? 1 : -1;
  });

  return tempTracks;
};

export const standardKeySort = (tempTracks: Track[]): Track[] => {
  tempTracks.sort((a, b) => parseInt(`${b.mode}`) - parseInt(`${a.mode}`));
  tempTracks = tempTracks.sort((a, b) => parseInt(a.key) - parseInt(b.key));

  return tempTracks;
};
