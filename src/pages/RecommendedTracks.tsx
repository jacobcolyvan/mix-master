import { Alert } from "@mui/material";
import { useLocation } from "react-router-dom";

import { useAppSelector } from "../app/store";
import KeySelect from "../atoms/KeySelect";
import Loading from "../atoms/Loading";
import Offline from "../atoms/Offline";
import SortBy from "../atoms/SortBy";
import CurrentTrackRec from "../components/CurrentTrackRec";
import RecTweaks from "../components/RecTweaks";
import Tracks from "../components/Tracks";
import { useRecommendedTracks, useSeedTrack } from "../queries/trackQueries";

const RecommendedTracks: React.FC = () => {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("id");

  const { matchRecsToSeedTrackKey, seedAttributes } = useAppSelector(
    (state) => state.controlsSlice
  );

  const seedQuery = useSeedTrack(id);
  const seedTrack = seedQuery.data;
  const recommendationsQuery = useRecommendedTracks(
    seedTrack,
    seedAttributes,
    matchRecsToSeedTrackKey
  );

  if (!id) {
    return <Alert severity="info">No track selected.</Alert>;
  }

  if (!seedTrack) {
    if (seedQuery.isPaused) {
      return <Offline />;
    }

    if (seedQuery.isPending) {
      return <Loading />;
    }

    if (seedQuery.isError) {
      return <Alert severity="error">Unable to load that track from Spotify.</Alert>;
    }

    return <Alert severity="info">Spotify has no audio analysis for that track.</Alert>;
  }

  return (
    <div>
      <h2 className="recommended-page-title">Recommended Tracks</h2>
      <KeySelect />
      <SortBy />

      <RecTweaks onRefresh={recommendationsQuery.refetch} />
      <br />
      <CurrentTrackRec track={seedTrack} />
      <Tracks
        tracks={recommendationsQuery.data ?? null}
        isPending={recommendationsQuery.isPending}
        isPaused={recommendationsQuery.isPaused}
        error={recommendationsQuery.error}
      />
    </div>
  );
};

export default RecommendedTracks;
