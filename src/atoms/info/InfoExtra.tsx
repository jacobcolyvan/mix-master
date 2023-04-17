const InfoExtra = () => {
  return (
    <div>
      <p>Note that all info comes from Spotify, and may not always be 100% accurate.</p>
      <ul>
        <li>
          – The track name{' '}
          <b>
            <span>copies to clipboard</span>
          </b>{' '}
          on pressing the name.
        </li>
        <li>
          – Click on the key of any track to go to
          <b>
            <span>recommended tracks</span>
          </b>
          . This uses Spotify's song radio/generated tracks API to get tracks that are
          similar, and in a similar key/mode to the selected song.
        </li>
        <li>
          – Hover over the tooltip to see more track-related info. Note that the genres
          provided by Spotify are unfortunately artist specific rather than track,
          meaning they sometimes might be inaccurate. Welcome to the weird and wonderful
          world of Spotify's 4000+ genre classifications. Also note that if there are
          more than one artist, genres are only shown for the first.
        </li>
      </ul>
    </div>
  );
};

export default InfoExtra;
