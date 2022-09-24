import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import {
  resetItemStates,
  selectSortedTracks,
  selectTracks,
  setLastClickedTrack,
  sortTracksByAudioFeatures,
} from '../features/itemsSlice';

import Loading from './Loading';
import TrackTooltip from './TrackTooltip';

import {
  keyDict,
  camelotMajorKeyDict,
  camelotMinorKeyDict,
} from '../utils/CommonVariables';
import { selectSortTracksBy } from '../features/controlsSlice';
import { selectKeyDisplayOption } from '../features/settingsSlice';
import { RecommendedTrack, Track } from '../types';

const Tracks = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const tracks = useSelector(selectTracks);
  const sortedTracks = useSelector(selectSortedTracks);
  const sortOption = useSelector(selectSortTracksBy);
  const keyOption = useSelector(selectKeyDisplayOption);

  const { lastClickedTrack } = useSelector((state: RootState) => state.itemsSlice);

  // Sort tracks on tracks, sorOption, and keyOption change
  useEffect(() => {
    dispatch(sortTracksByAudioFeatures());
  }, [tracks, sortOption, keyOption]);

  const copyNameAndSaveAsCurrentTrack = (
    trackName: string,
    trackArtist: string,
    clickedTrackId: string
  ) => {
    navigator.clipboard.writeText(`${trackName} ${trackArtist}`);

    if (lastClickedTrack) {
      const currentlySelected = document.getElementById(lastClickedTrack);
      if (currentlySelected) currentlySelected.classList.remove('currently-selected');
    }

    const nowSelected = document.getElementById(clickedTrackId);
    if (nowSelected) nowSelected.classList.add('currently-selected');
    dispatch(setLastClickedTrack(clickedTrackId));
  };

  // TODO: move this logic to state
  const goToRecommended = async (track: { [key: string]: any }) => {
    await dispatch(resetItemStates);

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
        track.mode === 1 ? [(track.key + 9) % 12, 0] : [(track.key + 3) % 12, 1],
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

    // TODO: check this is still working properly
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

                  <TrackTooltip track={track} />
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
                <td className="table-data__attributes">{track.tempo && track.tempo}</td>
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
