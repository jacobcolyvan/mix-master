import { useDispatch, useSelector } from 'react-redux';
import { selectSearchResultValues } from '../features/controlsSlice';
import { getAlbumTracks } from '../features/itemsSlice';
import { Album } from '../types';

interface AlbumsProps {
  updateUrl: (slug: string, results: any) => void;
}

const Albums = ({ updateUrl }: AlbumsProps) => {
  const dispatch = useDispatch();
  const { albumResults } = useSelector(selectSearchResultValues);

  const handleOnAlbumClick = async (album: any) => {
    const results = await dispatch(getAlbumTracks(album));
    updateUrl('album-tracks', results);
  };

  const getAlbumDetailsDisplay = (album: Album) => {
    const artistName =
      album.artists.length > 1
        ? `${album.artists[0].name}, ${album.artists[1].name}`
        : album.artists[0].name;

    const releaseYear = album.release_date.slice(0, 4);

    return `${artistName} (${releaseYear})`;
  };

  return (
    <div>
      <h3 className="album-page-title">Album Results</h3>
      {Array.isArray(albumResults) && albumResults.length > 0 && (
        <ul>
          {albumResults.map((album, index) => (
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
                  <img
                    src={album.images[0].url}
                    alt={`playlist img`}
                    width="60"
                    height="60"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Albums;
