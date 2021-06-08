import React, {useContext} from 'react'
import Button from '@material-ui/core/Button';
import UserContext from '../context/UserContext';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

const NavbarCont = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  border: 1px solid #424242;
  border-radius: 4px 4px 0 0;

  h1 {
    margin-left: 8px;
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
  const { token, authError } = useContext(UserContext);
  const pathname = history.location.pathname;

  const loadPage = (link) => {
    resetStates()
    history.push(link)
  }

  return (
    <NavbarCont>
      <h1 onClick={() => loadPage('/')} id="site-name">Mix Master</h1>

      {token && !authError && (
        <div>

          {pathname !== '/'  && (
            <Button
              variant='outlined'
              color='primary'
              onClick={() => loadPage('/')}
              className="button nav-button"
              fullWidth
              style={{ fontSize: "1em", fontStyle: "italic" }}
            >
              Playlists
            </ Button>
          )}

          {pathname !== '/search' && (
            <Button
              variant='outlined'
              color='primary'
              onClick={() => loadPage('search')}
              className="button nav-button"
              fullWidth
              style={{ fontSize: "1em", fontStyle: "italic" }}
            >
              Search
            </ Button>
          )}

          {(pathname !== '/about' &&
            !(pathname.includes('/playlist')) &&
            pathname !== '/recommended') && (
            <Button
              variant='outlined'
              color='primary'
              onClick={() => loadPage('/about')}
              className="button nav-button"
              fullWidth
              style={{ fontSize: "1em", fontStyle: "italic" }}
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
