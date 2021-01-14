import React, {useContext} from 'react'
import Button from '@material-ui/core/Button';
import UserContext from '../context/UserContext';
import styled from 'styled-components';

const NavbarCont = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 1px solid #E0E0E0;

  h1 {
    margin-left: 8px;
    color: #222222;
    text-decoration: underline;
  }

  div {
    width: 25%;
  }

  .button {
    height: 50%;
  }
`

const Navbar = ({ loadPlaylists, loadAbout, loadSearch }) => {
  const {playlist, about, token, search} = useContext(UserContext);


  return (
    <NavbarCont>
      <h1>Mix Master</h1>
      <div>

        {(playlist || about || search) && (
          < Button variant='outlined' color='primary' onClick={loadPlaylists} className="button" fullWidth>
            Playlists
          </ Button>
        )}

        {(token && !search ) && (
          < Button variant='outlined' color='primary' onClick={loadSearch} className="button" fullWidth >
            Search
          </ Button>
        )}


        {(token && !about) && (
          < Button variant='outlined' color='secondary' onClick={loadAbout} className="button" fullWidth >
            About
          </ Button>
        )}
      </div>
    </NavbarCont>
  )
}

export default Navbar
