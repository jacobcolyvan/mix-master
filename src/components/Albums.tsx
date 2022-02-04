import React, { useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';

interface AlbumsProps {
  albums: Array<{ [key: string]: any }> | boolean;
  handleResultsChange: (key: string, value: any) => any;
  updateUrl: (slug: string, results: any) => void;
  setAlbumName: React.Dispatch<React.SetStateAction<string | boolean>>;
}

const Albums = ({
  albums,
  handleResultsChange,
  updateUrl,
  setAlbumName,
}: AlbumsProps) => {
  const { token, setTracks, setSortedTracks, handleAuthError } =
    useContext(UserContext);

  const getAlbumTracks = async (album: { [key: string]: any }) => {
    try {
      const tracksResponse = await axios({
        method: 'get',
        url: album.href,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      const tracklist = [tracksResponse.data.tracks.items][0];
      const trackIds = tracklist.map(
        (track: { [key: string]: any }) => track.id
      );
      const artistIds = tracklist.map(
        (track: { [key: string]: any }) => track.artists[0].id
      );

      const trackFeaturesResponse = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(
          ','
        )}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      const artistFeaturesResponse = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      let trackFeatures = [...trackFeaturesResponse.data.audio_features];
      let artistFeatures = [...artistFeaturesResponse.data.artists];

      const splicedTracks = tracklist
        .filter((_: any, index: number) => trackFeatures[index] != null)
        .map((item: { [key: string]: any }, index: number) => {
          return {
            name: item.name,
            artists:
              item.artists.length > 1
                ? [item.artists[0].name, item.artists[1].name]
                : [item.artists[0].name],
            id: item.id && item.id,
            tempo:
              trackFeatures[index] != null
                ? Math.round(trackFeatures[index].tempo)
                : '',
            key: trackFeatures[index] != null ? trackFeatures[index].key : '',
            mode:
              trackFeatures[index] != null
                ? parseInt(trackFeatures[index].mode)
                : '',
            energy:
              trackFeatures[index] != null
                ? Math.round(trackFeatures[index].energy.toFixed(2) * 100) / 100
                : '',
            danceability:
              trackFeatures[index] != null
                ? trackFeatures[index].danceability
                : '',
            acousticness:
              trackFeatures[index] != null
                ? trackFeatures[index].acousticness
                : '',
            liveness:
              trackFeatures[index] != null ? trackFeatures[index].liveness : '',
            loudness:
              trackFeatures[index] != null ? trackFeatures[index].loudness : '',
            speechiness:
              trackFeatures[index] != null
                ? trackFeatures[index].speechiness
                : '',
            valence:
              trackFeatures[index] != null ? trackFeatures[index].valence : '',

            duration:
              item.duration_ms != null
                ? millisToMinutesAndSeconds(item.duration_ms)
                : '',
            track_popularity: item.popularity != null ? item.popularity : '',
            artist_genres:
              artistFeatures[index] != null ? artistFeatures[index].genres : '',
            album: album.name && album.name,
            release_date: album.release_date ? album.release_date : '',
          };
        });

      setAlbumName(
        `${album.name} – ${
          album.artists.length > 1
            ? [album.artists[0].name, album.artists[1].name].join(', ')
            : album.artists[0].name
        }`
      );
      setSortedTracks([...splicedTracks]);
      setTracks([...splicedTracks]);
      const results = handleResultsChange('tracks', [...splicedTracks]);
      updateUrl('album-tracks', results);
    } catch (err) {
      console.log(err.message);
      if (err.response?.status === 401) handleAuthError();
    }
  };

  return (
    <div>
      <h3 className="album-page-title">Album Results</h3>
      {Array.isArray(albums) && albums.length > 0 && (
        <ul>
          {albums.map((album, index) => (
            <li
              className="album-list__li album item"
              key={`track${index}`}
              onClick={() => getAlbumTracks(album)}
            >
              <div className="single-playlist-div">
                <p className="playlist-name">
                  {album.name} –
                  <i>
                    {album.artists.length > 1
                      ? album.artists[0].name + ', ' + album.artists[1].name
                      : album.artists[0].name}
                    {' (' + album.release_date.slice(0, 4) + ')'}
                  </i>
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
