import React, { useContext, useState } from 'react';
import UserContext from '../context/UserContext';

import Albums from './Albums';
import Tracks from './Tracks';
import PlaylistList from './PlaylistList';
import SortBy from './SortBy';
import KeySelect from './KeySelect';

interface SearchResultsProps {
  handleResultsChange: (key: string, value: any) => any;
  showOnlyPlaylistTracks: () => void;
  searchResultValues: {
    albums: boolean;
    playlistSearchResults: string;
    tracks: boolean;
  };
  updateUrl: (slug: string, results: any) => void;
  albumName: string | boolean;
  setAlbumName: React.Dispatch<React.SetStateAction<string | unknown>>;
}

const SearchResults = ({
  handleResultsChange,
  showOnlyPlaylistTracks,
  searchResultValues,
  updateUrl,
  albumName,
  setAlbumName,
}: SearchResultsProps) => {
  const { tracks, playlist } = useContext(UserContext);
  const [sortOption, setSortOption] = useState('default');
  const [keyOption, setKeyOption] = useState('camelot');

  return (
    <div>
      {searchResultValues.albums && !searchResultValues.tracks && (
        <Albums
          albums={searchResultValues.albums}
          handleResultsChange={handleResultsChange}
          updateUrl={updateUrl}
          setAlbumName={setAlbumName}
        />
      )}

      {!playlist && !searchResultValues.playlistSearchResults && tracks && (
        <>
          {albumName ? (
            <h3 className="results-page-title">{albumName}</h3>
          ) : (
            <h3 className="results-page-title">Track Results</h3>
          )}
          <KeySelect keyOption={keyOption} setKeyOption={setKeyOption} />
          <br />
          <SortBy sortOption={sortOption} setSortOption={setSortOption} />
          <br />

          <Tracks sortOption={sortOption} keyOption={keyOption} />
        </>
      )}

      {searchResultValues.playlistSearchResults && (
        <>
          <h3 className="results-page-title">Playlist Results</h3>
          <PlaylistList
            playlistsToRender={searchResultValues.playlistSearchResults}
            showOnlyPlaylistTracks={showOnlyPlaylistTracks}
          />
        </>
      )}
    </div>
  );
};

export default SearchResults;
