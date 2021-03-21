import React, {useContext} from 'react'
import Button from '@material-ui/core/Button';
import UserContext from '../context/UserContext';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

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

  h1:hover {
    cursor: pointer;
  }

  div {
    width: 25%;
  }

  .button {
    height: 50%;
  }
`

const Navbar = ({ resetStates }) => {
  const history = useHistory();
  const { token } = useContext(UserContext);
  const pathname = history.location.pathname;

  const loadPage = (link) => {
    resetStates()
    history.push(link)
  }

  return (
    <NavbarCont>
      <h1 onClick={() => loadPage('/')} id="site-name">Mix Master</h1>

      {token && (
        <div id="nav-buttons">

          {pathname !== '/' && (
            < Button
              variant='outlined'
              color='primary'
              onClick={() => loadPage('/')}
              className="button"
              fullWidth
            >
              Playlists
            </ Button>
          )}

          {pathname !== '/search' && (
            < Button
              variant='outlined'
              color='primary'
              onClick={() => loadPage('search')}
              className="button"
              fullWidth
            >
              Search
            </ Button>
          )}

          {(pathname !== '/about' && pathname !== '/playlist') && (
            < Button
              variant='outlined'
              color='secondary'
              onClick={() => loadPage('/about')}
              className="button"
              fullWidth
            >
              About
            </ Button>
          )}
        </div>
      )}
    </NavbarCont>
  )
}

export default Navbar
