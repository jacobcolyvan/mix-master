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

  .button {
    width:25%
  }
`

const Navbar = ({loadPlaylists, loadAbout}) => {
  const {playlist, about, token} = useContext(UserContext);


  return (
    <NavbarCont>
      <h1>Mix Master</h1>
      {(token && !about && !playlist) && (
        < Button variant='outlined' color='secondary' onClick={loadAbout} className="button">
          About
        </ Button>
      )}

      {(playlist || about) && (
        < Button variant='outlined' color='primary' onClick={loadPlaylists} className="button">
          Playlists
        </ Button>
      )}
    </NavbarCont>
  )
}

export default Navbar
