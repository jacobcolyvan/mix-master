import React,  { useEffect, useContext }  from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Loading from '../components/Loading';


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

  tr {
    width: 100%;
    margin: 0;

    td {
      margin: 0;
    }

    .table-data__name {
      text-align: left;
      width: 100%;

      display: flex;
      justify-content: space-between;

      .table_data__artist-name {
        font-style: italic;
      }
    }

    .table-data__name-hover:hover {
      cursor: pointer;
      background-color: 	#424242;
      * {
        background-color: 	#424242;
      }
    }

    .table-data__attributes {
      text-align: center;
      width: 10%;
    }
  }

  td, th  {
    border: 1px solid #424242;
    padding: 10px 4px;
    margin: 0;
  }

  .key-data:hover {
    cursor: alias;
  }

  .currently-selected {
    background-color: 	#484848;
    * {
      background-color: 	#484848;
    }
  }

  @media screen and (max-width: 600px) {
    .table-data__attributes-energy {
      display: none;
    }

    .table-data__attributes {
      width: 15%;
    }
  }

  @media screen and (max-width: 400px) {
    .table-data__name__tooltip {
      display: none;
    }
  }
`

const TooltipUl = styled.ul`
  li {
    margin: 6px 0;
    display: flex;
    justify-content: space-between;

    span:first-child {
      font-style: italic;
    }
    span:last-child {
      margin-left: 4rem;
    }
  }

  .table-date__tooltip-genres {
    padding-bottom: 1rem;
    line-height: 1.1;
  }
`

const HtmlTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#484848',
    maxWidth: 600,
    width: "auto",
    border: '1px solid #dadde9',
  },
}))(Tooltip);


const Tracks = ({keyOption, sortOption }) => {
  const {
    tracks,
    sortedTracks,
    setSortedTracks,
    resetStates,
    lastClickedTrack,
    setLastClickedTrack,
  } = useContext(UserContext);
  const history = useHistory();


  useEffect(() => {
    const camelotSort = (temp) => {
      temp = temp.sort((a, b) => { return a - b });
      temp = temp.sort((a, b) => {
        a = (a.mode === 0 ? (parseInt(camelotMinorKeyDict[a.key])) : (parseInt(camelotMajorKeyDict[a.key]))+0.1);
        b = (b.mode === 0 ? (parseInt(camelotMinorKeyDict[b.key])) : (parseInt(camelotMajorKeyDict[b.key]))+0.1);

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
        if (sort === 'tempo') {
          const temp = [...tracks].sort((a, b) => parseInt(a.tempo) - parseInt(b.tempo));

          setSortedTracks(temp);
        } else if (sort === 'duration') {
          let temp = [...tracks].sort((a, b) => parseInt(b.duration) - parseInt(a.duration));

          setSortedTracks(temp)
        } else if (sort === 'popularity') {
          let temp = [...tracks].sort((a, b) => parseInt(b.track_popularity) - parseInt(a.track_popularity));

          setSortedTracks(temp)
        } else if (sort === 'valence') {
          let temp = [...tracks].sort((a, b) => parseFloat(b.valence) - parseFloat(a.valence));

          setSortedTracks(temp)
        } else if (sort === 'durationThenKey') {
          let temp = [...tracks].sort((a, b) => parseInt(b.duration) - parseInt(a.duration));

          setSortedTracks(keyOption === 'camelot' ? camelotSort(temp) : keySort(temp));
        } else if (sort === 'tempoThenKey') {
          let temp = [...tracks].sort((a, b) => parseInt(a.tempo) - parseInt(b.tempo));

          setSortedTracks(keyOption === 'camelot' ? camelotSort(temp) : keySort(temp));
        } else if (sort === 'energyThenKey') {
          let temp = [...tracks].sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));

          setSortedTracks(keyOption === 'camelot' ? camelotSort(temp) : keySort(temp));
        } else if (sort === 'valenceThenKey') {
          let temp = [...tracks].sort((a, b) => parseFloat(b.valence) - parseFloat(a.valence));

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
    resetStates(false);
    const recommendedTrack = {
      "id": track.id,
      "key": track.key,
      "parsedKeys": [
        `${track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMinorKeyDict[track.key]+"A"}`,
        `${keyDict[track.key]}${track.mode === 1 ? "" : "m"}`,
        // find the inverse major/minor key
        track.mode === 1 ? [  (track.key+9)%12, 0] : [(track.key+3)%12, 1],
      ],
      "mode": track.mode,
      "name": track.name,
      "artists": track.artists,
      "energy": track.energy,
      "tempo": track.tempo,
      "acousticness": track.acousticness,
      "liveness": track.liveness,
      "loudness": track.loudness,
      "speechiness": track.speechiness,
      "valence": track.valence,

      "duration": track.duration,
      "track_popularity": track.track_popularity,
      "artist_genres": track.artist_genres,
      "album": track.album
    };

    history.push({
      pathname: '/recommended',
      search: `?id=${track.id}`
    },
    {
      recommendedTrack: recommendedTrack,
    })
  }

  if (sortedTracks) {
    return (
      <TracksTable id="tracks-container">
        <thead>
          <tr>
            <th className="table-data__name">Track</th>
            <th className="table-data__attributes">Key</th>
            <th className="table-data__attributes table-data__attributes-energy">Enrgy</th>
            <th className="table-data__attributes">BPM</th>
          </tr>
        </thead>

        <tbody>
          {(sortedTracks) && sortedTracks.map((track, index) => (
            <tr key={`track${index}`} className={`track-name-tr`}>
                <td
                  className="table-data__name table-data__name-hover"
                  id={`track-${track.id}`}
                  onClick={() => copyNameAndSaveAsCurrentTrack(track.name, track.artists[0], `track-${track.id}`)}
                >
                  <span>
                    {track.name} – <span className="table_data__artist-name">
                      {track.artists.length > 1 ? track.artists[0] + ', ' + track.artists[1] : track.artists[0]
                    }</span>
                  </span>

                  <HtmlTooltip
                    className="table-data__name__tooltip"
                    placement="left"
                    tabIndex="0"
                    title={
                      <TooltipUl>
                        <li className="table-date__tooltip-genres">
                          <span>Genres:</span>
                          <span>{track.artist_genres.join(", ")}.</span>
                        </li>

                        <li><span>Duration:</span> <span>{track.duration}</span></li>
                        <li><span>Danceability:</span> <span>{track.danceability}</span></li>
                        <li><span>Valence:</span> <span>{track.valence}</span></li>
                        <li><span>Acousticness:</span> <span>{track.acousticness}</span></li>
                        <li><span>Liveness:</span> <span>{track.liveness}</span></li>
                        <li><span>Loudness:</span> <span>{track.loudness}</span></li>
                        <li><span>Popularity:</span> <span>{track.track_popularity}</span></li>
                        <li><span>Speechiness:</span> <span>{track.speechiness}</span></li>
                        <li><span>Key:</span> <span>{keyDict[track.key]}{track.mode === 1 ? "" : "m"}</span></li>
                        <li><span>Album:</span> <span>{track.album}</span></li>
                      </TooltipUl>
                    }
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </HtmlTooltip>
                </td>
              <td
                className="table-data__attributes key-data"
                onClick={() => goToRecommended(track)}
              >
                {keyOption === 'camelot' ?
                  `${track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMinorKeyDict[track.key]+"A"}` :
                  `${keyDict[track.key]}${track.mode === 1 ? "" : "m"}`}
              </td>
              <td className="table-data__attributes table-data__attributes-energy">{ track.energy && track.energy}</td>
              <td className="table-data__attributes">{track.tempo && track.tempo}</td>
            </tr>
          ))}
        </tbody>
      </TracksTable>
    )
  } else {
    return (
      <Loading/>
    )
  }
};

export default Tracks;