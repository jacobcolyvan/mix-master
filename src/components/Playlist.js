import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components'

// import sortBy from './components/SortBy'

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

  p {
    display: inline-block;
    border: 1px solid #c4c4c4;
    padding: 10px 4px;
    margin: 0;
  }

  #track-name {
    width: 70%
  }

  .track-data {
    width: 13.3%;
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


const Playlist = ({ token, playlist }) => {
  const [tracks, setTracks] = useState(false);
  const [audioFeatures, setAudioFeatures] = useState(false);

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
        const trackIds = tracklist.map((track) => track.track.id);

        const featuresResponse = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        })

        setAudioFeatures(featuresResponse.data.audio_features)
        setTracks(tracklist.map((track) => track.track));
      } catch (err) {
        console.log(err.message);
      }
    };

    getTracks();
  }, [token, playlist]);

  return (
    <div>
      <PlaylistName>{playlist.name}</PlaylistName>
      <p>{playlist.description}</p>
      <ul>
        <TracksLi>
          <p  id="track-name" class="table-headers">Track Name</p>
          <p className="table-headers track-data">Key</p>
          <p className="table-headers track-data">Tempo</p>
        </TracksLi>

        {(tracks && audioFeatures) && tracks.map((track, index) => (
          <TracksLi key={`track${index}`}>
            <p id="track-name">{track.name} – <i>{track.artists[0].name}</i></p>
            <p className="track-data">{keyDict[audioFeatures[index].key]}{audioFeatures[index].mode === 1 ? "" : "m"}</p>
            <p className="track-data">{Math.round(audioFeatures[index].tempo)}</p>
          </TracksLi>

        ))}
      </ul>
    </div>
  )
}

export default Playlist
