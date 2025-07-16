import { History } from "history";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import KeySelect from "../atoms/KeySelect";
import SortBy from "../atoms/SortBy";
import CurrentTrackRec from "../components/CurrentTrackRec";
import RecTweaks from "../components/RecTweaks";
import Tracks from "../components/Tracks";
import { getRecommendedTracks } from "../slices/itemsSlice";
import { Track } from "../types";

const RecommendedTracks: React.FC = () => {
  const dispatch = useAppDispatch();
  const history: History = useHistory();
  const { matchRecsToSeedTrackKey, seedAttributes } = useAppSelector(
    (state) => state.controlsSlice
  );

  // Type the location state properly
  const locationState = history.location.state as { recommendedTrack?: Track } | undefined;
  const recommendedTrack = locationState?.recommendedTrack;

  useEffect(() => {
    if (recommendedTrack) {
      dispatch(getRecommendedTracks(recommendedTrack));
    }
  }, [dispatch, recommendedTrack, matchRecsToSeedTrackKey, seedAttributes]);

  return (
    <div>
      <h2 className="recommended-page-title">Recommended Tracks</h2>
      <KeySelect />
      <SortBy />

      {recommendedTrack && (
        <>
          <RecTweaks recommendedTrack={recommendedTrack} />
          <br />
          <CurrentTrackRec track={recommendedTrack} />
        </>
      )}
      <Tracks />
    </div>
  );
};

export default RecommendedTracks;
