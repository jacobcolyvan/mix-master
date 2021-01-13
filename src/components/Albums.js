import React, { useContext }  from 'react';
import styled from 'styled-components';
import axios from 'axios';
import UserContext from '../context/UserContext';

const AlbumLi = styled.li`
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

const Albums = ({ albums, setAlbumName }) => {
  const {token, setTracks, setSortedTracks} = useContext(UserContext);


  const getAlbumTracks = async (album) => {
    console.log('album :>> ', album);
    try {
      const tracksResponse = await axios({
        method: 'get',
        url: album.href,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      console.log(tracksResponse.data.tracks.items);

      const trackIds = tracksResponse.data.tracks.items.map((item) => item.id);
      const featuresResponse = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      const tracklist = [tracksResponse.data.tracks.items];
      const trackFeatures = [featuresResponse.data.audio_features];

      const splicedTracks = tracklist[0].map((item, index) => {
        return {
          "name": item.name,
          "artists": item.artists.length > 1 ? [item.artists[0].name, item.artists[1].name] : [item.artists[0].name],
          "id": item.id,
          "tempo": Math.round(trackFeatures[0][index].tempo),
          "key": trackFeatures[0][index].key,
          "mode": parseInt(trackFeatures[0][index].mode)
        }
      })

      setAlbumName(`${album.name} – ${album.artists.length > 1 ? [album.artists[0].name, album.artists[1].name].join(', ') : album.artists[0].name}`);
      setSortedTracks([...splicedTracks]);
      setTracks([...splicedTracks]);

    } catch (err) {
      console.log(err.message);
    }
  }


  return (
    <div>
      <AlbumsTitle>Album Results:</AlbumsTitle>
      {albums.length > 0 && (
        <ul>
          {albums.map((album, index) => (
            <AlbumLi
              className='album item'
              key={`track${index}`}
              onClick={() => getAlbumTracks(album)}
            >
              <div className='single-playlist-div'>
                <p className='playlist-name'>{album.name} – <i>{album.artists.length > 1 ? album.artists[0].name + ', ' + album.artists[1].name : album.artists[0].name}</i> </p>
                {album.images[0] && <img src={album.images[0].url} alt={`playlist img`} width="60" height="60" className='playlist-image'/>}
              </div>
            </AlbumLi>
          ))}
        </ul>
      )}
    </div>
  )
};

export default Albums;
