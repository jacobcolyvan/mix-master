import { AttributeChoiceDetails } from '../types';

export const keyDict: { [key: number]: string } = {
  '0': 'C',
  '1': 'C#',
  '2': 'D',
  '3': 'D#',
  '4': 'E',
  '5': 'F',
  '6': 'F#',
  '7': 'G',
  '8': 'G#',
  '9': 'A',
  '10': 'A#',
  '11': 'B',
};

export const camelotMajorKeyDict: { [key: number]: string } = {
  '0': '8',
  '1': '3',
  '2': '10',
  '3': '5',
  '4': '12',
  '5': '7',
  '6': '2',
  '7': '9',
  '8': '4',
  '9': '11',
  '10': '6',
  '11': '1',
};

export const camelotMinorKeyDict: { [key: number]: string } = {
  '0': '5',
  '1': '12',
  '2': '7',
  '3': '2',
  '4': '9',
  '5': '4',
  '6': '11',
  '7': '6',
  '8': '1',
  '9': '8',
  '10': '3',
  '11': '10',
};

export const scopes: string[] = [
  'user-read-private',
  'playlist-read-private',
  'user-library-read',
  'user-top-read',
];

export const attributeChoices: AttributeChoiceDetails[] = [
  {
    input_name: 'tempo',
    extra_text: false,
    range_limit: 480,
    validateField: (value) => Number.isInteger(value) && value > 0 && value < 480,
  },
  {
    input_name: 'duration',
    extra_text: ' seconds', // this gets converted to ms at request creation
    range_limit: 3600,
    validateField: (value) => Number.isInteger(value) && value > 0 && value < 3600,
  },
  {
    input_name: 'popularity',
    extra_text: false,
    range_limit: 100,
    validateField: (value) => Number.isInteger(value) && value > 0 && value < 100,
  },
  {
    input_name: 'energy',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  {
    input_name: 'intrumentalness',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  {
    input_name: 'valence',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  {
    input_name: 'danceability',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  {
    input_name: 'liveness',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  {
    input_name: 'speechiness',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  {
    input_name: 'acousticness',
    extra_text: false,
    range_limit: 1,
    validateField: (value) => !isNaN(value) && value > 0 && value < 1,
  },
  // // Loudness is an available param but has a weird input range (db's)
  // {input_name: "loudness", range_limit: 1, takes_whole_numbers: true},
];
