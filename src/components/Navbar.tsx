import { useContext, useState, useEffect } from 'react';
import UserContext from '../context/UserContext';
import { useHistory } from 'react-router-dom';

const Navbar = () => {
  const history = useHistory();
  const { token, authError, resetStates } = useContext(UserContext);
  const [activeNavItem, setActiveNavItem] = useState('/');

  const loadPage = (link: string) => {
    setActiveNavItem(link);
    history.push(link);
    resetStates();
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
            className={`nav-button ${
              activeNavItem === '/search' ? 'active' : ''
            }`}
            onClick={() => loadPage('/search')}
          >
            Search
          </a>
          <a
            className={`nav-button ${
              activeNavItem === '/about' ? 'active' : ''
            }`}
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
