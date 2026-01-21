/**
 * DashboardUsers Component
 *
 * Admin dashboard for managing users.
 * Uses React Query for data fetching with automatic cache invalidation.
 */
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";
import moment from "moment";
import toast from "react-hot-toast";

import { useStateValue } from "../../context/StateProvider";
import {
  useUsers,
  useUpdateUserRole,
  useDeleteUser,
} from "../../features/admin/hooks";
import { Skeleton } from "../../shared/components";

// DashboardUserCard Component
export const DashboardUserCard = ({
  data,
  index,
  currentUserId,
  onUpdateRole,
  onDelete,
}) => {
  const [isUserRoleUpdated, setIsUserRoleUpdated] = useState(false);

  const createdAt = moment(new Date(data.createdAt)).format("MMM Do YYYY");

  const handleRoleUpdate = async () => {
    try {
      const newRole = data.role === "admin" ? "member" : "admin";
      await onUpdateRole({ userId: data._id, role: newRole });
      setIsUserRoleUpdated(false);
      toast.success(`${data.name} is now ${newRole}`);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(data._id);
      toast.success(`${data.name} has been removed`);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative w-full grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-2 md:gap-4 items-center p-3 md:p-4 bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shadow-sm border border-gray-200 shrink-0">
        <img
          src={data.imageURL}
          referrerPolicy="no-referrer"
          alt="profile"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Name & Email */}
      <div className="flex flex-col min-w-0 mr-auto">
        <p className="text-sm md:text-base font-bold text-headingColor truncate">
          {data.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{data.email}</p>
        <p className="text-[10px] text-gray-400 md:hidden mt-0.5">
          {createdAt}
        </p>
      </div>

      {/* Created At (Desktop) */}
      <p className="text-sm text-gray-500 hidden md:block text-center min-w-[100px]">
        {createdAt}
      </p>

      {/* Status & Role Column */}
      <div className="flex items-center gap-3">
        {/* Verified Badge */}
        {data.email_verified ? (
          <span className="hidden sm:block px-2 py-0.5 text-[10px] font-bold text-green-600 bg-green-50 rounded-md border border-green-200 uppercase">
            Verified
          </span>
        ) : (
          <span className="hidden sm:block px-2 py-0.5 text-[10px] font-bold text-red-600 bg-red-50 rounded-md border border-red-200 uppercase">
            Unverified
          </span>
        )}

        {/* Role Pill */}
        <div className="relative">
          <div
            className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 rounded-full border ${
              data.role === "admin"
                ? "bg-purple-50 border-purple-200 text-purple-600"
                : "bg-blue-50 border-blue-200 text-blue-600"
            }`}
          >
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide">
              {data.role}
            </span>
            {data._id !== currentUserId && (
              <button
                onClick={() => setIsUserRoleUpdated(!isUserRoleUpdated)}
                className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                title="Change Role"
              >
                <span className="text-[9px] md:text-[10px] font-bold text-gray-600">
                  ✎
                </span>
              </button>
            )}
          </div>

          {/* Role Update Popup */}
          {isUserRoleUpdated && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 flex flex-col gap-2">
              <p className="text-xs text-center font-medium text-gray-700">
                Change role to{" "}
                <b className="text-headingColor">
                  {data.role === "admin" ? "Member" : "Admin"}
                </b>
                ?
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-1 text-xs font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={handleRoleUpdate}
                >
                  Yes
                </button>
                <button
                  className="flex-1 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setIsUserRoleUpdated(false)}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Action (Far Right) */}
      <div className="w-8 md:w-10 flex justify-end shrink-0">
        {data._id !== currentUserId ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-gray-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-gray-100"
            onClick={handleDelete}
            title="Delete User"
          >
            <MdDelete className="text-base md:text-lg" />
          </motion.button>
        ) : (
          <div className="w-7 h-7 md:w-8 md:h-8" /> // Spacer
        )}
      </div>
    </motion.div>
  );
};

export default function DashboardUsers() {
  const [{ user }] = useStateValue();

  // React Query hooks
  const { data: users, isLoading } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  return (
    <div className="w-full flex px-2 md:px-4 pb-4 flex-col gap-3 md:gap-4">
      {/* Header Stats */}
      <div className="w-full flex items-center justify-between p-3 md:p-4 bg-white/40 backdrop-blur-md border border-white/40 rounded-lg md:rounded-xl shadow-sm">
        <p className="text-base md:text-lg font-bold text-headingColor">
          All Users
        </p>
        <span className="px-3 md:px-4 py-1 bg-white text-headingColor font-bold text-sm md:text-base rounded-lg shadow-sm border border-gray-100">
          Total: {users?.length || 0}
        </span>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-8 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <span className="w-12">Image</span>
        <span className="mr-auto">User Details</span>
        <span className="text-center min-w-[100px]">Created</span>
        <span className="text-left pl-6">Role & Status</span>
        <span className="text-right">Action</span>
      </div>

      {/* Users List */}
      <div className="flex flex-col gap-2 md:gap-3 relative">
        {/* Loading Skeletons */}
        {isLoading &&
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-full grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 bg-white rounded-xl"
            >
              <Skeleton className="w-12 h-12 rounded-full" variant="circle" />
              <div className="flex flex-col gap-2">
                <Skeleton className="w-32 h-4" variant="text" />
                <Skeleton className="w-48 h-3" variant="text" />
              </div>
              <Skeleton className="w-20 h-4" variant="text" />
              <Skeleton className="w-16 h-6" variant="rect" />
            </div>
          ))}

        {/* Users */}
        {!isLoading &&
          users?.map((data, i) => (
            <DashboardUserCard
              data={data}
              key={data._id}
              index={i}
              currentUserId={user?.user?._id}
              onUpdateRole={(args) => updateRoleMutation.mutateAsync(args)}
              onDelete={(id) => deleteUserMutation.mutateAsync(id)}
            />
          ))}

        {/* Empty State */}
        {!isLoading && (!users || users.length === 0) && (
          <div className="w-full py-20 flex justify-center text-gray-400">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
