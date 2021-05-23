import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';

import Tracks from '../components/Tracks'
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';


const PlaylistName = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const Playlist = () => {
  const { token, setTracks, setSortedTracks } = useContext(UserContext);
  const [ sortOption, setSortOption ] = useState('energyThenKey');
  const [ keyOption, setKeyOption ] = useState('camelot');
  const history = useHistory();
  const playlist = history.location.state.playlist;


  useEffect(() => {
    const getTracks = async () => {
      try {
        let trackTotalAmount = playlist.tracks.total;
        let offset = 0;
        let tracklist = [];
        let trackFeatures = [];
        let artistFeatures = []



        while (trackTotalAmount > (tracklist.length)) {
          let tracksResponse, featuresResponse, artistsResponse;
          try {
            tracksResponse = await axios({
              method: 'get',
              url: playlist.href + `/tracks?offset=${offset}&limit=50`,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
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
            const artistIds = tracksResponse.map((item) => item.track.artists[0].id)

            artistsResponse = await axios({
              method: 'get',
              url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json'
              }
            })


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
          artistFeatures = [...artistFeatures, ...artistsResponse.data.artists];

          offset += 50;
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
            "danceability": trackFeatures[index] != null ? trackFeatures[index].danceability : "",
            "acousticness": trackFeatures[index] != null ? trackFeatures[index].acousticness : "",
            "liveness": trackFeatures[index] != null ? trackFeatures[index].liveness : "",
            "loudness": trackFeatures[index] != null ? trackFeatures[index].loudness : "",
            "speechiness": trackFeatures[index] != null ? trackFeatures[index].speechiness : "",
            "valence": trackFeatures[index] != null ? trackFeatures[index].valence : "",

            "duration": item.track.duration_ms != null ? millisToMinutesAndSeconds(item.track.duration_ms) : "",
            "track_popularity": item.track.popularity != null ? item.track.popularity : "",
            "artist_genres": artistFeatures[index] != null ? artistFeatures[index].genres: "",
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
