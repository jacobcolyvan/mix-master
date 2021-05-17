import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
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

    @media screen and (max-width: 600px) {
      .table-data__attributes-energy {
        display: none;
      }

      .table-data__attributes {
        width: 15%;
      }
    }
  }
`


const RecommendedTracks = () => {
  const {token, setTracks, setSortedTracks} = useContext(UserContext);
  const [sortOption, setSortOption] = useState('energyThenKey');
  const [keyOption, setKeyOption] = useState('camelot');
  const history = useHistory();
  const recommendedTrack = history.location.state.recommendedTrack;


  useEffect(() => {
    const getTracks = async () => {
      try {
        const tracks1 = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}&limit=20&`
        +`target_key=${recommendedTrack.key}&target_mode=${recommendedTrack.mode}`,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        });

        // minor/major alternative scale
        const tracks2 = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}&limit=20&`
        +`target_key=${recommendedTrack.parsedKeys[2][0]}&target_mode=${recommendedTrack.parsedKeys[2][1]}`,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        });



        let tracklist = tracks1.data.tracks.concat(tracks2.data.tracks)

        // remove null items
        tracklist = tracklist.filter(Boolean);
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
        
        const splicedTracks = tracklist.filter((item, index) => trackFeatures[index] != null)
        .map((item, index) => {
          return {
            "name": item.name,
            "artists": item.artists.length > 1 ? [item.artists[0].name, item.artists[1].name] : [item.artists[0].name],
            "id": item.id && item.id,
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
                <th className="table-data__attributes table-data__attributes-energy">Enrgy</th>
                <th className="table-data__attributes">BPM</th>
              </tr>
            </thead>

            <tbody>
              <tr className={`track-name-tr`} id="recommended-track">
                <td 
                  className="table-data__name table-data__name-hover"
                  onClick={() => navigator.clipboard.writeText(`${recommendedTrack.name} ${recommendedTrack.artists[0]}`)}
                >
                  {recommendedTrack.name} – <i>{recommendedTrack.artists.length > 1 ? recommendedTrack.artists[0] + ', ' + recommendedTrack.artists[1] : recommendedTrack.artists[0]}</i>
                </td>
                <td
                  className="table-data__attributes key-data"
                >
                  {keyOption === 'camelot' ? recommendedTrack.parsedKeys[0] : recommendedTrack.parsedKeys[1]}
                </td>
                <td className="table-data__attributes table-data__attributes-energy">{recommendedTrack.energy}</td>
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
