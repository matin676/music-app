import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoLogoInstagram, IoLogoTwitter, IoTrash } from "react-icons/io5";

import { deleteArtistById, getAllArtists } from "../api";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../config/firebase.config";

export default function ArtistCard({ data, type, index }) {
  const [isDelete, setIsDelete] = useState(false);
  const [{ alertType, allArtists }, dispatch] = useStateValue();

  const deleteData = (data) => {
    const deleteRef = ref(storage, data.imageURL);
    deleteObject(deleteRef).then(() => {});

    deleteArtistById(data._id).then((res) => {
      if (res.data) {
        getAllArtists().then((data) => {
          dispatch({
            type: actionType.SET_ALL_ARTISTS,
            allArtists: data.artist,
          });
        });
      }
    });
  };

  return (
    <motion.div className="relative w-40 min-w-210 px-2 py-4 cursor-pointer hover:bg-card bg-gray-100 shadow-md rounded-lg flex flex-col items-center">
      <div className="w-40 min-w-[160px] h-40 min-h-[160px] rounded-lg drop-shadow-lg relative overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={data.imageURL}
          className="w-full h-full rounded-lg object-cover"
        />
      </div>

      <p className="text-base text-center text-headingColor font-semibold my-2">
        {data.name.length > 20 ? `${data.name.slice(0, 20)}...` : data.name}
      </p>
      <div className="flex items-center gap-4">
        <a
          href={`https://www.instagram.com/${data.instagram}`}
          target="_blank"
          rel="noreferrer"
        >
          <motion.i whileTap={{ scale: 0.75 }}>
            <IoLogoInstagram className="text-gray-500 hover:text-headingColor text-xl" />
          </motion.i>
        </a>
        <a
          href={`https://www.twitter.com/${data.twitter}`}
          target="_blank"
          rel="noreferrer"
        >
          <motion.i whileTap={{ scale: 0.75 }}>
            <IoLogoTwitter className="text-gray-500 hover:text-headingColor text-xl" />
          </motion.i>
        </a>
      </div>

      <div className="w-full absolute bottom-2 right-2 flex items-center justify-between px-4">
        <motion.i
          whileTap={{ scale: 0.75 }}
          className="text-base text-red-400 drop-shadow-md hover:text-red-600"
          onClick={() => setIsDelete(true)}
        >
          <IoTrash />
        </motion.i>
      </div>

      {isDelete && (
        <motion.div
          className="absolute inset-0 backdrop-blur-sm bg-cardOverlay flex items-center justify-center flex-col px-4 py-2 gap-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg text-headingColor font-semibold text-center">
            Are you sure do you want to delete it?
          </p>
          <div className="flex items-center gap-4">
            <motion.button
              className="px-2 py-1 text-sm uppercase bg-green-300 rounded-md hover:bg-green-500 cursor-pointer"
              whileTap={{ scale: 0.7 }}
              onClick={() => deleteData(data)}
            >
              Yes
            </motion.button>
            <motion.button
              className="px-2 py-1 text-sm uppercase bg-red-300 rounded-md hover:bg-red-500 cursor-pointer"
              whileTap={{ scale: 0.7 }}
              onClick={() => setIsDelete(false)}
            >
              No
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
