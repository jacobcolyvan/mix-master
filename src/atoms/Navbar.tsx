import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectAuthError, selectSpotifyToken } from '../slices/settingsSlice';
import { resetItemStates } from '../slices/itemsSlice';

interface NavButtonProps {
  activeNavItem: string;
  target: string;
  label: string;
  loadPage: (link: string) => void;
  extraClass?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  activeNavItem,
  target,
  label,
  loadPage,
  extraClass,
}) => {
  return (
    <a
      className={`nav-button ${extraClass ? extraClass : ''} ${
        activeNavItem === target ? 'active' : ''
      }`}
      onClick={() => loadPage(target)}
    >
      {label}
    </a>
  );
};

const Navbar = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const authError = useSelector(selectAuthError);
  const spotifyToken = useSelector(selectSpotifyToken);

  const [activeNavItem, setActiveNavItem] = useState('/');

  const loadPage = (link: string) => {
    setActiveNavItem(link);
    history.push(link);

    dispatch(resetItemStates);
  };

  const navItems = [
    { target: '/', label: 'Playlists', extraClass: 'nav-button__top' },
    { target: '/search', label: 'Search' },
    { target: '/about', label: 'About' },
  ];

  return (
    <header className="navbar">
      <h1 onClick={() => loadPage('/')}>Mix Master</h1>

      {spotifyToken && !authError && (
        <div className="nav-buttons">
          {navItems.map(({ target, label, extraClass }) => (
            <NavButton
              key={target}
              activeNavItem={activeNavItem}
              target={target}
              label={label}
              extraClass={extraClass}
              loadPage={loadPage}
            />
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
