import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
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
  const { token, setTracks, setSortedTracks } = useContext(UserContext);
  const [ sortOption, setSortOption ] = useState('tempoThenKey');
  const [ keyOption, setKeyOption ] = useState('camelot');
  const history = useHistory();
  const playlist = history.location.state.playlist;


  useEffect(() => {
    const getTracks = async () => {
      try {
        let trackTotalAmount = playlist.tracks.total;
        let tracklist = [];
        let offset = 0;
        let trackFeatures = [];



        while (trackTotalAmount > (tracklist.length)) {
          let tracksResponse, featuresResponse
          try {
            tracksResponse = await axios({
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

            featuresResponse = await axios({
              method: 'get',
              url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
              }
            })
          } catch (error) {
            console.log(error)
          }

          tracklist = [...tracklist, ...tracksResponse];
          trackFeatures = [...trackFeatures, ...featuresResponse.data.audio_features];

          offset += 100;
        }

        // expensive fix for null trackFeatures; flatMap?
        const splicedTracks = tracklist.filter((item, index) => trackFeatures[index] != null)
        .map((item, index) => {
          return {
            "name": item.track.name,
            "artists": item.track.artists.length > 1 ? [item.track.artists[0].name, item.track.artists[1].name] : [item.track.artists[0].name],
            "id": item.track.id && item.track.id,
            "tempo": trackFeatures[index] != null ? Math.round(trackFeatures[index].tempo) : "",
            "key": trackFeatures[index] != null ? trackFeatures[index].key : "",
            "mode": trackFeatures[index] != null ? parseInt(trackFeatures[index].mode) : "",
            "energy": trackFeatures[index] != null ? Math.round((100-trackFeatures[index].energy.toFixed(2)*100))/100 : "",
            "danceability": trackFeatures[index] != null ? trackFeatures[index].danceability : ""
          }
        })

        setTracks([...splicedTracks]);
        setSortedTracks([...splicedTracks]);
      } catch (err) {
        console.log(err.message);
      }
    };

    getTracks();
  }, [token, setTracks, setSortedTracks, playlist.href, playlist.tracks.total]);



  return (
    <div>
      <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
      <br />
      <SortBy sortOption={sortOption} setSortOption={setSortOption} />

      {playlist && (
        <PlaylistName>{playlist.name}</PlaylistName>
      )}

      <Tracks
        sortOption={sortOption}
        keyOption={keyOption}
      />
    </div>
  )
}

export default Playlist;



// const getPlaylist = async () => {
//   const playlistId = history.location.pathname.split('/')[2];
//   const playlistResponse = await axios({
//     method: 'get',
//     url: `https://api.spotify.com/v1/playlists/${playlistId}`,
//     headers: {
//       Authorization: 'Bearer ' + token,
//       'Content-Type': 'application/json'
//     }
//   });
//   setPlaylistName(playlistResponse.data.name)
//   return playlistResponse.data;
// }
