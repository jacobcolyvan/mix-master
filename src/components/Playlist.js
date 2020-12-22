import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import SortBy from './SortBy'

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
}

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
}

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
}

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
`

const PlaylistName = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const Playlist = () => {
  const {token, playlist} = useContext(UserContext);
  const [tracks, setTracks] = useState(false);
  const [sortedTracks, setSortedTracks] = useState(false);
  const [sortOption, setSortOption] = useState('tempoThenKey')


  useEffect(() => {
    const getTracks = async () => {
      try {
        const tracksResponse = await axios({
          method: 'get',
          url: playlist.href,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        const tracklist = tracksResponse.data.tracks.items;
        const trackIds = tracklist.map((item) => item.track.id);

        const featuresResponse = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        })

        const splicedTracks = tracklist.map((item, index) => {
          return {
            "name": item.track.name,
            "artist": item.track.artists[0].name,
            "id": item.track.id,
            "tempo": Math.round(featuresResponse.data.audio_features[index].tempo),
            "key": featuresResponse.data.audio_features[index].key,
            "mode": featuresResponse.data.audio_features[index].mode
          }
        })

        setTracks([...splicedTracks]);
        setSortedTracks([...splicedTracks]);
      } catch (err) {
        console.log(err.message);
      }
    };

    getTracks();
  }, [token, playlist]);


  useEffect(() => {
    const camelotSort = (temp) => {
      temp = temp.sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
      temp = temp.sort((a, b) => {
        a = a.mode === "0" ? (parseInt(camelotMinorKeyDict[a.key])) : (parseInt(camelotMajorKeyDict[a.key]));
        b = b.mode === "0" ? (parseInt(camelotMinorKeyDict[b.key])) : (parseInt(camelotMajorKeyDict[b.key]));

        // return b.toString().localeCompare(a.toString());
        return a > b ? 1 : -1;
      });

      return temp;
    }

    // // This is a function for standard non-camelot key sort
    // const keySort = () => {
    //   let temp = [...tracks].sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
    //   temp = temp.sort((a, b) => parseInt(a.key) - parseInt(b.key));

    //   return temp;
    // }

    const sorter = (sort) => {
      if (tracks) {
        if (sort === 'key') {
          setSortedTracks(camelotSort([...tracks]));
        } else if (sort === 'tempo') {
          const temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo))

          setSortedTracks(temp)
        } else if (sort === 'tempoThenKey') {
          let temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo));

          setSortedTracks(camelotSort(temp));
        } else {
          setSortedTracks([...tracks])
        }
      }
    }

    sorter(sortOption)

  }, [sortOption, tracks])



  return (
    <div>
      <PlaylistName>{playlist.name}</PlaylistName>
      {/* <p>{playlist.description}</p> */}

      <SortBy sortOption={sortOption} setSortOption={setSortOption} />

      <ul>
        <TracksLi>
          <p  id="track-name" className="table-headers">Track Name</p>
          <p className="table-headers track-data">Key</p>
          <p className="table-headers track-data">BPM</p>
        </TracksLi>

        {(sortedTracks) && sortedTracks.map((track, index) => (
          <TracksLi key={`track${index}`}>
            <p id="track-name">{track.name} – <i>{track.artist}</i></p>
            <p className="track-data">
               {track.mode === 1 ? camelotMajorKeyDict[track.key]+"B" : camelotMajorKeyDict[track.key]+"A"}
               / {keyDict[track.key]}{track.mode === 1 ? "" : "m"}
            </p>

            <p className="track-data">{track.tempo}</p>
          </TracksLi>

        ))}
      </ul>
    </div>
  )
}

export default Playlist
