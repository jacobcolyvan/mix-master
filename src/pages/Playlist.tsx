import { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import parse from 'html-react-parser';

import UserContext from '../context/UserContext';
import Tracks from '../components/Tracks';
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';
import { selectSpotifyToken, selectUsername } from '../features/settingsSlice';
import { getTracks, setSortedTracks } from '../features/itemsSlice';

const Playlist = () => {
  const { pushPlaylistToState } = useContext(UserContext);

  const token = useSelector(selectSpotifyToken);
  const username = useSelector(selectUsername);
  const history: any = useHistory();
  // TODO: rethink this
  const playlist = history.location.state.playlist;

  const dispatch = useDispatch();
  const [description, setDescription] = useState(false);

  useEffect(() => {
    dispatch(getTracks(playlist));
  }, []);

  // TODO: move playlist to separate component
  // Get parsed playlist description
  // NOTE: this is being done in the component as it uses HTML elements
  useEffect(() => {
    // for retrieving playlists [onClick] referenced in the description
    const getPlaylist = async (playlistId: string) => {
      const newPlaylist = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/playlists/${playlistId}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

      dispatch(setSortedTracks(null));
      pushPlaylistToState(history, newPlaylist.data);
    };

    // safely render a string to html
    // and make any playlist links clickable
    const parseDescription = (description: string) => {
      let parsedDescription: any = description.replaceAll(
        /href="spotify:playlist:(\w+)"/g,
        'href="$1" id="replace"'
      );

      parsedDescription = parse(parsedDescription, {
        replace: (domNode: any) => {
          if (domNode.name === 'a' && domNode.attribs.id === 'replace') {
            return (
              <span
                onClick={() => {
                  getPlaylist(domNode.attribs.href);
                }}
              >
                {[...domNode.children][0].data}
              </span>
            );
          } else if (domNode.name === 'a') {
            return (
              <a {...domNode.attribs} target="_blank">
                {[...domNode.children][0].data}
              </a>
            );
          }

          return domNode;
        },
      });

      setDescription(parsedDescription);
    };

    parseDescription(playlist.description);
  }, [playlist, history, pushPlaylistToState, token]);

  return (
    <div>
      <KeySelect />
      <SortBy />

      {playlist && <h3 className="playlist-page-title">{playlist.name}</h3>}
      {description && <p className="playlist-page-description">{description}</p>}
      {playlist.owner.display_name !== username && (
        <p className="playlist-page-description">({playlist.owner.display_name}).</p>
      )}

      <Tracks />
    </div>
  );
};

export default Playlist;
