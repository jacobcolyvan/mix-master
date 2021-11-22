const keyDict: { [key: number]: string } = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B',
};

const camelotMajorKeyDict: { [key: number]: string } = {
  0: '8',
  1: '3',
  2: '10',
  3: '5',
  4: '12',
  5: '7',
  6: '2',
  7: '9',
  8: '4',
  9: '11',
  10: '6',
  11: '1',
};

const camelotMinorKeyDict: { [key: number]: string } = {
  0: '5',
  1: '12',
  2: '7',
  3: '2',
  4: '9',
  5: '4',
  6: '11',
  7: '6',
  8: '1',
  9: '8',
  10: '3',
  11: '10',
};

const scopes: string[] = [
  'user-read-private',
  'playlist-read-private',
  'user-library-read',
  'user-top-read',
];

export { keyDict, camelotMajorKeyDict, camelotMinorKeyDict, scopes };
