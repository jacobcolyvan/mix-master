import { Alert } from "@mui/material";

import KeySelect from "../atoms/KeySelect";
import Loading from "../atoms/Loading";
import Offline from "../atoms/Offline";
import SortBy from "../atoms/SortBy";
import CurrentTrackRec from "../components/CurrentTrackRec";
import RecTweaks from "../components/RecTweaks";
import Tracks from "../components/Tracks";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRecommendationTuning } from "../hooks/useRecommendationTuning";
import { useViewOptions } from "../hooks/useViewOptions";
import { useRecommendedTracks, useSeedTrack } from "../queries/trackQueries";
import { serialiseRecommendationSearch } from "../utils/recommendationTuning";

// Pending edits use Apply; unchanged tuning refreshes or retries the applied request.
const getRecommendationActionLabel = (hasPendingEdits: boolean, hasRequestError: boolean) => {
  if (hasPendingEdits) return "Apply changes";
  if (hasRequestError) return "Retry recommendations";
  return "Refresh recommendations";
};

const RecommendedTracks: React.FC = () => {
  usePageTitle("Recommendations");
  const { sort, setSort, keyNotation, setKeyNotation } = useViewOptions();
  const tuning = useRecommendationTuning();
  const { id } = tuning;

  const seedQuery = useSeedTrack(id);
  const seedTrack = seedQuery.data;
  const recommendationsQuery = useRecommendedTracks(
    seedTrack,
    tuning.applied.attributes,
    tuning.applied.matchKey
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

  const hasPendingEdits = !tuning.valid || tuning.changed;
  const actionLabel = getRecommendationActionLabel(hasPendingEdits, recommendationsQuery.isError);

  const applyTuningOrRefetchRecommendations = () => {
    if (hasPendingEdits) tuning.apply();
    else recommendationsQuery.refetch();
  };

  // Carry applied tuning to the next seed, never unfinished edits.
  const recommendationLink = (seedId: string) =>
    `/recommended/${serialiseRecommendationSearch(seedId, tuning.applied, { sort, keyNotation })}`;

  return (
    <div>
      <h2 className="recommended-page-title">Recommended Tracks</h2>
      <KeySelect value={keyNotation} onChange={setKeyNotation} />
      <SortBy value={sort} onChange={setSort} />

      <RecTweaks
        value={tuning.draft}
        errors={tuning.errors}
        onAttributeChange={tuning.editAttribute}
        onMatchKeyChange={tuning.setMatchKey}
        onReset={tuning.reset}
        onAction={applyTuningOrRefetchRecommendations}
        actionLabel={actionLabel}
        actionDisabled={!tuning.valid || recommendationsQuery.isFetching}
      />
      {recommendationsQuery.isError && recommendationsQuery.data && (
        <Alert severity="error">
          Unable to refresh recommendations from Spotify. Please try again.
        </Alert>
      )}
      <br />
      <CurrentTrackRec track={seedTrack} keyNotation={keyNotation} />
      <Tracks
        sortOption={sort}
        keyNotation={keyNotation}
        recommendationLink={recommendationLink}
        tracks={recommendationsQuery.data ?? null}
        isPending={recommendationsQuery.isPending}
        isPaused={recommendationsQuery.isPaused}
        error={recommendationsQuery.error}
      />
    </div>
  );
};

export default RecommendedTracks;
