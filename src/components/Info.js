import React from 'react'
import styled from 'styled-components';

const InfoCont = styled.div`
  width: 100%;
  margin-bottom: 56px;

  p {
    margin: 0px;
  }

  #info-header {
    margin-bottom: 24px;
    margin-top: 16px;
  }

  #info-points {
    margin-left: 32px;
  }
`

const Info = () => {
  return (
    <InfoCont>
      <p id='info-header'><ins>This is a website to:</ins></p>
      <p id='info-points'>
        – Compare and sort tracks in your Spotify playlists by their key and BPM, or search for tracks, albums, or playlists.
      </p>
      <p id="info-points">
        * Intended to help a user make better flowing playlists, or mixes.
      </p>
      <p id="info-points">
        – Works similarly to programs such as MixedInkey, but for the Spotify catalogue.
      </p>
    </InfoCont>
  )
}

export default Info
