import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { History } from 'history';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../app/store';
import Tracks from '../components/Tracks';
import SortBy from '../atoms/SortBy';
import KeySelect from '../atoms/KeySelect';
import RecTweaks from '../components/RecTweaks';

import { getRecommendedTracks } from '../slices/itemsSlice';
import CurrentTrackRec from '../components/CurrentTrackRec';

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
