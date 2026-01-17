export const initialState = {
  user: null,
  searchTerm: "",
  allUsers: null,
  allSongs: null,
  allArtists: null,
  allAlbums: null,
  filterTerm: null,
  artistFilter: null,
  languageFilter: null,
  albumFilter: null,
  songIndex: 0,
  isSongPlaying: false,
  miniPlayer: false,
  favourites: [],
  playlist: null,
  selectedPlaylist: null,
  currentPlaylist: null, // Stores the current playing context (null = all songs)
  repeatMode: "off", // 'off' | 'one' | 'all'
  isShuffle: false,
};
