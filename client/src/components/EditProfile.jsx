import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { MdDelete, MdCloudUpload } from "react-icons/md";
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
import SEO from "./SEO";

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
        .catch(() => {
          setAlert("error");
          setAlertMsg("Network error, please try later");
          setTimeout(() => {
            setAlert(null);
          }, 4000);
        })
        .finally(() => {
          setIsImage(false);
          // setImageURL(""); // Don't clear these if we want to show the current state
          // setUserName("");
          // setUserEmail("");
        });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-transparent">
      <SEO
        title="Edit Profile"
        description="Update your personal information and profile picture."
      />
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold text-headingColor">Edit Profile</h2>

          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={
                  editedUser.imageURL
                    ? editedUser.imageURL
                    : user?.user?.imageURL
                }
                className="w-full h-full object-cover"
                alt="profile pic"
                referrerPolicy="no-referrer"
              />
            </div>

            <label
              htmlFor="profile-pic"
              className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md"
            >
              <MdCloudUpload className="text-white text-xl" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profile-pic"
              />
            </label>

            {editedUser.imageURL && (
              <div
                className="absolute top-0 right-0 p-2 bg-red-500 rounded-full cursor-pointer hover:bg-red-600 transition-colors shadow-md"
                onClick={handleDeleteImage}
              >
                <MdDelete className="text-white text-xl" />
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">
                Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2 rounded-lg bg-white/40 border border-white/30 focus:border-blue-500 focus:bg-white/60 outline-none text-headingColor transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">
                Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full px-4 py-2 rounded-lg bg-white/40 border border-white/30 focus:border-blue-500 focus:bg-white/60 outline-none text-headingColor transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30"
            >
              Save Changes
            </button>
            <NavLink to="/userprofile" className="flex-1">
              <button className="w-full py-2 rounded-xl bg-gray-500/20 text-headingColor font-semibold hover:bg-gray-500/30 transition-all">
                Cancel
              </button>
            </NavLink>
          </div>
        </div>
      </main>

      {alert && (
        <div className="fixed top-20 right-4 z-50">
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </div>
      )}
    </div>
  );
}
