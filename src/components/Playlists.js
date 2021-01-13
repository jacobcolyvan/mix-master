import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components'
import UserContext from '../context/UserContext';

const PlaylistLi = styled.li`
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

const PlaylistsTitle = styled.div`
  text-decoration: underline;

  #title {
    font-style: italic;
  }
`

const InfoDiv = styled.div`
  margin-bottom: 40px;
  p {
    margin-top: 0;
    margin-bottom: 8px;
  }
`


const Playlists = () => {
  const {token, setPlaylist, playlists, setPlaylists, username, setUsername} = useContext(UserContext);


  useEffect(() => {
    let playlistTotalAmount = 0;
    let allPlaylists = false;
    let tempPlaylistArray = []
    let offset = 0;

    const getAllPlaylists = async () => {
      try {
        while (!allPlaylists) {
          const response = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          });

          playlistTotalAmount = response.data.total;
          playlistTotalAmount > tempPlaylistArray.length ? offset += 50 : allPlaylists = true;

          tempPlaylistArray = [...tempPlaylistArray, ...response.data.items];
        }

        setPlaylists(tempPlaylistArray);
      } catch (err) {
        console.log(err.message);
      }
    };

    getAllPlaylists();
  }, [token, setPlaylists]);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const userResponse = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/me/`,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        setUsername(userResponse.data.display_name);

      } catch (err) {
        console.log(err.message);
      }
    }

    getUserProfile()
  }, [token, setUsername])

  const savePlaylist = (index) => {
    setPlaylist(playlists[index]);
  };


  if (playlists.length > 0) {
    return (
      <div>
        <PlaylistsTitle><h2 id='title'>Playlists</h2></PlaylistsTitle>
        <InfoDiv>
          <p>See <i>About</i> for more info about how to use this site.</p>
          <p>Playlists are automatically seperated into ones you've created, and ones you follow.</p>
        </InfoDiv>

        {playlists.length > 0 && (
          <>
            <PlaylistsTitle><h3>Created</h3></PlaylistsTitle>
            <ul>
              {playlists.map((playlist, index) => (
                (playlist.owner.display_name === username) && (
                  <PlaylistLi
                    className='playlist item'
                    key={`track${index}`}
                    onClick={() => savePlaylist(index)}
                  >
                    <div className='single-playlist-div'>
                      <div className='playlist-name'>{playlist.name}</div>
                      {playlist.images[0] && <img src={playlist.images[0].url} alt={`playlist img`} width="60" height="60" className='playlist-image'/>}
                    </div>
                  </PlaylistLi>
                )
              ))}
            </ul>

            <br/><br/>
            <PlaylistsTitle><h3>Followed</h3></PlaylistsTitle>
            <ul>
              {playlists.map((playlist, index) => (
                (playlist.owner.display_name !== username) && (
                  <PlaylistLi
                    className='playlist item'
                    key={`track${index}`}
                    onClick={() => savePlaylist(index)}
                  >
                    <div className='single-playlist-div'>
                      <div className='playlist-name'>{playlist.name}</div>
                      {playlist.images[0] && <img src={playlist.images[0].url} alt={`playlist img`} width="60" height="60" className='playlist-image'/>}
                    </div>
                  </PlaylistLi>
                )
              ))}
            </ul>
          </>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <p><i>Loading...</i></p>
      </div>
    );
  }
}

export default Playlists
