import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProtection from "./components/protection/UserProtection";
import AdminProtection from "./components/protection/AdminProtection";

const Landing = lazy(() => import("./pages/landing/Landing"));
const Login = lazy(() => import("./pages/login/Login"));
const Register = lazy(() => import("./pages/register/Register"));
const Home = lazy(() => import("./pages/home/Home"));
const AddShow = lazy(() => import("./pages/addShow/AddShow"));
const SeatsPage = lazy(() => import("./pages/seatsPage/SeatsPage"));
const AdminLogin = lazy(() => import("./pages/login/AdminLogin"));
const MovieDetails = lazy(() => import("./pages/movieDetails/MovieDetails"));
const AddTheatre = lazy(() => import("./pages/addTheatre/AddTheatre"));
const MovieShows = lazy(() => import("./pages/movieShows/MovieShows"));
const Admin = lazy(() => import("./pages/admin/Admin"));
const AddMovie = lazy(() => import("./pages/addMovie/AddMovie"));
const FavoriteShows = lazy(() => import("./pages/favoriteshows/FavoriteShows"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const AdminRegister = lazy(() => import("./pages/register/AdminRegister"));
const Bookings = lazy(() => import("./pages/bookings/Bookings"));
const EditUserDetails = lazy(() =>
  import("./pages/editUserDetails/EditUserDetails")
);
const AdminBookings = lazy(() => import("./pages/adminBookings/AdminBookings"));

import Loader from "./components/loader/Loader";

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Suspense
        fallback={
          <div
            className="loadingContainer"
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#121212",
            }}
          >
            <Loader />
          </div>
        }
      >
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/movie/:movieName" element={<MovieDetails />} />
          <Route path="/shows/:movieName" element={<MovieShows />} />

          {/* User Protected Routes */}
          <Route element={<UserProtection />}>
            <Route path="/seats/:showId" element={<SeatsPage />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/favorites" element={<FavoriteShows />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditUserDetails />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminProtection />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/add-movie" element={<AddMovie />} />
            <Route path="/admin/add-theatre" element={<AddTheatre />} />
            <Route path="/admin/add-show" element={<AddShow />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
