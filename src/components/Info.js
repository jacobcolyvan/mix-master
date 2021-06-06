import React from 'react'
import styled from 'styled-components';

const InfoCont = styled.div`
  width: 100%;
  margin-bottom: 2rem;

  li {
    font-size: 0.85rem;
  }


  .info-header {
    font-style: italic;
    margin-bottom: 0.5rem;
    margin-top: 16px;
  }

  .info-points {
    margin: 0;
    margin-left: 1rem;
  }

`

const Info = () => {
  return (
    <InfoCont>
      <h4 className='info-header'>This is a website to:</h4>
      <ul className='info-points'>
        <li>
          – Compare and sort tracks in your Spotify playlists by their key and BPM, or search for tracks, albums, or playlists.
        </li>
        <li>
          * Intended to help a user make better flowing playlists, or mixes.
        </li>
        <li>
          – Works similarly to programs such as MixedInkey, but for the Spotify catalogue.
        </li>
        <li>
          – Click on track name to copy name to clipboard; click on track key to go to recommended tracks.
        </li>
      </ul>
    </InfoCont>
  )
}

export default Info
