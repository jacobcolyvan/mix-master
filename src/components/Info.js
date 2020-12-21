import React from 'react'
import styled from 'styled-components';

const InfoCont = styled.div`
  width: 100%;
  margin-bottom: 24px;

  p {
    margin: 0px;
  }

  #info-header {
    margin-bottom: 8px;
    margin-top: 16px;
  }

  #info-points {
    margin-left: 32px;
  }
`

const Info = () => {
  return (
    <InfoCont>
      <p id='info-header'>This is a website to:</p>
      <p id='info-points'>
        – Compare and sort your playlists by their genre or bpm.
      </p>
      <p id="info-points">* Intended to help a user make better flowing playlists,
        or mixes.</p>
    </InfoCont>
  )
}

export default Info
