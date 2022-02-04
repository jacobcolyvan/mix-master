import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import PlaylistList from '../components/PlaylistList';
import Loading from '../components/Loading';

const UserPlaylists = () => {
  const {
    token,
    playlists,
    setPlaylists,
    username,
    setUsername,
    handleAuthError,
  } = useContext(UserContext);
  const [sortedPlaylists, setSortedPlaylists] = useState<
    boolean | { [key: string]: any[] }
  >(false);

  useEffect(() => {
    let playlistTotalAmount = 0;
    let allPlaylists = false;
    let tempPlaylistArray: [][] = [];
    let offset = 0;

    const getAllPlaylists = async () => {
      try {
        while (!allPlaylists) {
          const response = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
          });

          playlistTotalAmount = response.data.total;
          playlistTotalAmount > tempPlaylistArray.length
            ? (offset += 50)
            : (allPlaylists = true);

          tempPlaylistArray = [...tempPlaylistArray, ...response.data.items];
        }
        console.log('tempPlaylistArray :>> ', tempPlaylistArray);

        setPlaylists(tempPlaylistArray);
      } catch (err) {
        if (err.response?.status === 401) handleAuthError();
        console.log(err.message);
      }
    };

    getAllPlaylists();
  }, [token, setPlaylists, handleAuthError]);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const userResponse = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/me/`,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
        });

        setUsername(userResponse.data.display_name);
      } catch (err) {
        if (err.response?.status === 401) handleAuthError();
        console.log(err.message);
      }
    };

    getUserProfile();
  }, [token, setUsername, handleAuthError]);

  useEffect(() => {
    const sortPlaylists = () => {
      let tempSortedPlaylists: { [key: string]: any[] } = {
        created: [],
        followed: [],
        generated: [],
      };

      playlists.forEach((playlist: { [key: string]: any }) => {
        if (playlist.name.slice(0, 4) === 'gena') {
          tempSortedPlaylists.generated.push(playlist);
        } else if (playlist.owner.display_name === username) {
          tempSortedPlaylists.created.push(playlist);
        } else {
          tempSortedPlaylists.followed.push(playlist);
        }
      });

      setSortedPlaylists(tempSortedPlaylists);
    };

    sortPlaylists();
  }, [playlists, username]);

  if (playlists.length > 0) {
    return (
      <div>
        <div className="playlists-title__div">
          <h2>Playlists</h2>
        </div>
        <div className="playlists-info__div">
          <p>
            See <i>About</i> for more info about how to use this site.
          </p>
          <p>
            Playlists are automatically seperated into ones you've{' '}
            <a href="#created-playlists" className="subpage-link">
              created
            </a>
            , and ones you{' '}
            <a href="#followed-playlists" className="subpage-link">
              follow
            </a>
            .
          </p>
        </div>

        {typeof sortedPlaylists === 'object' && (
          <div>
            <div
              className="playlists-title__div"
              id="created-playlists"
              tabIndex={0}
            >
              <h3>Created</h3>
            </div>
            <PlaylistList playlistsToRender={sortedPlaylists.created} />

            <br />
            <div
              className="playlists-title__div"
              id="followed-playlists"
              tabIndex={0}
            >
              <h3>Followed</h3>
            </div>
            <PlaylistList playlistsToRender={sortedPlaylists.followed} />

            <br />
            {sortedPlaylists.generated.length > 0 && (
              <>
                <div
                  className="playlists-title__div"
                  id="generated-playlists"
                  tabIndex={0}
                >
                  <h3>Gena</h3>
                </div>
                <PlaylistList playlistsToRender={sortedPlaylists.generated} />
              </>
            )}
          </div>
        )}
      </div>
    );
  } else {
    return <Loading />;
  }
};

export default UserPlaylists;
