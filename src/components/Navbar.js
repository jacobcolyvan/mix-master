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
`

const Navbar = ({clearPlaylist}) => {
  const {playlist} = useContext(UserContext);


  return (
    <NavbarCont>
      <h1>Playlist Sorter</h1>
      {playlist && (
        <Button variant='outlined' color='primary' onClick={clearPlaylist} >
          Playlists
        </Button>
      )}
    </NavbarCont>
  )
}

export default Navbar
