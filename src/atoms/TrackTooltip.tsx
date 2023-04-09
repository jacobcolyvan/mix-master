import { withStyles, Tooltip } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { Track } from '../types';

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
  const {
    artist_genres,
    duration,
    danceability,
    valence,
    acousticness,
    liveness,
    loudness,
    track_popularity,
    speechiness,
    parsedKeys,
    album,
    release_date,
  } = track;

  return (
    <HtmlTooltip
      className="table-data__name__tooltip"
      placement="left"
      title={
        <ul className="recommended-tooltip__ul">
          <li className="table-date__tooltip-genres">
            <span>Genres: </span>
            <span>{artist_genres?.join(', ')}.</span>
          </li>
          <li>
            <span>Duration:</span>
            <span>{duration}</span>
          </li>
          <li>
            <span>Danceability:</span>
            <span>{danceability}</span>
          </li>
          <li>
            <span>Valence:</span>
            <span>{valence}</span>
          </li>
          <li>
            <span>Acousticness:</span>
            <span>{acousticness}</span>
          </li>
          <li>
            <span>Liveness:</span>
            <span>{liveness}</span>
          </li>
          <li>
            <span>Loudness:</span>
            <span>{loudness}</span>
          </li>
          <li>
            <span>Popularity:</span>
            <span>{track_popularity}</span>
          </li>
          <li>
            <span>Speechiness:</span>
            <span>{speechiness}</span>
          </li>

          <br />
          <li>
            <span>Key:</span>
            <span>{parsedKeys[1]}</span>
          </li>
          <li>
            <span>Album:</span>
            <span>{album}</span>
          </li>
          <li>
            <span>Released:</span>
            <span>{release_date}</span>
          </li>
        </ul>
      }
    >
      <InfoOutlinedIcon fontSize="small" />
    </HtmlTooltip>
  );
};

export default TrackTooltip;
