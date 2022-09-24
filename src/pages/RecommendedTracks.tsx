import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';

import Tracks from '../components/Tracks';
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';
import RecTweaks from '../components/RecTweaks';

import { selectKeyDisplayOption } from '../features/settingsSlice';
import { getRecommendedTracks } from '../features/itemsSlice';
import TrackTooltip from '../components/TrackTooltip';

const RecommendedTracks = () => {
  const dispatch = useDispatch();
  const history: any = useHistory();

  const recommendedTrack = history.location.state.recommendedTrack;
  const keyOption = useSelector(selectKeyDisplayOption);
  const { matchRecsToSeedTrackKey, seedAttributes } = useSelector(
    (state: RootState) => state.controlsSlice
  );

  useEffect(() => {
    dispatch(getRecommendedTracks(recommendedTrack));
  }, [recommendedTrack, matchRecsToSeedTrackKey, seedAttributes]);

  return (
    <div>
      <h2 className="recommended-page-title">Recommended Tracks</h2>
      <KeySelect />
      <SortBy />

      <RecTweaks recommendedTrack={recommendedTrack} />

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
                      ? recommendedTrack.artists[0] + ', ' + recommendedTrack.artists[1]
                      : recommendedTrack.artists[0]}
                  </span>
                </span>

                <TrackTooltip track={recommendedTrack} />
              </td>
              <td className="table-data__attributes key-data">
                {keyOption === 'camelot'
                  ? recommendedTrack.parsedKeys[0]
                  : recommendedTrack.parsedKeys[1]}
              </td>
              <td className="table-data__attributes table-data__attributes-energy">
                {recommendedTrack.energy}
              </td>
              <td className="table-data__attributes">{recommendedTrack.tempo}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Tracks />
    </div>
  );
};

export default RecommendedTracks;
