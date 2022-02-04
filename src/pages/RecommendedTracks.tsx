import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';
import { keyDict } from '../utils/CommonVariables';

import Tracks from '../components/Tracks';
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';
import RecTweaks from '../components/RecTweaks';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

const HtmlTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#484848',
    maxWidth: 1000,
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const RecommendedTracks = () => {
  const {
    token,
    setTracks,
    setSortedTracks,
    handleAuthError,
    matchRecsToSeedTrackKey,
    seedParams,
  } = useContext(UserContext);
  const history: any = useHistory();
  const recommendedTrack = history.location.state.recommendedTrack;
  // const seedParams = history.location.state.seedParams;
  const [sortOption, setSortOption] = useState('default');
  const [keyOption, setKeyOption] = useState('camelot');

  const getTracks = async (recommendedTrack: { [key: string]: any[] }) => {
    setSortedTracks(false);

    try {
      const generateUrl = (currentUrl: string, limit = 10) => {
        currentUrl += `&limit=${limit}`;

        // // other available api seeds
        // if (artistSeed) url += `&seed_artists=${ artistSeed.map(artist => artist.id).join(',') }`;
        // if (trackSeed) url += `&seed_tracks=${ trackSeed.map(track => track.id).join(',') }`;
        // if (mode) url += `&target_mode=${mode}`

        Object.keys(seedParams).forEach((param) => {
          if (seedParams[param] && param !== 'genre') {
            currentUrl += `&${seedParams[param].maxOrMin}_${param}=${seedParams[param].value}`;
          } else if (seedParams[param] && param === 'genre') {
            currentUrl += `&seed_genres=${seedParams['genre'].value}`;
          }
        });

        console.log(currentUrl);
        return currentUrl;
      };

      const getTracksFromSpotify = async (url: string, limit: number) => {
        const tracks = await axios({
          method: 'get',
          url: generateUrl(url, limit),
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
        });

        return tracks.data.tracks;
      };

      let tracklist;
      if (matchRecsToSeedTrackKey) {
        // match key
        const url1 =
          `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}` +
          // conditional here to account for any missing track attributes
          `${
            recommendedTrack.key || recommendedTrack.key === 0
              ? `&target_key=${recommendedTrack.key}`
              : ''
          }` +
          `${
            recommendedTrack.mode || recommendedTrack.mode === 0
              ? `&target_mode=${recommendedTrack.mode}`
              : ''
          }`;
        const tracks1 = await getTracksFromSpotify(url1, 25);

        // minor/major alternative scale
        const url2 =
          `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}` +
          `${
            recommendedTrack.parsedKeys[2][0] ||
            recommendedTrack.parsedKeys[2][0] === 0
              ? `&target_key=${recommendedTrack.parsedKeys[2][0]}`
              : ''
          }` +
          `${
            recommendedTrack.parsedKeys[2][1] ||
            recommendedTrack.parsedKeys[2][1] === 0
              ? `&target_mode=${recommendedTrack.parsedKeys[2][1]}`
              : ''
          }`;
        const tracks2 = await getTracksFromSpotify(url2, 15);

        tracklist = tracks1.concat(tracks2);
      } else {
        // Recommendations without key param
        const url = `https://api.spotify.com/v1/recommendations?market=AU&seed_tracks=${recommendedTrack.id}`;

        tracklist = await getTracksFromSpotify(url, 40);
      }

      // remove any null items
      tracklist = tracklist.filter(Boolean);

      // remove duplicates (result of multiple calls)
      tracklist = tracklist.reduce((accumulator, current) => {
        if (!accumulator.find((el) => el.id === current.id)) {
          accumulator.push(current);
        }

        return accumulator;
      }, []);

      const trackIds = tracklist.map((track) => track.id);
      const artistIds = tracklist.map((track) => track.artists[0].id);

      let artistFeatures: any[] | AxiosResponse<any> = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      let trackFeatures: any[] | AxiosResponse<any> = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(
          ','
        )}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      artistFeatures = [...artistFeatures.data.artists];
      trackFeatures = [...trackFeatures.data.audio_features];

      const splicedTracks = tracklist
        .filter((_, index) => trackFeatures[index] != null)
        .map((item, index) => {
          return {
            name: item.name,
            artists:
              item.artists.length > 1
                ? [item.artists[0].name, item.artists[1].name]
                : [item.artists[0].name],
            id: item.id && item.id,
            tempo:
              trackFeatures[index] != null
                ? Math.round(trackFeatures[index].tempo)
                : '',
            key: trackFeatures[index] != null ? trackFeatures[index].key : '',
            mode:
              trackFeatures[index] != null
                ? parseInt(trackFeatures[index].mode)
                : '',
            energy:
              trackFeatures[index] != null
                ? Math.round(trackFeatures[index].energy.toFixed(2) * 100) / 100
                : '',
            danceability:
              trackFeatures[index] != null
                ? trackFeatures[index].danceability
                : '',
            acousticness:
              trackFeatures[index] != null
                ? trackFeatures[index].acousticness
                : '',
            liveness:
              trackFeatures[index] != null ? trackFeatures[index].liveness : '',
            loudness:
              trackFeatures[index] != null ? trackFeatures[index].loudness : '',
            speechiness:
              trackFeatures[index] != null
                ? trackFeatures[index].speechiness
                : '',
            valence:
              trackFeatures[index] != null ? trackFeatures[index].valence : '',

            duration:
              item.duration_ms != null
                ? millisToMinutesAndSeconds(item.duration_ms)
                : '',
            track_popularity: item.popularity != null ? item.popularity : '',
            artist_genres:
              artistFeatures[index] != null ? artistFeatures[index].genres : '',
            album: item.album.name ? item.album.name : '',
            release_date: item.album.release_date
              ? item.album.release_date
              : '',
          };
        });

      setTracks([...splicedTracks]);
      setSortedTracks([...splicedTracks]);
    } catch (err) {
      console.log(err.message);
      if (err.response?.status === 401) handleAuthError();
    }
  };

  useEffect(() => {
    getTracks(recommendedTrack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedTrack, matchRecsToSeedTrackKey, seedParams]);

  return (
    <div>
      <h2 className="recommended-page-title">Recommended Tracks</h2>
      <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
      <SortBy sortOption={sortOption} setSortOption={setSortOption} />

      <RecTweaks getTracks={getTracks} recommendedTrack={recommendedTrack} />

      <br />

      <div className="recommended-track__div">
        <p>Tracks were recommended from this track:</p>
        <table>
          <thead>
            <tr>
              <th className="table-data__name">Track</th>
              <th className="table-data__attributes">Key</th>
              <th className="table-data__attributes table-data__attributes-energy">
                Enrgy
              </th>
              <th className="table-data__attributes">BPM</th>
            </tr>
          </thead>

          <tbody>
            <tr className={`track-name-tr`} id="recommended-track">
              <td
                className="table-data__name table-data__name-hover"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${recommendedTrack.name} ${recommendedTrack.artists[0]}`
                  )
                }
              >
                <span>
                  {recommendedTrack.name} –{' '}
                  <span className="table_data__artist-name">
                    {recommendedTrack.artists.length > 1
                      ? recommendedTrack.artists[0] +
                        ', ' +
                        recommendedTrack.artists[1]
                      : recommendedTrack.artists[0]}
                  </span>
                </span>

                <HtmlTooltip
                  className="table-data__name__tooltip"
                  placement="left"
                  title={
                    <ul className="recommended-tooltip__ul">
                      <li className="table-date__tooltip-genres">
                        <span>Genres: </span>
                        <span>
                          {recommendedTrack.artist_genres.join(', ')}.
                        </span>
                      </li>

                      <li>
                        <span>Duration:</span>
                        <span>{recommendedTrack.duration}</span>
                      </li>
                      <li>
                        <span>Danceability:</span>
                        <span>{recommendedTrack.danceability}</span>
                      </li>
                      <li>
                        <span>Valence:</span>
                        <span>{recommendedTrack.valence}</span>
                      </li>
                      <li>
                        <span>Acousticness:</span>
                        <span>{recommendedTrack.acousticness}</span>
                      </li>
                      <li>
                        <span>Liveness:</span>
                        <span>{recommendedTrack.liveness}</span>
                      </li>
                      <li>
                        <span>Loudness:</span>
                        <span>{recommendedTrack.loudness}</span>
                      </li>
                      <li>
                        <span>Popularity:</span>
                        <span>{recommendedTrack.track_popularity}</span>
                      </li>
                      <li>
                        <span>Speechiness:</span>
                        <span>{recommendedTrack.speechiness}</span>
                      </li>

                      <br />
                      <li>
                        <span>Key:</span>
                        <span>
                          {keyDict[recommendedTrack.key]}
                          {recommendedTrack.mode === 1 ? '' : 'm'}
                        </span>
                      </li>
                      <li>
                        <span>Album:</span>
                        <span>{recommendedTrack.album}</span>
                      </li>
                      <li>
                        <span>Released:</span>
                        <span>{recommendedTrack.release_date}</span>
                      </li>
                    </ul>
                  }
                >
                  <InfoOutlinedIcon fontSize="small" />
                </HtmlTooltip>
              </td>
              <td className="table-data__attributes key-data">
                {keyOption === 'camelot'
                  ? recommendedTrack.parsedKeys[0]
                  : recommendedTrack.parsedKeys[1]}
              </td>
              <td className="table-data__attributes table-data__attributes-energy">
                {recommendedTrack.energy}
              </td>
              <td className="table-data__attributes">
                {recommendedTrack.tempo}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Tracks sortOption={sortOption} keyOption={keyOption} />
    </div>
  );
};

export default RecommendedTracks;
