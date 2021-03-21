import React,  { useEffect, useContext }  from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';

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

const camelotMajorKeyDict = {
  "0": "8",
  "1": "3",
  "2": "10",
  "3": "5",
  "4": "12",
  "5": "7",
  "6": "2",
  "7": "9",
  "8": "4",
  "9": "11",
  "10": "6",
  "11": "1"
};

const camelotMinorKeyDict = {
  "0": "5",
  "1": "12",
  "2": "7",
  "3": "2",
  "4": "9",
  "5": "4",
  "6": "11",
  "7": "6",
  "8": "1",
  "9": "8",
  "10": "3",
  "11": "10"
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

  #track-name, .track-details {
    flex-basis: 70%;
  }

  .key-data:hover, .track-name-p:hover {
    cursor: pointer;
  }

  .track-data {
    flex-basis: 12%;
    text-align: center;
  }

  .table-headers {
    font-weight: bold;
    text-decoration: underline;
  }
`;


const Tracks = ({keyOption, sortOption }) => {
  const {
    tracks,
    sortedTracks,
    setSortedTracks,
    resetStates,
    setRecommendedTracksInfo
  } = useContext(UserContext);
  const history = useHistory();


  useEffect(() => {
    const camelotSort = (temp) => {
      temp = temp.sort((a, b) => { return a - b });
      temp = temp.sort((a, b) => {
        a = (a.mode === 0 ? (parseInt(camelotMinorKeyDict[a.key])) : (parseInt(camelotMajorKeyDict[a.key])));
        b = (b.mode === 0 ? (parseInt(camelotMinorKeyDict[b.key])) : (parseInt(camelotMajorKeyDict[b.key])));

        return a > b ? 1 : -1;
      });

      return temp;
    }

    // This is a function for standard non-camelot key sort
    const keySort = (temp) => {
      temp.sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
      temp = temp.sort((a, b) => parseInt(a.key) - parseInt(b.key));

      return temp;
    }

    const sorter = (sort) => {
      if (tracks) {
        if (sort === 'key') {
          setSortedTracks(keyOption === 'camelot' ? camelotSort([...tracks]) : keySort([...tracks]));
        } else if (sort === 'tempo') {
          const temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo));

          setSortedTracks(temp);
        } else if (sort === 'tempoThenKey') {
          let temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo));

          setSortedTracks(keyOption === 'camelot' ? camelotSort(temp) : keySort(temp));
        } else {
          setSortedTracks([...tracks])
        }
      }
    };

    sorter(sortOption);
  }, [sortOption, tracks, keyOption, setSortedTracks]);

  const copyToClipboard = (trackName, trackArtist) => {
    navigator.clipboard.writeText(`${trackName} ${trackArtist}`);
  };

  const goToRecommended = (track) => {
    resetStates();
    setRecommendedTracksInfo({"id": track.id, "key": track.key, "mode": track.mode});
    history.push('/recommended');
  }

  return (
    <ul className="tracks-container">
        <TracksLi>
          <p  id="track-name" className="table-headers">Track Name</p>
          <p className="table-headers track-data">Key</p>
          <p className="table-headers track-data">Enrgy</p>
          <p className="table-headers track-data">BPM</p>
        </TracksLi>

        {(sortedTracks) && sortedTracks.map((track, index) => (
          <TracksLi key={`track${index}`}>
            <p className="track-details">
              <span
                className="track-name-p"
                onClick={() => copyToClipboard(track.name, track.artists[0])}
              >
                {track.name}
              </span> – <i>{track.artists.length > 1 ? track.artists[0] + ', ' + track.artists[1] : track.artists[0]}</i>
            </p>
            <p
              className="track-data key-data"
              onClick={() => goToRecommended(track)}
            >
               {keyOption === 'camelot' ?
                `${track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMinorKeyDict[track.key]+"A"}`
                : `${keyDict[track.key]}${track.mode === 1 ? "" : "m"}`}
            </p>
            <p className="track-data">{track.energy}</p>
            <p className="track-data">{track.tempo}</p>
          </TracksLi>

        ))}
      </ul>
  )
}

export default Tracks