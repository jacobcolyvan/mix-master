import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import parse from 'html-react-parser';
import UserContext from '../context/UserContext';
import millisToMinutesAndSeconds from '../utils/CommonFunctions';

import Tracks from '../components/Tracks';
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';

const Playlist = () => {
  const {
    token,
    setTracks,
    setSortedTracks,
    pushPlaylistToState,
    handleAuthError,
  } = useContext(UserContext);
  const [sortOption, setSortOption] = useState('default');
  const [keyOption, setKeyOption] = useState('camelot');
  const history: any = useHistory();
  const playlist = history.location.state.playlist;

  const [description, setDescription] = useState(false);

  useEffect(() => {
    // for retrieving playlists referenced in the description
    const getPlaylist = async (playlistId: string) => {
      const newPlaylist = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/playlists/${playlistId}`,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });

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
          } else {
            return;
          }
        },
      });

      setDescription(parsedDescription);
    };

    parseDescription(playlist.description);
  }, [playlist, history, pushPlaylistToState, token]);

  useEffect(() => {
    const getTracks = async () => {
      try {
        let trackTotalAmount = playlist.tracks.total;
        let offset = 0;
        let tracklist: any[] = [];
        let trackFeatures: any[] = [];
        let artistFeatures: any[] = [];

        while (trackTotalAmount > tracklist.length) {
          let tracksResponse, featuresResponse, artistsResponse;
          try {
            tracksResponse = await axios({
              method: 'get',
              url: playlist.href + `/tracks?offset=${offset}&limit=50`,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
            });

            // eslint-disable-next-line no-loop-func
            tracksResponse = tracksResponse.data.items.map(
              (item: { [key: string]: any[] }) => {
                if (item.track) {
                  return item;
                } else {
                  trackTotalAmount--;
                  return undefined;
                }
              }
            );

            // remove null items
            tracksResponse = tracksResponse.filter(Boolean);
            // TODO: improve this mapping logic
            const trackIds = tracksResponse.map(
              (item: { [key: string]: any }) => item.track.id
            );
            const artistIds = tracksResponse.map(
              (item: { [key: string]: any }) => item.track.artists[0].id
            );

            artistsResponse = await axios({
              method: 'get',
              url: `https://api.spotify.com/v1/artists?ids=${artistIds.join(
                ','
              )}`,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
            });

            featuresResponse = await axios({
              method: 'get',
              url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(
                ','
              )}`,
              headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
            });
          } catch (err) {
            if (err.response?.status === 401) handleAuthError();
            console.log(err);
          }

          tracklist = [...tracklist, ...tracksResponse];
          trackFeatures = [
            ...trackFeatures,
            ...featuresResponse?.data.audio_features,
          ];
          artistFeatures = [
            ...artistFeatures,
            ...artistsResponse?.data.artists,
          ];

          offset += 50;
        }

        // expensive fix for null trackFeatures; flatMap?
        const splicedTracks = tracklist
          .filter((_, index) => trackFeatures[index] != null)
          .map((item, index) => {
            return {
              name: item.track.name,
              artists:
                item.track.artists.length > 1
                  ? [item.track.artists[0].name, item.track.artists[1].name]
                  : [item.track.artists[0].name],
              id: item.track.id && item.track.id,
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
                  ? Math.round(trackFeatures[index].energy.toFixed(2) * 100) /
                    100
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
                trackFeatures[index] != null
                  ? trackFeatures[index].liveness
                  : '',
              loudness:
                trackFeatures[index] != null
                  ? trackFeatures[index].loudness
                  : '',
              speechiness:
                trackFeatures[index] != null
                  ? trackFeatures[index].speechiness
                  : '',
              valence:
                trackFeatures[index] != null
                  ? trackFeatures[index].valence
                  : '',

              duration:
                item.track.duration_ms != null
                  ? millisToMinutesAndSeconds(item.track.duration_ms)
                  : '',
              track_popularity:
                item.track.popularity != null ? item.track.popularity : '',
              artist_genres:
                artistFeatures[index] != null
                  ? artistFeatures[index].genres
                  : '',
              album: item.track.album.name && item.track.album.name,
              release_date: item.track.album.release_date
                ? item.track.album.release_date
                : '',
            };
          });

        setTracks([...splicedTracks]);
        setSortedTracks([...splicedTracks]);
      } catch (err) {
        if (err.response?.status === 401) handleAuthError();
        console.log(err.message);
      }
    };

    getTracks();
  }, [
    token,
    setTracks,
    setSortedTracks,
    playlist,
    playlist.href,
    playlist.tracks.total,
    handleAuthError,
  ]);

  return (
    <div>
      <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
      <SortBy sortOption={sortOption} setSortOption={setSortOption} />

      {playlist && <h3 className="playlist-page-title">{playlist.name}</h3>}
      {description && (
        <p className="playlist-page-description">{description}</p>
      )}

      <Tracks sortOption={sortOption} keyOption={keyOption} />
    </div>
  );
};

export default Playlist;
