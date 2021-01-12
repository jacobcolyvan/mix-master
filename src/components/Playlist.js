import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import Tracks from './Tracks'
import SortBy from './SortBy';
import KeySelect from './KeySelect';

const camelotMajorKeyDict = {
  "0": "8",
  "1": "3",
  "2": "10",
  "3": "5",
  "4": "12",
  "5": "7",
  "6": "2",
  "7": "9",
  "8": "4",
  "9": "11",
  "10": "6",
  "11": "1"
};

const camelotMinorKeyDict = {
  "0": "5",
  "1": "12",
  "2": "7",
  "3": "2",
  "4": "9",
  "5": "4",
  "6": "11",
  "7": "6",
  "8": "1",
  "9": "8",
  "10": "3",
  "11": "10"
};

const PlaylistName = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const Playlist = () => {
  const {token, playlist} = useContext(UserContext);
  const [tracks, setTracks] = useState(false);
  const [sortedTracks, setSortedTracks] = useState(false);
  const [sortOption, setSortOption] = useState('tempoThenKey');
  const [keyOption, setKeyOption] = useState('camelot');


  useEffect(() => {
    const getTracks = async () => {
      try {
        const trackTotalAmount = playlist.tracks.total;
        let allTracks = false;
        let tracklist = [];
        // let track$
        let offset = 0;
        let trackFeatures = [];

        while (!allTracks) {
          const tracksResponse = await axios({
            method: 'get',
            url: playlist.href + `/tracks?offset=${offset}`,
            // url: playlist.href,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          });



          console.log('playlist :>> ', tracksResponse);


          const trackIds = tracksResponse.data.items.map((item) => item.track.id);

          const featuresResponse = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features/?ids=${trackIds.join(',')}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          })

          tracklist = [...tracklist, ...tracksResponse.data.items];
          trackFeatures = [...trackFeatures, ...featuresResponse.data.audio_features];

          trackTotalAmount > tracklist.length ? offset += 100 : allTracks = true;
        }

        console.log('total :>> ', tracklist.length);



        const splicedTracks = tracklist.map((item, index) => {
          return {
            "name": item.track.name,
            "artists": item.track.artists.length > 1 ? [item.track.artists[0].name, item.track.artists[1].name] : [item.track.artists[0].name],
            "id": item.track.id,
            "tempo": Math.round(trackFeatures[index].tempo),
            "key": trackFeatures[index].key,
            "mode": parseInt(trackFeatures[index].mode)
          }
        })

        setTracks([...splicedTracks]);
        setSortedTracks([...splicedTracks]);
      } catch (err) {
        console.log(err.message);
      }
    };

    getTracks();
  }, [token, playlist]);


  useEffect(() => {
    const camelotSort = (temp) => {
      temp = temp.sort((a, b) => { return a - b });
      temp = temp.sort((a, b) => {
        a = (a.mode === 0 ? (parseInt(camelotMinorKeyDict[a.key])) : (parseInt(camelotMajorKeyDict[a.key])));
        b = (b.mode === 0 ? (parseInt(camelotMinorKeyDict[b.key])) : (parseInt(camelotMajorKeyDict[b.key])));

        return a > b ? 1 : -1;
      });

      return temp;
    }

    // This is a function for standard non-camelot key sort
    const keySort = (temp) => {
      temp.sort((a, b) => parseInt(b.mode) - parseInt(a.mode));
      temp = temp.sort((a, b) => parseInt(a.key) - parseInt(b.key));

      return temp;
    }

    const sorter = (sort) => {
      if (tracks) {
        if (sort === 'key') {
          setSortedTracks(keyOption === 'camelot' ? camelotSort([...tracks]) : keySort([...tracks]));
        } else if (sort === 'tempo') {
          const temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo));

          setSortedTracks(temp);
        } else if (sort === 'tempoThenKey') {
          let temp = [...tracks].sort((a, b) => parseInt(b.tempo) - parseInt(a.tempo));

          setSortedTracks(keyOption === 'camelot' ? camelotSort(temp) : keySort(temp));
        } else {
          setSortedTracks([...tracks])
        }
      }
    }

    sorter(sortOption)

  }, [sortOption, tracks, keyOption])



  return (
    <div>
      <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
      <br/>
      <PlaylistName>{playlist.name}</PlaylistName>
      {/* <p>{playlist.description}</p> */}

      <SortBy sortOption={sortOption} setSortOption={setSortOption} />

      <Tracks
        sortedTracks={sortedTracks}
        keyOption={keyOption}
        camelotMajorKeyDict={camelotMajorKeyDict}
        camelotMinorKeyDict={camelotMinorKeyDict}
      />
    </div>
  )
}

export default Playlist
