import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Tracks from './Tracks'
import SortBy from './SortBy';
import KeySelect from './KeySelect';


const PlaylistName = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const Playlist = () => {
  const {token, playlist, setTracks, setSortedTracks} = useContext(UserContext);
  const [sortOption, setSortOption] = useState('tempoThenKey');
  const [keyOption, setKeyOption] = useState('camelot');


  useEffect(() => {
    const getTracks = async () => {
      try {
        const trackTotalAmount = playlist.tracks.total;
        console.log('trackTotalAmount :>> ', trackTotalAmount);
        let allTracks = false;
        let tracklist = [];
        // let track$
        let offset = 0;
        let trackFeatures = [];

        while (!allTracks) {
          const tracksResponse = await axios({
            method: 'get',
            url: playlist.href + `/tracks?offset=${offset}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          });

          const trackIds = tracksResponse.data.items.map((item) => item.track.id);
          const featuresResponse = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          })

          tracklist = [...tracklist, ...tracksResponse.data.items];
          trackFeatures = [...trackFeatures, ...featuresResponse.data.audio_features];

          trackTotalAmount > tracklist.length ? offset += 100 : allTracks = true;
        }

        const splicedTracks = tracklist.map((item, index) => {
          return {
            "name": item.track.name,
            "artists": item.track.artists.length > 1 ? [item.track.artists[0].name, item.track.artists[1].name] : [item.track.artists[0].name],
            "id": item.track.id,
            "tempo": Math.round(trackFeatures[index].tempo),
            "key": trackFeatures[index].key,
            "mode": parseInt(trackFeatures[index].mode)
          }
        })

        setTracks([...splicedTracks]);
        setSortedTracks([...splicedTracks]);
      } catch (err) {
        console.log(err.message);
      }
    };

    getTracks();
  }, [token, playlist, setTracks, setSortedTracks]);





  return (
    <div>
      <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
      <br/>
      <PlaylistName>{playlist.name}</PlaylistName>
      {/* <p>{playlist.description}</p> */}

      <SortBy sortOption={sortOption} setSortOption={setSortOption} />

      <Tracks
        sortOption={sortOption}
        keyOption={keyOption}
      />
    </div>
  )
}

export default Playlist
