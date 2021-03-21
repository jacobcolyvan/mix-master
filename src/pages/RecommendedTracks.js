import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Tracks from '../components/Tracks'
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';

const PageTitle = styled.h2`
  text-decoration: underline;
  font-style: italic;
`


const RecommendedTracks = () => {
  const {token, setTracks, setSortedTracks, recommendedTracksInfo} = useContext(UserContext);
  const [sortOption, setSortOption] = useState('tempoThenKey');
  const [keyOption, setKeyOption] = useState('camelot');


  useEffect(() => {
    const getTracks = async () => {
      try {
        let tracklist = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTracksInfo.id}&limit=30&`
        +`target_key=${recommendedTracksInfo.key}&target_mode=${recommendedTracksInfo.mode}`,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        });

        // remove null items
        tracklist = tracklist.data.tracks.filter(Boolean);
        const trackIds = tracklist.map((track) => track.id)

        let trackFeatures = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        })

        trackFeatures = [...trackFeatures.data.audio_features]

        const splicedTracks = tracklist.map((track, index) => {
          return {
            "name": track.name,
            "artists": track.artists.length > 1 ? [track.artists[0].name, track.artists[1].name] : [track.artists[0].name],
            "id": track.id,
            "tempo": Math.round(trackFeatures[index].tempo),
            "key": trackFeatures[index].key,
            "mode": parseInt(trackFeatures[index].mode),
            "energy": trackFeatures[index].energy,
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
  }, [token, setTracks, setSortedTracks, recommendedTracksInfo]);



  return (
    <div>
        <PageTitle>RECOMMENDED TRKs</PageTitle>
        <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
        <br/>

        <SortBy sortOption={sortOption} setSortOption={setSortOption} />
        <br/><hr/>

        <Tracks
            sortOption={sortOption}
            keyOption={keyOption}
        />
    </div>
  )
}

export default RecommendedTracks;
