import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Tracks from '../components/Tracks'
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';


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
        let trackTotalAmount = playlist.tracks.total;
        let tracklist = [];
        let offset = 0;
        let trackFeatures = [];

        while (trackTotalAmount > (tracklist.length)) {
          let tracksResponse = await axios({
            method: 'get',
            url: playlist.href + `/tracks?offset=${offset}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          });

          tracksResponse = tracksResponse.data.items.map((item) => {
            if (item.track) {
              return item
            } else {
              trackTotalAmount --;
              return undefined
            }
          })

          // remove null items
          tracksResponse = tracksResponse.filter(Boolean);
          const trackIds = tracksResponse.map((item) => item.track.id)

          const featuresResponse = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          })

          tracklist = [...tracklist, ...tracksResponse];
          trackFeatures = [...trackFeatures, ...featuresResponse.data.audio_features];

          offset += 100;
        }


        const splicedTracks = tracklist.map((item, index) => {
          return {
            "name": item.track.name,
            "artists": item.track.artists.length > 1 ? [item.track.artists[0].name, item.track.artists[1].name] : [item.track.artists[0].name],
            "id": item.track.id,
            "tempo": Math.round(trackFeatures[index].tempo),
            "key": trackFeatures[index].key,
            "mode": parseInt(trackFeatures[index].mode),
            "energy": Math.round((100-trackFeatures[index].energy.toFixed(2)*100))/100,
            "danceability": trackFeatures[index].danceability
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
