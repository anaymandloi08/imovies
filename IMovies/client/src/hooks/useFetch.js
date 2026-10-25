import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { render } from "../host";

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
      const res = await axios.get(endpoint);
      setResData(res.data);
    } catch (err) {
      console.error("useFetch error for", url, err);
      setError(err?.response?.data?.error || err.message);
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
