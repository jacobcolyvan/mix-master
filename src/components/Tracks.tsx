import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Loading from './Loading';

import {
  keyDict,
  camelotMajorKeyDict,
  camelotMinorKeyDict,
} from '../utils/CommonVariables';

const HtmlTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#484848',
    maxWidth: 600,
    width: 'auto',
    border: '1px solid #dadde9',
  },
}))(Tooltip);

interface TracksProps {
  keyOption: any;
  sortOption: any;
}

const Tracks = ({ keyOption, sortOption }: TracksProps) => {
  const {
    tracks,
    sortedTracks,
    setSortedTracks,
    resetStates,
    lastClickedTrack,
    setLastClickedTrack,
  } = useContext(UserContext);
  const history = useHistory();

  useEffect(() => {
    const camelotSort = (tempTracks: Array<{ [key: string]: any }>) => {
      // tempTracks = tempTracks.sort((a, b) => {
      //   return a - b;
      // });
      tempTracks = tempTracks.sort((a: any, b: any) => {
        a =
          a.mode === 0
            ? parseInt(camelotMinorKeyDict[a.key])
            : parseInt(camelotMajorKeyDict[a.key]) + 0.1;
        b =
          b.mode === 0
            ? parseInt(camelotMinorKeyDict[b.key])
            : parseInt(camelotMajorKeyDict[b.key]) + 0.1;

        return a > b ? 1 : -1;
      });

      return tempTracks;
    };

    // This is a function for standard non-camelot key sort
    const keySort = (tempTracks: Array<{ [key: string]: any }>) => {
      tempTracks.sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
      tempTracks = tempTracks.sort((a, b) => parseInt(a.key) - parseInt(b.key));

      return tempTracks;
    };

    // TODO: improve the trash heap sort logic below (case(?))
    const sorter = (sortType: string) => {
      if (tracks) {
        if (sortType === 'tempo') {
          const tempTracks = [...tracks].sort(
            (a, b) => parseInt(a.tempo) - parseInt(b.tempo)
          );

          setSortedTracks(tempTracks);
        } else if (sortType === 'duration') {
          let tempTracks = [...tracks].sort(
            (a, b) => parseInt(b.duration) - parseInt(a.duration)
          );

          setSortedTracks(tempTracks);
        } else if (sortType === 'popularity') {
          let tempTracks = [...tracks].sort(
            (a, b) =>
              parseInt(b.track_popularity) - parseInt(a.track_popularity)
          );

          setSortedTracks(tempTracks);
        } else if (sortType === 'valence') {
          let tempTracks = [...tracks].sort(
            (a, b) => parseFloat(b.valence) - parseFloat(a.valence)
          );

          setSortedTracks(tempTracks);
        } else if (sortType === 'durationThenKey') {
          let tempTracks = [...tracks].sort(
            (a, b) => parseInt(b.duration) - parseInt(a.duration)
          );

          setSortedTracks(
            keyOption === 'camelot'
              ? camelotSort(tempTracks)
              : keySort(tempTracks)
          );
        } else if (sortType === 'tempoThenKey') {
          let tempTracks = [...tracks].sort(
            (a, b) => parseInt(a.tempo) - parseInt(b.tempo)
          );

          setSortedTracks(
            keyOption === 'camelot'
              ? camelotSort(tempTracks)
              : keySort(tempTracks)
          );
        } else if (sortType === 'energyThenKey') {
          let tempTracks = [...tracks].sort(
            (a, b) => parseFloat(b.energy) - parseFloat(a.energy)
          );

          setSortedTracks(
            keyOption === 'camelot'
              ? camelotSort(tempTracks)
              : keySort(tempTracks)
          );
        } else if (sortType === 'valenceThenKey') {
          let tempTracks = [...tracks].sort(
            (a, b) => parseFloat(b.valence) - parseFloat(a.valence)
          );

          setSortedTracks(
            keyOption === 'camelot'
              ? camelotSort(tempTracks)
              : keySort(tempTracks)
          );
        } else {
          setSortedTracks([...tracks]);
        }
      }
    };

    sorter(sortOption);
  }, [sortOption, tracks, keyOption, setSortedTracks]);

  const copyNameAndSaveAsCurrentTrack = (
    trackName: string,
    trackArtist: string,
    clickedTrackId: string
  ) => {
    navigator.clipboard.writeText(`${trackName} ${trackArtist}`);

    if (lastClickedTrack) {
      const currentlySelected = document.getElementById(lastClickedTrack);
      if (currentlySelected)
        currentlySelected.classList.remove('currently-selected');
    }

    const nowSelected = document.getElementById(clickedTrackId);
    if (nowSelected) nowSelected.classList.add('currently-selected');
    setLastClickedTrack(clickedTrackId);
  };

  const goToRecommended = (track: { [key: string]: any }) => {
    resetStates(false);
    const recommendedTrack = {
      id: track.id,
      key: track.key,
      parsedKeys: [
        `${
          track.mode === 1
            ? camelotMajorKeyDict[track.key] + 'B'
            : camelotMinorKeyDict[track.key] + 'A'
        }`,
        `${keyDict[track.key]}${track.mode === 1 ? '' : 'm'}`,
        // find the inverse major/minor key
        track.mode === 1
          ? [(track.key + 9) % 12, 0]
          : [(track.key + 3) % 12, 1],
      ],
      mode: track.mode,
      name: track.name,
      artists: track.artists,
      energy: track.energy,
      tempo: track.tempo,
      acousticness: track.acousticness,
      liveness: track.liveness,
      loudness: track.loudness,
      speechiness: track.speechiness,
      valence: track.valence,

      duration: track.duration,
      track_popularity: track.track_popularity,
      artist_genres: track.artist_genres,
      album: track.album,
      release_date: track.release_date,
    };

    // TODO: check this is stil working properly
    history.push(
      `/recommended/?id=${track.id}`,
      // {
      //   pathname: '/recommended',
      //   search: `?id=${track.id}`,
      // },
      {
        recommendedTrack: recommendedTrack,
      }
    );
  };

  if (sortedTracks) {
    return (
      <table className="tracks-table">
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
          {sortedTracks &&
            sortedTracks.map((track: { [key: string]: any }, index: number) => (
              <tr key={`track${index}`} className={`track-name-tr`}>
                <td
                  className="table-data__name table-data__name-hover"
                  id={`track-${track.id}`}
                  onClick={() =>
                    copyNameAndSaveAsCurrentTrack(
                      track.name,
                      track.artists[0],
                      `track-${track.id}`
                    )
                  }
                >
                  <span>
                    {track.name} –{' '}
                    <span className="table_data__artist-name">
                      {track.artists.length > 1
                        ? track.artists[0] + ', ' + track.artists[1]
                        : track.artists[0]}
                    </span>
                  </span>

                  <HtmlTooltip
                    className="table-data__name__tooltip"
                    placement="left"
                    tabIndex={0}
                    title={
                      <ul className="tooltip-ul">
                        <li className="table-date__tooltip-genres">
                          <span>Genres:</span>
                          <span>{track.artist_genres.join(', ')}.</span>
                        </li>

                        <li>
                          <span>Duration:</span> <span>{track.duration}</span>
                        </li>
                        <li>
                          <span>Danceability:</span>{' '}
                          <span>{track.danceability}</span>
                        </li>
                        <li>
                          <span>Valence:</span> <span>{track.valence}</span>
                        </li>
                        <li>
                          <span>Acousticness:</span>{' '}
                          <span>{track.acousticness}</span>
                        </li>
                        <li>
                          <span>Liveness:</span> <span>{track.liveness}</span>
                        </li>
                        <li>
                          <span>Loudness:</span> <span>{track.loudness}</span>
                        </li>
                        <li>
                          <span>Popularity:</span>{' '}
                          <span>{track.track_popularity}</span>
                        </li>
                        <li>
                          <span>Speechiness:</span>{' '}
                          <span>{track.speechiness}</span>
                        </li>

                        <br />
                        <li>
                          <span>Key:</span>{' '}
                          <span>
                            {keyDict[track.key]}
                            {track.mode === 1 ? '' : 'm'}
                          </span>
                        </li>
                        <li>
                          <span>Album:</span> <span>{track.album}</span>
                        </li>
                        <li>
                          <span>Released:</span>{' '}
                          <span>{track.release_date}</span>
                        </li>
                      </ul>
                    }
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </HtmlTooltip>
                </td>
                <td
                  className="table-data__attributes key-data"
                  onClick={() => goToRecommended(track)}
                >
                  {keyOption === 'camelot'
                    ? `${
                        track.mode === 1
                          ? camelotMajorKeyDict[track.key] + 'B'
                          : camelotMinorKeyDict[track.key] + 'A'
                      }`
                    : `${keyDict[track.key]}${track.mode === 1 ? '' : 'm'}`}
                </td>
                <td className="table-data__attributes table-data__attributes-energy">
                  {track.energy && track.energy}
                </td>
                <td className="table-data__attributes">
                  {track.tempo && track.tempo}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  } else {
    return <Loading />;
  }
};

export default Tracks;
