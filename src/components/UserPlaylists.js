import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import PlaylistList from './PlaylistList'

// Add searchbar for filtering playlists

const PlaylistsTitle = styled.div`
  text-decoration: underline;

  #title {
    font-style: italic;
  }

  h3 {
    padding-top: 24px;
  }
`

const InfoDiv = styled.div`
  margin-bottom: 24px;
  p {
    margin-top: 0;
    margin-bottom: 8px;
  }
`


const UserPlaylists = () => {
  const {token, playlists, setPlaylists, username, setUsername} = useContext(UserContext);
  const [sortedPlaylists, setSortedPlaylists ] = useState(false);


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
  }, [token, setUsername]);

  useEffect(() => {
    const sortPlaylists = () => {
      let tempSortedPlaylists = {"created": [], "followed": [], "generated": []}

      playlists.forEach((playlist, index) => {
        if (playlist.name.slice(0, 4) === "gena") {
          tempSortedPlaylists.generated.push(playlist);
        } else if (playlist.owner.display_name === username) {
          tempSortedPlaylists.created.push(playlist);
        } else {
          tempSortedPlaylists.followed.push(playlist);
        }
      })

      setSortedPlaylists(tempSortedPlaylists);
    }

    sortPlaylists();
  }, [playlists, username]);



  if (playlists.length > 0) {
    return (
      <div>
        <PlaylistsTitle><h2 id='title'>Playlists</h2></PlaylistsTitle>
        <InfoDiv>
          <p>See <i>About</i> for more info about how to use this site.</p>
          <p>Playlists are automatically seperated into ones you've <a href="#created-playlists">created</a>, and ones you <a href="#followed-playlists">follow</a>.</p>
        </InfoDiv>

        {sortedPlaylists && (
          <div>
            <PlaylistsTitle id="created-playlists"><h3>Created</h3></PlaylistsTitle>
            <PlaylistList playlistsToRender={sortedPlaylists.created} />

            <br/>
            <PlaylistsTitle id="followed-playlists"><h3>Followed</h3></PlaylistsTitle>
            <PlaylistList playlistsToRender={sortedPlaylists.followed} />

            <br/>
            {sortedPlaylists.generated.length > 0 && (
              <>
                <PlaylistsTitle id="generated-playlists"><h3>Gena</h3></PlaylistsTitle>
                <PlaylistList playlistsToRender={sortedPlaylists.generated} />
              </>
            )}
          </div>
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

export default UserPlaylists
