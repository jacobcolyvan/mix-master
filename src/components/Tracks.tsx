import { Alert } from "@mui/material";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import Loading from "../atoms/Loading";
import Offline from "../atoms/Offline";
import TrackTooltip from "../atoms/TrackTooltip";
import { cacheSeedTrack } from "../queries/trackQueries";
import { KeyOptionTypes, Track, TrackSortByChoices } from "../types";
import { sortTracks } from "../utils/collectionTransforms";
import { getArtistNames } from "../utils/commonFunctions";
import { camelotMajorKeyDict, camelotMinorKeyDict, keyDict } from "../utils/commonVariables";

export type TracksProps = {
  tracks: Track[] | null;
  isPending: boolean;
  isPaused?: boolean;
  error: Error | null;
  sortOption?: TrackSortByChoices;
  keyNotation: KeyOptionTypes;
  recommendationLink?: (id: string) => string;
};

const Tracks: React.FC<TracksProps> = ({
  tracks,
  isPending,
  isPaused,
  error,
  sortOption = "default",
  recommendationLink,
  keyNotation: keyOption,
}) => {
  const history = useHistory();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Derive the display order from the canonical tracks array. Sorting from the
  // canonical array (rather than from a previously sorted copy) is what makes
  // "Original Order" actually restore the original order.
  const sortedTracks = useMemo(
    () => (tracks ? sortTracks(tracks, sortOption, keyOption) : null),
    [tracks, sortOption, keyOption]
  );

  const handleTrackRecommendedClick = (track: Track) => {
    cacheSeedTrack(track);
    const recommendationUrl = recommendationLink
      ? recommendationLink(track.id)
      : `/recommended/?id=${encodeURIComponent(track.id)}`;
    history.push(recommendationUrl);
  };

  const handleTrackClick = (track: Track) => {
    navigator.clipboard.writeText(`${track.name} ${track.artists[0]}`);
    setSelectedTrack(track);
  };

  const getKeyLabel = (keyOption: string, track: Track) => {
    const trackMode = track.mode;
    const trackKey = track.key;

    if (keyOption === "camelot") {
      return trackMode === "1"
        ? camelotMajorKeyDict[trackKey] + "B"
        : camelotMinorKeyDict[trackKey] + "A";
    } else {
      return keyDict[trackKey] + (trackMode === "1" ? "" : "m");
    }
  };

  const renderSortedTracksBody = () => {
    return (
      <tbody>
        {sortedTracks &&
          sortedTracks.map((track: Track, index: number) => (
            <tr key={`track${index}`} className={`track-name-tr`}>
              <td
                className={`table-data__name table-data__name-hover${
                  selectedTrack === track ? " currently-selected" : ""
                }`}
                onClick={() => handleTrackClick(track)}
              >
                <span>
                  {track.name} –{" "}
                  <span className="table_data__artist-name">
                    {/* TODO: is this redundant? */}
                    {getArtistNames(track.artists)}
                  </span>
                </span>

                <TrackTooltip track={track} />
              </td>

              <td
                className="table-data__attributes key-data"
                onClick={() => handleTrackRecommendedClick(track)}
              >
                {track.key && getKeyLabel(keyOption, track)}
              </td>
              <td className="table-data__attributes table-data__attributes-energy">
                {track.energy && track.energy}
              </td>
              <td className="table-data__attributes">{track.tempo && track.tempo}</td>
            </tr>
          ))}
      </tbody>
    );
  };

  if (!tracks && isPaused) return <Offline />;

  if (error && !tracks) {
    return <Alert severity="error">Unable to load tracks from Spotify. Please try again.</Alert>;
  }

  if (isPending || !sortedTracks) {
    return <Loading />;
  }

  return (
    <table className="tracks-table">
      <thead>
        <tr>
          <th className="table-data__name">Track</th>
          <th className="table-data__attributes">Key</th>
          <th className="table-data__attributes table-data__attributes-energy">Energy</th>
          <th className="table-data__attributes">BPM</th>
        </tr>
      </thead>

      {renderSortedTracksBody()}
    </table>
  );
};

export default Tracks;
