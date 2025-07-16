import { History } from 'history';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../app/store';
import KeySelect from '../atoms/KeySelect';
import SortBy from '../atoms/SortBy';
import CurrentTrackRec from '../components/CurrentTrackRec';
import RecTweaks from '../components/RecTweaks';
import Tracks from '../components/Tracks';
import { getRecommendedTracks } from '../slices/itemsSlice';

const RecommendedTracks = () => {
  const dispatch = useDispatch();
  const history: History = useHistory();

  // TODO: rethink this
  const recommendedTrack = history.location.state.recommendedTrack;
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

      <CurrentTrackRec track={recommendedTrack} />
      <Tracks />
    </div>
  );
};

export default RecommendedTracks;
