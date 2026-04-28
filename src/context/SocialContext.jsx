import React, { createContext, useContext, useState, useCallback } from 'react';

const SocialContext = createContext(null);

export function SocialProvider({ children }) {
  const [tick, setTick] = useState(0);
  const bump = () => setTick(t => t + 1);

  const follow = async (currentUserId, targetUserId) => {
    try {
      const res = await fetch(`/api/social/follow/${targetUserId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.cliqd_token
        }
      });
      if (res.ok) {
        bump();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const unfollow = async (currentUserId, targetUserId) => {
    try {
      const res = await fetch(`/api/social/unfollow/${targetUserId}`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.cliqd_token
        }
      });
      if (res.ok) {
        bump();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Due to the asynchronous nature of API calls, isFollowing might need to be resolved server-side or by fetching.
  // For simplicity, we can fetch the user details when needed.
  // The components relying on these synchronous methods will need slight adjustment, or these can return promises.
  const isFollowing = async (currentUserId, targetUserId) => {
    try {
      const res = await fetch(`/api/social/user/id/${currentUserId}`);
      if (res.ok) {
        const user = await res.json();
        return user.following.includes(targetUserId);
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const getFollowerCount = async (userId) => {
    try {
      const res = await fetch(`/api/social/user/id/${userId}`);
      if (res.ok) {
        const user = await res.json();
        return user.followers.length;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const getFollowingCount = async (userId) => {
    try {
      const res = await fetch(`/api/social/user/id/${userId}`);
      if (res.ok) {
        const user = await res.json();
        return user.following.length;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const getFollowers = async (userId) => {
    try {
      const res = await fetch(`/api/social/followers/${userId}`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  };

  const getFollowing = async (userId) => {
    try {
      const res = await fetch(`/api/social/following/${userId}`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  };

  const getUserByUsername = async (username) => {
    try {
      const res = await fetch(`/api/social/user/${username}`);
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  };

  const getUserById = async (id) => {
    try {
      const res = await fetch(`/api/social/user/id/${id}`);
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  };

  return (
    <SocialContext.Provider value={{
      tick, follow, unfollow, isFollowing,
      getFollowerCount, getFollowingCount,
      getFollowers, getFollowing,
      getUserByUsername, getUserById
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export const useSocial = () => useContext(SocialContext);
