import { withStyles, Tooltip } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { Track } from '../types';
import { keyDict } from '../utils/commonVariables';

const HtmlTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: '#484848',
    maxWidth: 600,
    width: 'auto',
    border: '1px solid #dadde9',
  },
}))(Tooltip);

interface TooltipProps {
  track: Track;
}

const TrackTooltip = ({ track }: TooltipProps) => {
  return (
    <HtmlTooltip
      className="table-data__name__tooltip"
      placement="left"
      title={
        <ul className="recommended-tooltip__ul">
          <li className="table-date__tooltip-genres">
            <span>Genres: </span>
            <span>{track.artist_genres && track.artist_genres.join(', ')}.</span>
          </li>

          <li>
            <span>Duration:</span>
            <span>{track.duration}</span>
          </li>
          <li>
            <span>Danceability:</span>
            <span>{track.danceability}</span>
          </li>
          <li>
            <span>Valence:</span>
            <span>{track.valence}</span>
          </li>
          <li>
            <span>Acousticness:</span>
            <span>{track.acousticness}</span>
          </li>
          <li>
            <span>Liveness:</span>
            <span>{track.liveness}</span>
          </li>
          <li>
            <span>Loudness:</span>
            <span>{track.loudness}</span>
          </li>
          <li>
            <span>Popularity:</span>
            <span>{track.track_popularity}</span>
          </li>
          <li>
            <span>Speechiness:</span>
            <span>{track.speechiness}</span>
          </li>

          <br />
          <li>
            <span>Key:</span>
            <span>
              {keyDict[track.key]}
              {String(track.mode) === '1' ? '' : 'm'}
            </span>
          </li>
          <li>
            <span>Album:</span>
            <span>{track.album}</span>
          </li>
          <li>
            <span>Released:</span>
            <span>{track.release_date}</span>
          </li>
        </ul>
      }
    >
      <InfoOutlinedIcon fontSize="small" />
    </HtmlTooltip>
  );
};

export default TrackTooltip;
