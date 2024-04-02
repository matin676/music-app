import React from "react";
import { NavLink } from "react-router-dom";
import { MdVerified, MdCancel } from "react-icons/md";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";

export default function UserProfile() {
  const [{ user }, dispatch] = useStateValue();

  return (
    <div className="w-full flex flex-col items-center justify-center bg-primary overflow-hidden">
      <Header />
      <div className="flex items-center cursor-pointer gap-16 relative">
        <img
          src={user?.user?.imageURL}
          className="w-20 h-20 min-w-[100px] object-cover rounded-full shadow-lg "
          alt="profile pic"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col">
          <p className="text-textColor text-[2rem] hover:text-headingColor font-semibold">
            {user?.user?.name}
          </p>
          <p className="text-textColor text-lg hover:text-headingColor font-textColor flex justify-center items-center">
            {user?.user?.email}{" "}
            {user?.user?.email_verified ? (
              <MdVerified className="text-green-600" title="verified" />
            ) : (
              <MdCancel className="text-red-600" title="email not verified" />
            )}
          </p>
        </div>
      </div>
      <div className="px-4 py-2 rounded-xl bg-red-500 outline-none hover:shadow-md  duration-500 transition-all ease-in-out">
        <NavLink to={"/userprofile/editprofile"}>Edit</NavLink>
      </div>
    </div>
  );
}
