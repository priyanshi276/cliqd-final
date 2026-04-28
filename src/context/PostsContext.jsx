import React, { createContext, useContext, useState, useEffect } from 'react';

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async (query = '') => {
    try {
      const url = query ? `/api/posts?q=${encodeURIComponent(query)}` : '/api/posts';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const createPost = async (postData) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.cliqd_token
        },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        return newPost;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await fetch(`/api/posts/like/${postId}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.cliqd_token
        }
      });
      if (res.ok) {
        const likes = await res.json();
        setPosts(posts.map(p => p._id === postId ? { ...p, likes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.cliqd_token
        }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPostsByUser = async (userId) => {
    try {
      const res = await fetch(`/api/posts/user/${userId}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const searchPosts = async (query) => {
    await fetchPosts(query);
    return posts;
  };

  return (
    <PostsContext.Provider value={{ posts, createPost, toggleLike, deletePost, getPostsByUser, searchPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export const usePosts = () => useContext(PostsContext);
