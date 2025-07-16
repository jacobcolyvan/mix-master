import { History } from 'history';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import {
  selectSearchResultValues,
  updateBrowserHistoryThunk,
} from '../slices/controlsSlice';
import { getAlbumTracks } from '../slices/itemsSlice';
import { Album } from '../types';

const Albums = () => {
  const dispatch = useDispatch();
  const history: History = useHistory();
  const { albumResults } = useSelector(selectSearchResultValues);

  const handleOnAlbumClick = async (album: any) => {
    await dispatch(getAlbumTracks(album));
    dispatch(updateBrowserHistoryThunk('album-tracks', history));
  };

  const getAlbumDetailsDisplay = (album: Album) => {
    const artistName =
      album.artists.length > 1
        ? `${album.artists[0].name}, ${album.artists[1].name}`
        : album.artists[0].name;

    const releaseYear = album.release_date.slice(0, 4);

    return `${artistName} (${releaseYear})`;
  };

  const renderAlbum = (album, index) => (
    <li
      className="album-list__li album item"
      key={`track${index}`}
      onClick={() => handleOnAlbumClick(album)}
    >
      <div className="single-playlist-div">
        <p className="playlist-name">
          {album.name} –<i>{getAlbumDetailsDisplay(album)}</i>
        </p>
        {album.images[0] && (
          <img src={album.images[0].url} alt={`playlist img`} width="60" height="60" />
        )}
      </div>
    </li>
  );

  return (
    <div>
      <h3 className="album-page-title">Album Results</h3>
      {Array.isArray(albumResults) && albumResults.length > 0 ? (
        <ul>{albumResults.map((album, index) => renderAlbum(album, index))}</ul>
      ) : (
        <p>No albums found.</p>
      )}
    </div>
  );
};

export default Albums;
