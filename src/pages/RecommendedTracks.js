import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';

import Tracks from '../components/Tracks'
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';


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
        width: 100%;

        display: flex;
        justify-content: space-between;

        .table_data__artist-name {
          font-style: italic;
        }
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
      .table-data__attributes-energy, .table-data__name__tooltip { {
        display: none;
      }

      .table-data__attributes {
        width: 15%;
      }
    }
  }
`

const TooltipUl = styled.ul`
  li {
    margin: 6px 0;
    display: flex;
    justify-content: space-between;

    span:first-child {
      font-style: italic;
    }
    span:last-child {
      margin-left: 4rem;
    }
  }

  .table-date__tooltip-genres {
    padding-bottom: 1rem;
    line-height: 1.1;
  }
`

const HtmlTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#484848',
    maxWidth: 1000,
    border: '1px solid #dadde9',
  },
}))(Tooltip);


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
        const artistIds = tracklist.map((track) => track.artists[0].id)

        let artistFeatures = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        let trackFeatures = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
        });

        trackFeatures = [...trackFeatures.data.audio_features];
        artistFeatures = [...artistFeatures.data.artists];




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
            "danceability": trackFeatures[index] != null ? trackFeatures[index].danceability : "",
            "acousticness": trackFeatures[index] != null ? trackFeatures[index].acousticness : "",
            "liveness": trackFeatures[index] != null ? trackFeatures[index].liveness : "",
            "loudness": trackFeatures[index] != null ? trackFeatures[index].loudness : "",
            "speechiness": trackFeatures[index] != null ? trackFeatures[index].speechiness : "",
            "valence": trackFeatures[index] != null ? trackFeatures[index].valence : "",

            "duration": item.duration_ms != null ? millisToMinutesAndSeconds(item.duration_ms) : "",
            "track_popularity": item.popularity != null ? item.popularity : "",
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
                  <span>
                    {recommendedTrack.name} – <span className="table_data__artist-name">
                      {recommendedTrack.artists.length > 1 ? recommendedTrack.artists[0] + ', ' + recommendedTrack.artists[1] : recommendedTrack.artists[0]}
                    </span>
                  </span>

                  <HtmlTooltip
                    className="table-data__name__tooltip"
                    placement="left"
                    title={
                      <TooltipUl>
                        <li className="table-date__tooltip-genres">
                          <span>Genres: </span>
                          <span>{recommendedTrack.artist_genres.join(", ")}.</span>
                        </li>

                        <li><span>Acousticness:</span> <span>{recommendedTrack.acousticness}</span></li>
                        <li><span>Duration:</span> <span>{recommendedTrack.duration}</span></li>
                        <li><span>Danceability:</span> <span>{recommendedTrack.danceability}</span></li>
                        <li><span>Liveness:</span> <span>{recommendedTrack.liveness}</span></li>
                        <li><span>Loudness:</span> <span>{recommendedTrack.loudness}</span></li>
                        <li><span>Popularity:</span> <span>{recommendedTrack.track_popularity}</span></li>
                        <li><span>Speechiness:</span> <span>{recommendedTrack.speechiness}</span></li>
                        <li><span>Valence:</span> <span>{recommendedTrack.valence}</span></li>
                      </TooltipUl>
                    }
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </HtmlTooltip>
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
