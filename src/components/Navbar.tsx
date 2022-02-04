import React, { useContext } from 'react';
import UserContext from '../context/UserContext';
import { useHistory } from 'react-router-dom';

const Navbar = () => {
  const history = useHistory();
  const { token, authError, resetStates } = useContext(UserContext);
  const pathname = history.location.pathname;

  const loadPage = (link: string) => {
    resetStates();
    history.push(link);
  };

  return (
    <header className="navbar">
      <h1 onClick={() => loadPage('/')}>Mix Master</h1>

      {token && !authError && (
        <div className="nav-buttons">
          <a
            className={`nav-button ${pathname === '/' ? 'active' : ''}`}
            onClick={() => loadPage('/')}
          >
            Playlists
          </a>
          <a
            className={`nav-button ${pathname === '/search' ? 'active' : ''}`}
            onClick={() => loadPage('/search')}
          >
            Search
          </a>
          <a
            className={`nav-button ${pathname === '/about' ? 'active' : ''}`}
            onClick={() => loadPage('/about')}
          >
            About
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
