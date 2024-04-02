import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";
import { storage } from "../config/firebase.config";
import { getAllUsers, updateProfileById } from "../api";
import { actionType } from "../context/reducer";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";

export default function EditProfile() {
  const [{ user, allUsers }, dispatch] = useStateValue();
  const [editedUser, setEditedUser] = useState(user?.user || {});
  const [isImage, setIsImage] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const [userName, setUserName] = useState(editedUser.name);
  const [userEmail, setUserEmail] = useState(editedUser.email);
  const [alert, setAlert] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    setEditedUser((prevUser) => ({
      ...prevUser,
      imageURL: imageURL,
    }));
  }, [imageURL]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const storageRef = ref(storage, `Profile/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Handle upload progress if needed
      },
      (error) => {
        setAlert("error");
        setAlertMsg("Error uploading image");
        setTimeout(() => {
          setAlert(null);
        }, 4000);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImageURL(downloadUrl);
          setAlert("success");
          setAlertMsg("File uploaded successfully");
          setTimeout(() => {
            setAlert(null);
          }, 4000);
          setEditedUser((prevUser) => ({
            ...prevUser,
            imageURL: downloadUrl,
          }));
        });
      }
    );
    setIsImage(file);
  };

  const handleDeleteImage = () => {
    if (!editedUser.imageURL) {
      console.log("No image to delete.");
      return;
    }

    const imagePath = editedUser.imageURL.split("?")[0];

    const imageRef = ref(storage, imagePath);

    deleteObject(imageRef)
      .then(() => {
        setAlert("success");
        setAlertMsg("Image deleted successfully");
        setTimeout(() => {
          setAlert(null);
        }, 4000);
        setImageURL("");
      })
      .catch((error) => {
        setAlert("error");
        setAlertMsg("Error deleting image, please try later");
        setTimeout(() => {
          setAlert(null);
        }, 4000);
      });
  };

  const handleSave = () => {
    if (!imageURL || !userName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      setTimeout(() => {
        setAlert(null);
      }, 4000);
      return;
    } else {
      setIsImage(true);

      const updatedUserData = {
        name: userName,
        email: userEmail,
        imageURL: imageURL,
      };

      updateProfileById(user?.user?._id, updatedUserData)
        .then((res) => {
          if (res && res.success) {
            setAlert("success");
            setAlertMsg("Profile updated successfully");
            setTimeout(() => {
              setAlert(null);
            }, 4000);
            setEditedUser((prevUser) => ({
              ...prevUser,
              name: userName,
              email: userEmail,
              imageURL: imageURL,
            }));
            setIsImage(false);
            dispatch({
              type: actionType.SET_USER,
              user: { ...user, user: { ...user.user, ...updatedUserData } },
            });
            getAllUsers().then((userData) => {
              dispatch({
                type: actionType.SET_ALL_USERS,
                allUsers: userData.user,
              });
            });
          } else {
            setAlert("error");
            setAlertMsg("Failed to update the profile");
            setTimeout(() => {
              setAlert(null);
            }, 4000);
          }
        })
        .catch((error) => {
          setAlert("error");
          setAlertMsg("Network error, please try later");
          setTimeout(() => {
            setAlert(null);
          }, 4000);
        })
        .finally(() => {
          setIsImage(false);
          setImageURL("");
          setUserName("");
          setUserEmail("");
        });
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-primary overflow-hidden">
      <Header />
      <div className="flex items-center cursor-pointer gap-16 relative">
        <MdDelete
          className="w-6 h-6 cursor-pointer bg-red-600 rounded-full p-1 absolute top-[4.25rem] left-20"
          onClick={handleDeleteImage}
        />
        <label htmlFor="profile-pic">
          <img
            src={
              editedUser.imageURL ? editedUser.imageURL : user?.user?.imageURL
            }
            className="w-20 h-20 min-w-[100px] object-cover rounded-full shadow-lg cursor-pointer"
            alt="profile pic"
            referrerPolicy="no-referrer"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="profile-pic"
          />
          <MdEdit className="w-6 h-6 cursor-pointer bg-red-600 rounded-full p-1 absolute top-[4.25rem]" />
        </label>

        <div className="flex flex-col">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Type your name here..."
            className="text-textColor border-none outline-none text-2xl hover:text-headingColor font-semibold bg-transparent"
          />
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Type your email here..."
            className="text-textColor text-lg border-none outline-none hover:text-headingColor font-textColor flex justify-center items-center bg-transparent"
          />
        </div>
      </div>
      <div className="flex gap-2 ml-16">
        <div className="bg-blue-400 text-headingColor px-4 py-2 rounded-xl hover:bg-blue-600 transition-all ease-in-out duration-150">
          <button onClick={handleSave}>Update</button>
        </div>
        <div className="bg-blue-400 text-headingColor px-4 py-2 rounded-xl hover:bg-blue-600 transition-all ease-in-out duration-150">
          <NavLink to={"/userprofile"} className="ml-2">
            Cancel
          </NavLink>
        </div>
      </div>
      {alert && (
        <>
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </>
      )}
    </div>
  );
}
