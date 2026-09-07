import { Alert } from "@mui/material";
import { useLocation } from "react-router-dom";

import { usePageTitle } from "../app/usePageTitle";
import KeySelect from "../atoms/KeySelect";
import PlaylistDescription from "../atoms/PlaylistDescription";
import SortBy from "../atoms/SortBy";
import Tracks from "../components/Tracks";
import { useViewSorting } from "../hooks/useViewSorting";
import { usePlaylist, usePlaylistTracks } from "../queries/playlistQueries";

const Playlist = ({ username }: { username: string }) => {
  const location = useLocation();

  const id = new URLSearchParams(location.search).get("id");
  const { sort, setSort } = useViewSorting();

  const playlistQuery = usePlaylist(id);
  const tracksQuery = usePlaylistTracks(id, playlistQuery.data?.snapshot_id);

  const playlist = playlistQuery.data;
  usePageTitle(playlist?.name || "Playlist");
  const ownerName = playlist?.owner.display_name;
  const showOwnerAttribution = Boolean(ownerName) && ownerName !== username;

  if (!id) {
    return <Alert severity="info">No playlist selected.</Alert>; // defensive
  }

  return (
    <div>
      <KeySelect />
      <SortBy value={sort} onChange={setSort} />

      {playlist && <h3 className="playlist-page-title">{playlist.name}</h3>}
      {playlist?.description && <PlaylistDescription description={playlist.description} />}
      {showOwnerAttribution && <p className="playlist-page-description">({ownerName}).</p>}

      <Tracks
        sortOption={sort}
        tracks={tracksQuery.data ?? null}
        isPending={playlistQuery.isPending || tracksQuery.isPending}
        isPaused={playlistQuery.isPaused || tracksQuery.isPaused}
        error={playlistQuery.error ?? tracksQuery.error}
      />
    </div>
  );
};

export default Playlist;
