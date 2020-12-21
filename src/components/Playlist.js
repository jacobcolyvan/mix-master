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
  const [sortOption, setSortOption] = useState('default')


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

  const sorter = (sort) => {
    if (sort === 'key') {
      let temp = [...tracks].sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
      temp = temp.sort((a, b) => parseInt(a.key) - parseInt(b.key));

      setSortedTracks(temp);
    } else if (sort === 'tempo') {
      const temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo))

      setSortedTracks(temp)
    } else if (sort === 'tempoThenKey') {
      let temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo))
      temp = temp.sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
      temp = temp.sort((a, b) => parseInt(a.key) - parseInt(b.key));

      setSortedTracks(temp);
    } else {
      setSortedTracks([...tracks])
    }
  }


  return (
    <div>
      <PlaylistName>{playlist.name}</PlaylistName>
      {/* <p>{playlist.description}</p> */}

      <SortBy sortOption={sortOption} setSortOption={setSortOption} sorter={sorter}/>

      <ul>
        <TracksLi>
          <p  id="track-name" className="table-headers">Track Name</p>
          <p className="table-headers track-data">Key</p>
          <p className="table-headers track-data">BPM</p>
        </TracksLi>

        {(sortedTracks) && sortedTracks.map((track, index) => (
          <TracksLi key={`track${index}`}>
            <p id="track-name">{track.name} – <i>{track.artist}</i></p>
            <p className="track-data">{keyDict[track.key]}{track.mode === 1 ? "" : "m"}</p>
            <p className="track-data">{track.tempo}</p>
          </TracksLi>

        ))}
      </ul>
    </div>
  )
}

export default Playlist
