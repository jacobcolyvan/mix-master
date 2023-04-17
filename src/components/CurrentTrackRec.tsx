import { useSelector } from 'react-redux';
import { selectKeyDisplayOption } from '../slices/settingsSlice';
import { Track } from '../types';
import TrackTooltip from '../atoms/TrackTooltip';
import { getArtistNames } from '../utils/commonFunctions';

type CurrentTrackRecProps = {
  track: Track;
};

const CurrentTrackRec: React.FC<CurrentTrackRecProps> = ({ track }) => {
  const keyOption = useSelector(selectKeyDisplayOption);

  const handleOnTrackClick = () => {
    navigator.clipboard.writeText(`${track.name} ${track.artists[0]}`);
  };

  return (
    <div className="recommended-track__div">
      <p>Tracks were recommended from this track:</p>
      <table>
        <thead>
          <tr>
            <th className="table-data__name">Track</th>
            <th className="table-data__attributes">Key</th>
            <th className="table-data__attributes table-data__attributes-energy">
              Energy
            </th>
            <th className="table-data__attributes">BPM</th>
          </tr>
        </thead>

        <tbody>
          <tr className={`track-name-tr`} id="recommended-track">
            <td
              className="table-data__name table-data__name-hover"
              onClick={handleOnTrackClick}
            >
              <span>
                {track.name} –{' '}
                <span className="table_data__artist-name">
                  {getArtistNames(track.artists)}
                </span>
              </span>
              <TrackTooltip track={track} />
            </td>
            <td className="table-data__attributes key-data">
              {keyOption === 'camelot' ? track.parsedKeys[0] : track.parsedKeys[1]}
            </td>
            <td className="table-data__attributes table-data__attributes-energy">
              {track.energy}
            </td>
            <td className="table-data__attributes">{track.tempo}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CurrentTrackRec;
