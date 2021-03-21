# Mix Master (Spotify)
<b><ins>Deployed at:</ins> </b> <a href=https://mix-master.netlify.app/ target="_blank">https://mix-master.netlify.app/</a>. <br>

This is basic project intended to help users make better playlists and mixes, by looking at key and tempo data of a chosen Spotify playlist or album. A good mix transitions between tracks that are similar in key and tempo (based on Circle of Fifths), this site helps you do this. A guide for using the site can be found in the 'About' section. <br>

* Can be used as a companion app for dj software, to help you make better transitions between tracks.
* Can can be used to help find samples for production, given that you know what tempo/key you want to work in.
* Can be used as a companion site for getting quick key data, to aid jamming with whatever album/playlist you want (because knowing what key you're in is goes a long way).
* Can be used to find similar tracks by using Spotifys' song radio / get track recommendations API endpoint; see <a href="https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-recommendations">here</a> for more info.
<br>

<ins>Note:</ins> that all data comes from Spotify, and will only be as accurate as Spotify's analysis alogorithms'. \
<ins>Note#2:</ins> (for music nerds) Spotify only provides estimations for major/minor, and as such at this point will not tell you whether the key is in a different Mode to those.

It is built with React, and styled using styled-components & Material-UI. Requests are done using axios, and Spotify-auth is done completely client-side using the <a href="https://developer.spotify.com/documentation/general/guides/authorization-guide/">Client Credentials Authorisation Flow</a>. This means none of your personal data ever actually leaves your browser.

<hr>
<h4>Features</h4>

* Choose any playlist that you have created or followed, and
* Sort by key, tempo, or tempo and key.
* Display key in standard or Camelot, which is a system that lets you understand keys that are close together without having to know musical theory (the site explains how to do this).
* Search for albums, tracks, and public playlists, and see key/tempo data for each.
* Separates playlists into created and followed.
* Get recommendations for any track that also tries to match key.

<hr>

If interested, other Spotify-based sites that I've written are:
* <ins>Spotify Metadata</ins>, a site for exploring your listening habits – <a href=https://github.com/jacobcolyvan/spotify-metadata target="_blank"> Github</a>, <a href=https://spotify-metadata.netlify.app/ target="_blank">deployed</a>.
* <ins>Seed Playlists</ins>, a site for generating your own custom daily mixes/playlists – <a href=https://seed-playlists.netlify.app/ target="_blank"> Github</a>, <a href=https://seed-playlists.netlify.app/ target="_blank">deployed</a>.


<hr>

Otherwise, <br>
<i>Happy Coding</i> and <i>Stay Safe</i>.
