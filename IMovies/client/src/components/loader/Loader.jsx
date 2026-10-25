import React from "react";
import "./Loader.scss";

const Loader = () => {
  return (
    <div className="loaderWrapper">
      <div className="cinemaSpinner">
        <div className="filmReel"></div>
      </div>
      <p className="loadingText">Loading iMovies...</p>
    </div>
  );
};

export default Loader;
