import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectAuthError, selectSpotifyToken } from '../slices/settingsSlice';
import { resetItemStates } from '../slices/itemsSlice';

const Navbar = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const authError = useSelector(selectAuthError);
  const token = useSelector(selectSpotifyToken);

  const [activeNavItem, setActiveNavItem] = useState('/');

  const loadPage = (link: string) => {
    setActiveNavItem(link);
    history.push(link);

    dispatch(resetItemStates);
  };

  useEffect(() => {}, [history.location.pathname]);

  return (
    <header className="navbar">
      <h1 onClick={() => loadPage('/')}>Mix Master</h1>

      {token && !authError && (
        <div className="nav-buttons">
          <a
            className={`nav-button nav-button__top ${
              activeNavItem === '/' ? 'active' : ''
            }`}
            onClick={() => loadPage('/')}
          >
            Playlists
          </a>
          <a
            className={`nav-button ${activeNavItem === '/search' ? 'active' : ''}`}
            onClick={() => loadPage('/search')}
          >
            Search
          </a>
          <a
            className={`nav-button ${activeNavItem === '/about' ? 'active' : ''}`}
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
