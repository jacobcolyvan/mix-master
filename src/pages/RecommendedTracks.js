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

const RecommendedTrackDiv = styled.div`
  p {
    margin-bottom: 0;
    font-style: italic;
  }

  table {
    margin-top: 12px;
    width: 100%;
    padding: 0;

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

    .track-name-span:hover {
      cursor: pointer;
    }
  }
`


const RecommendedTracks = () => {
  const {token, setTracks, setSortedTracks, recommendedTrack} = useContext(UserContext);
  const [sortOption, setSortOption] = useState('tempoThenKey');
  const [keyOption, setKeyOption] = useState('camelot');


  useEffect(() => {
    const getTracks = async () => {
      try {
        let tracklist = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}&limit=30&`
        +`target_key=${recommendedTrack.key}&target_mode=${recommendedTrack.mode}`,
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
            "energy": Math.round(100-trackFeatures[index].energy.toFixed(2)*100)/100,
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
  }, [token, setTracks, setSortedTracks, recommendedTrack]);



  return (
    <div>
        <PageTitle>RECOMMENDED TRKs</PageTitle>
        <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
        <br/>

        <SortBy sortOption={sortOption} setSortOption={setSortOption} />
        <br/><hr/>

        <RecommendedTrackDiv>
          <p>Tracks were recommended off this track:</p>
          <table>
            <thead>
              <tr>
                <th className="table-data__name">Track</th>
                <th className="table-data__attributes">Key</th>
                <th className="table-data__attributes">Enrgy</th>
                <th className="table-data__attributes">BPM</th>
              </tr>
            </thead>

            <tbody>
              <tr className={`track-name-tr`} id="recommended-track">
                <td className="table-data__name">
                  <span
                    onClick={() => navigator.clipboard.writeText(`${recommendedTrack.name} ${recommendedTrack.artist}`)}
                    className="track-name-span"
                  >
                    {recommendedTrack.name} – <i>{recommendedTrack.artists.length > 1 ? recommendedTrack.artists[0] + ', ' + recommendedTrack.artists[1] : recommendedTrack.artists[0]}</i>
                  </span>
                </td>
                <td
                  className="table-data__attributes key-data"
                >
                  {keyOption === 'camelot' ? recommendedTrack.parsedKeys[0] : recommendedTrack.parsedKeys[1]}
                </td>
                <td className="table-data__attributes">{recommendedTrack.energy}</td>
                <td className="table-data__attributes">{recommendedTrack.tempo}</td>
              </tr>
            </tbody>
          </table>
        </RecommendedTrackDiv>
        
        <br/><hr/>

        <Tracks
            sortOption={sortOption}
            keyOption={keyOption}
        />
    </div>
  )
}

export default RecommendedTracks;
