import React, { useContext }  from 'react';
import styled from 'styled-components';
import axios from 'axios';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';

const AlbumList = styled.li`
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  padding: 10px 4px;

  &:hover {
    color: #2882e9;
    cursor: pointer;
  }

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .playlist-name {
    padding-left: 4px;
  }
`

const AlbumsTitle = styled.h3`
  text-decoration: underline;
  font-style: italic;
`

const Albums = ({ albums, handleResultsChange, updateUrl, setAlbumName }) => {
  const {token, setTracks, setSortedTracks, setAuthError } = useContext(UserContext);

  const getAlbumTracks = async (album) => {
    try {
      const tracksResponse = await axios({
        method: 'get',
        url: album.href,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      const tracklist = [tracksResponse.data.tracks.items][0];
      const trackIds = tracklist.map((track) => track.id);
      const artistIds = tracklist.map((track) => track.artists[0].id)

      let trackFeatures = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      let artistFeatures = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      trackFeatures = [...trackFeatures.data.audio_features];
      artistFeatures = [...artistFeatures.data.artists];

      const splicedTracks = tracklist.filter((item, index) => trackFeatures[index] != null)
        .map((item, index) => {
          return {
            "name": item.name,
            "artists": item.artists.length > 1 ? [item.artists[0].name, item.artists[1].name] : [item.artists[0].name],
            "id": item.id && item.id,
            "tempo": trackFeatures[index] != null ? Math.round(trackFeatures[index].tempo) : "",
            "key": trackFeatures[index] != null ? trackFeatures[index].key : "",
            "mode": trackFeatures[index] != null ? parseInt(trackFeatures[index].mode) : "",
            "energy": trackFeatures[index] != null ? Math.round((100-trackFeatures[index].energy.toFixed(2)*100))/100 : "",
            "danceability": trackFeatures[index] != null ? trackFeatures[index].danceability : "",
            "acousticness": trackFeatures[index] != null ? trackFeatures[index].acousticness : "",
            "liveness": trackFeatures[index] != null ? trackFeatures[index].liveness : "",
            "loudness": trackFeatures[index] != null ? trackFeatures[index].loudness : "",
            "speechiness": trackFeatures[index] != null ? trackFeatures[index].speechiness : "",
            "valence": trackFeatures[index] != null ? trackFeatures[index].valence : "",

            "duration": item.duration_ms != null ? millisToMinutesAndSeconds(item.duration_ms) : "",
            "track_popularity": item.popularity != null ? item.popularity : "",
            "artist_genres": artistFeatures[index] != null ? artistFeatures[index].genres: "",
            "album": item.album.name && item.track.album.name,
            "release_date": item.track.album.release_date ? item.track.album.release_date : "",
          }
        })

      setAlbumName(`${album.name} – ${album.artists.length > 1 ? [album.artists[0].name, album.artists[1].name].join(', ') : album.artists[0].name}`);
      setSortedTracks([...splicedTracks]);
      setTracks([...splicedTracks]);
      const results = handleResultsChange('tracks', [...splicedTracks])
      updateUrl('album-tracks', results)

    } catch (err) {
      if (err.response.status === 401) setAuthError(true);
      console.log(err.message);
    }
  }


  return (
    <div>
      <AlbumsTitle>Album Results</AlbumsTitle>
      {albums.length > 0 && (
        <ul>
          {albums.map((album, index) => (
            <AlbumList
              className='album item'
              key={`track${index}`}
              onClick={() => getAlbumTracks(album)}
            >
              <div className='single-playlist-div'>
                <p className='playlist-name'>
                  {album.name} –
                  <i>
                    {album.artists.length > 1 ? album.artists[0].name + ', ' + album.artists[1].name :
                    album.artists[0].name}{" (" + album.release_date.slice(0, 4) + ")"}
                  </i>
                </p>
                {album.images[0] && <img src={album.images[0].url} alt={`playlist img`} width="60" height="60" className='playlist-image'/>}
              </div>
            </AlbumList>
          ))}
        </ul>
      )}
    </div>
  )
};

export default Albums;
