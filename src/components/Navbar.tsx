import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import UserContext from '../context/UserContext';
import { useHistory } from 'react-router-dom';

interface NavbarProps {
  resetStates: any; // TODO
}

const Navbar: React.FC<NavbarProps> = ({ resetStates }) => {
  const history = useHistory();
  const { token, authError } = useContext(UserContext);
  const pathname = history.location.pathname;

  const loadPage = (link: string) => {
    resetStates();
    history.push(link);
  };

  return (
    <header className="navbar">
      <h1 onClick={() => loadPage('/')} id="site-name">
        Mix Master
      </h1>

      {token && !authError && (
        <div className="nav-buttons">
          {pathname !== '/' && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => loadPage('/')}
              className="nav-button"
              fullWidth
            >
              Playlists
            </Button>
          )}

          {pathname !== '/search' && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => loadPage('search')}
              className="nav-button"
              fullWidth
            >
              Search
            </Button>
          )}

          {pathname !== '/about' &&
            !pathname.includes('/playlist') &&
            pathname !== '/recommended' && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => loadPage('/about')}
                className="nav-button"
                fullWidth
              >
                About
              </Button>
            )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
