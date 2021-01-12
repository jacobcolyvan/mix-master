import React from 'react';
import styled from 'styled-components';

const keyDict = {
  "0": "C",
  "1": "C#",
  "2": "D",
  "3": "D#",
  "4": "E",
  "5": "F",
  "6": "F#",
  "7": "G",
  "8": "G#",
  "9": "A",
  "10": "A#",
  "11": "B"
};

const TracksLi = styled.li`
  border-radius: 4px;
  padding: 0;
  width: 100%;

  display: flex;

  p {
    display: inline-block;
    border: 1px solid #c4c4c4;
    padding: 10px 4px;
    margin: 0;
  }

  #track-name {
    flex-basis: 70%;
  }

  .track-data {

    flex-basis: 15%;
    text-align: center;
  }

  .table-headers {
    font-weight: bold;
    text-decoration: underline;
  }
`;


const Tracks = ({ sortedTracks, keyOption, camelotMajorKeyDict, camelotMinorKeyDict }) => {
  return (
    <ul>
        <TracksLi>
          <p  id="track-name" className="table-headers">Track Name</p>
          <p className="table-headers track-data">Key</p>
          <p className="table-headers track-data">BPM</p>
        </TracksLi>

        {(sortedTracks) && sortedTracks.map((track, index) => (
          <TracksLi key={`track${index}`}>
            <p id="track-name">{track.name} – <i>{track.artists.length > 1 ? track.artists[0] + ', ' + track.artists[1] : track.artists[0]}</i></p>
            <p className="track-data">
               {keyOption === 'camelot' ?
                `${track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMinorKeyDict[track.key]+"A"}`
                : `${keyDict[track.key]}${track.mode === 1 ? "" : "m"}`}
            </p>
            <p className="track-data">{track.tempo}</p>
          </TracksLi>

        ))}
      </ul>
  )
}

export default Tracks


// eslint-disable-next-line no-lone-blocks
{/* <p className="track-data">
    {keyOption === 'camelot' && `${track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMajorKeyDict[track.key]+"a"} / `}
    {keyDict[track.key]}{track.mode === 1 ? "" : "m"}
</p> */}
