import React from 'react';

import Info from './Info';
import styled from 'styled-components';

import CamelotWheel from '../media/camelot-wheel.jpg'

const CamelotInfo = styled.div`
  hr {
    margin-top: 40px;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 0;
  }

  p {
    margin-top: 6px;
  }

  img {
    display: block;
    margin: 40px 0 48px 0;
    margin-left: auto;
    margin-right: auto;
    width: 400px;
    max-width: 100%;
  }

  #info-header {
    margin-bottom: 8px;
    margin-top: px;
  }

  .info-points {
    margin: 0;
    margin-left: 32px;

  }
  .info-sub-points {
    margin: 0;
    margin-left: 48px;
  }

  #links-header {
    margin-bottom: 4px;
    text-decoration: underline;
  }
  .links {
    margin: 0;
  }
`

const Afterword = styled.div`
  hr {
    margin-top: 64px;
  }
  p {
    margin: 0;
  }

  br{
    margin-bottom: 16px;
  }
  #links-header {
    margin-bottom: 4px;
  }
  .links{
    margin: 0;
  }
`


const About = () => {
  return (
    <div>
      <Info />

      <p>Note that all info comes from Spotify, and may not always be  100% accurate.</p>

      <CamelotInfo>
        <hr/>
        <h3>Camelot Key/Wheel</h3>
        <p>
          The <i>Camelot</i> key system is an alternative tool to the circle of fifths for understanding how keys work together harmonically.
          It lets you understand how different keys might work together, without having to understand music theory.
        </p>

        <img src={CamelotWheel} alt="Camelot wheel" />
        <p>
          The basic idea is the closer the numbers are numerically, the more notes they share, and the better they will sound together
          (each number apart represents one difference). Those numbers that are followed by 'B', represent major scales, whereas those
          followed by 'A' represent minor scales.
        </p>

        <h4 id="info-header"><i>So what does this all mean in practice?</i></h4>
        <p className="info-points">– Those that share the same number but different letter can be mixed together easily, </p>
        <p className="info-points">> (they share the same notes but have a different <i>root</i> note; major to minor scale).</p>
        <p className="info-points">– Those that are one number away from one another will be easy to mix together,</p>
        <p className="info-points">> eg. 12a will be easy to mix with 1a and 11a.</p>
        <p className="info-points">– The further two numbers are away from another the harder they will be to mix 'naturally',</p>
        <p className="info-points">> where 1a is hardest to mix with 7a m 3b with 9b, etc.</p>
        <p className="info-points">– Those tracks with similar BPM/Tempo are going to sound more natural when mixed close to one another.</p>

        <br/>
        <p id="links-header">Some links for more info: </p>
        <p className="links"><a target="_blank" rel="noopener noreferrer" href="https://mixedinkey.com/harmonic-mixing-guide/">
          https://mixedinkey.com/harmonic-mixing-guide/
        </a></p>
        <p className="links"><a target="_blank" rel="noopener noreferrer"href="http://www.harmonic-mixing.com/howto.aspx">
          http://www.harmonic-mixing.com/howto.aspx
        </a></p>
      </CamelotInfo>

      <Afterword>
        <hr />
        <p id="links-header">If you're interested, other Spotify-based sites that I've written can be found at:</p>
        <p className="links"><a target="_blank" rel="noopener noreferrer" href="https://spotify-metadata.netlify.app/">
          Spotify Metadata
        </a>, and</p>
        <p className="links"><a target="_blank" rel="noopener noreferrer"href="https://seed-playlists.netlify.app/">
          Seed Playlists
        </a>.</p>

        <br/>

        <p className="afterword"><i>Good times ahead.</i></p>
        <p className="afterword"><i>Enjoy!</i></p>
      </ Afterword>
    </div>
  )
};

export default About;
