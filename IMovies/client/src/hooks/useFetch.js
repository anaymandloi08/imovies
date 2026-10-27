import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { render } from "../host";
import { mockMovies, mockTheatres, mockShows } from "../data/mockData";

export const getFallbackData = (reqUrl) => {
  const cleanUrl = reqUrl.replace(/^https?:\/\/[^\/]+/, "");

  if (cleanUrl.includes("/movie/getallmovies") || cleanUrl.includes("/movie/get/all")) {
    const saved = localStorage.getItem("imovies_custom_movies");
    const custom = saved ? JSON.parse(saved) : [];
    return { success: true, movies: [...mockMovies, ...custom] };
  }

  if (cleanUrl.includes("/theatre/getalltheatres")) {
    const saved = localStorage.getItem("imovies_custom_theatres");
    const custom = saved ? JSON.parse(saved) : [];
    return { success: true, theatres: [...mockTheatres, ...custom] };
  }

  if (cleanUrl.includes("/shows/getmovieshows/")) {
    const movieName = decodeURIComponent(cleanUrl.split("/").pop());
    const matched = mockShows.filter(
      (s) => s.movieId.toLowerCase() === movieName.toLowerCase()
    );
    return {
      success: true,
      data: { showData: matched.length > 0 ? matched : mockShows },
    };
  }

  if (cleanUrl.includes("/shows/getshow/")) {
    const showId = cleanUrl.split("/").pop();
    const show =
      mockShows.find((s) => s.showId === showId || s._id === showId) ||
      mockShows[0];
    const movie =
      mockMovies.find(
        (m) => m.movieName.toLowerCase() === show.movieId.toLowerCase()
      ) || mockMovies[0];
    const theatre =
      mockTheatres.find((t) => t.theatreId === show.theatreId) || mockTheatres[0];
    return { success: true, show, movie, theatre };
  }

  if (cleanUrl.includes("/theatre/gettheatredetails/")) {
    const theatreId = cleanUrl.split("/").pop();
    const theatre =
      mockTheatres.find((t) => t.theatreId === theatreId) || mockTheatres[0];
    return { success: true, theatre };
  }

  if (cleanUrl.includes("/bookings/userbookings/")) {
    const saved = localStorage.getItem("imovies_bookings");
    const bookings = saved ? JSON.parse(saved) : [];
    return { success: true, bookings };
  }

  if (cleanUrl.includes("/bookings/all")) {
    const saved = localStorage.getItem("imovies_bookings");
    const bookings = saved ? JSON.parse(saved) : [];
    return { success: true, bookings };
  }

  if (cleanUrl.includes("/favorites/getuserfavorites/")) {
    const saved = localStorage.getItem("imovies_favorites");
    const favorites = saved ? JSON.parse(saved) : [];
    return { success: true, favorites };
  }

  return null;
};

const useFetch = (url) => {
  const [resData, setResData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);

    try {
      const endpoint = url.startsWith("http") ? url : `${render}${url}`;
      const res = await axios.get(endpoint, { timeout: 4000 });
      setResData(res.data);
    } catch (err) {
      console.warn("API request failed, checking offline fallback for:", url, err.message);
      const fallback = getFallbackData(url);
      if (fallback) {
        setResData(fallback);
        setError(null);
      } else {
        setError(err?.response?.data?.error || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reFetch = () => {
    fetchData();
  };

  return { resData, loading, error, reFetch };
};

export default useFetch;
