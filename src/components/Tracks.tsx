import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import Loading from "../atoms/Loading";
import TrackTooltip from "../atoms/TrackTooltip";
import { selectSortTracksBy } from "../slices/controlsSlice";
import {
  copyNameAndSaveAsCurrentTrack,
  goToRecommendedTrack,
  selectSortedTracks,
  selectTracks,
  sortTracksByAudioFeatures,
} from "../slices/itemsSlice";
import { selectKeyDisplayOption } from "../slices/settingsSlice";
import { Track } from "../types";
import { getArtistNames } from "../utils/commonFunctions";
import { camelotMajorKeyDict, camelotMinorKeyDict, keyDict } from "../utils/commonVariables";

const Tracks: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const tracks = useAppSelector(selectTracks);
  const sortedTracks = useAppSelector(selectSortedTracks);
  const sortOption = useAppSelector(selectSortTracksBy);
  const keyOption = useAppSelector(selectKeyDisplayOption);

  // Sort tracks on tracks, sortOption, and keyOption change
  useEffect(() => {
    dispatch(sortTracksByAudioFeatures());
  }, [tracks, sortOption, keyOption]);

  const handleTrackRecommendedClick = (track: Track) => {
    dispatch(goToRecommendedTrack(history, track));
  };

  const handleTrackClick = (track: Track) => {
    dispatch(copyNameAndSaveAsCurrentTrack(track.name, track.artists[0], `track-${track.id}`));
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
                className="table-data__name table-data__name-hover"
                id={`track-${track.id}`}
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

  return sortedTracks ? (
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
  ) : (
    <Loading />
  );
};

export default Tracks;
