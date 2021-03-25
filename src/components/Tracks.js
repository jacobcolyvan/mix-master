import React,  { useEffect, useContext, useState }  from 'react';
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


const TracksTable = styled.table`
  width: 100%;
  padding: 0;
  margin-top: 24px;

  border-collapse: collapse;

  tr  {
    width: 100%;
    margin: 0;

    td {
      margin: 0;
    }

    .table-data__name {
      text-align: left;
      width: 70%;
    }

    .table-data__attributes {
      text-align: center;
      width: 10%;
    }
  }

  td, th  {
    border: 1px solid #c4c4c4;
    padding: 10px 4px;
    margin: 0;
  }

  .key-data:hover, .track-name-span:hover {
    cursor: pointer;
  }

  .track-name-tr:hover {
    background-color: 	#F0F0F0;
  }

  .currently-selected {
    background-color: 	#E0E0E0;
  }
`


const Tracks = ({keyOption, sortOption }) => {
  const {
    tracks,
    sortedTracks,
    setSortedTracks,
    resetStates,
    setRecommendedTracksInfo
  } = useContext(UserContext);
  const history = useHistory();
  const [lastClickedTrack, setLastClickedTrack] = useState(false);



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

  const copyNameAndSaveAsCurrentTrack = (trackName, trackArtist, clickedTrackId) => {
    navigator.clipboard.writeText(`${trackName} ${trackArtist}`);
  
    if (lastClickedTrack) {
      let currentlySelected = document.getElementById(lastClickedTrack);
      currentlySelected.classList.remove("currently-selected");
    } 

    let nowSelected = document.getElementById(clickedTrackId);
    nowSelected.classList.add("currently-selected");
    setLastClickedTrack(clickedTrackId)
  };

  const goToRecommended = (track) => {
    resetStates();
    setRecommendedTracksInfo({"id": track.id, "key": track.key, "mode": track.mode});
    history.push('/recommended');
  }

  return (
      <TracksTable id="tracks-container">
        <thead>
          <tr>
            <th className="table-data__name">Track Name</th>
            <th className="table-data__attributes">Key</th>
            <th className="table-data__attributes">Enrgy</th>
            <th className="table-data__attributes">BPM</th>
          </tr>
        </thead>

        <tbody>
          {(sortedTracks) && sortedTracks.map((track, index) => (
            <tr key={`track${index}`} id={`track-${track.id}`} className={`track-name-tr`}>
              <td className="table-data__name">
                <span
                  className="track-name-span"
                  onClick={() => copyNameAndSaveAsCurrentTrack(track.name, track.artists[0], `track-${track.id}`)}
                >
                  {track.name} – <i>{track.artists.length > 1 ? track.artists[0] + ', ' + track.artists[1] : track.artists[0]}</i>
                </span>
              </td>
              <td
                className="table-data__attributes key-data"
                onClick={() => goToRecommended(track)}
              >
                {keyOption === 'camelot' ?
                  `${track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMinorKeyDict[track.key]+"A"}`
                  : `${keyDict[track.key]}${track.mode === 1 ? "" : "m"}`}
              </td>
              <td className="table-data__attributes">{track.energy}</td>
              <td className="table-data__attributes">{track.tempo}</td>
            </tr>
          ))}
        </tbody>
     </TracksTable>
  )
}

export default Tracks