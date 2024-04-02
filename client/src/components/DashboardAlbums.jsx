import React, { useEffect } from "react";

import { useStateValue } from "../context/StateProvider";
import { getAllAlbums } from "../api";
import { actionType } from "../context/reducer";
import AlbumCard from "./AlbumCard";

export default function DashboardAlbums() {
  const [{ allAlbums }, dispatch] = useStateValue();

  useEffect(() => {
    if (!allAlbums) {
      getAllAlbums().then((data) => {
        dispatch({
          type: actionType.SET_ALL_ALBUMS,
          allAlbums: data.album,
        });
      });
    }
  }, []);

  return (
    <div className="w-full p-4 flex items-center justify-center flex-col">
      <div className="relative w-full my-4 p-4 border border-gray-300 rounded-md">
        <AlbumContainer data={allAlbums} />
      </div>
    </div>
  );
}

export const AlbumContainer = ({ data }) => {
  return (
    <div className="relative w-full gap-3  my-4 p-4 py-12 border border-gray-300 rounded-md flex flex-wrap justify-evenly">
      {data &&
        data.map((album, i) => (
          <AlbumCard key={album._id} data={album} index={i} type="album" />
        ))}
    </div>
  );
};
