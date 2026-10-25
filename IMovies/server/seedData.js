const bcrypt = require("bcryptjs");
const Admin = require("./models/adminModel");
const User = require("./models/userModel");
const Movie = require("./models/movieModel");
const Theatre = require("./models/theatreModel");
const Show = require("./models/showModel");

const seedDefaultData = async () => {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
      console.log("Database already seeded with movies.");
      return;
    }

    console.log("Seeding initial iMovies data...");

    // Seed Admin
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash("admin123", salt);
    await Admin.create({
      username: "admin",
      email: "admin@imovies.com",
      password: adminPass,
      role: "admin",
    });

    // Seed User
    const userPass = await bcrypt.hash("user1234", salt);
    await User.create({
      username: "johndoe",
      email: "user@imovies.com",
      password: userPass,
    });

    // Seed Theatres
    const t1 = await Theatre.create({
      theatreName: "PVR Cinemas: Grand Mall",
      theatreId: "pvr-grand-01",
      location: "Downtown Plaza, Screen 1 (IMAX)",
      balconySeatPrice: 450,
      middleSeatPrice: 280,
      lowerSeatPrice: 180,
      balconySeats: {
        rows: 2,
        cols: 8,
        seats: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
      },
      middleSeats: {
        rows: 3,
        cols: 8,
        seats: [
          "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
          "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8",
          "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8",
        ],
      },
      lowerSeats: {
        rows: 2,
        cols: 8,
        seats: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8"],
      },
      adminName: "admin",
    });

    const t2 = await Theatre.create({
      theatreName: "INOX: CineCity Luxe",
      theatreId: "inox-cinecity-02",
      location: "Metro Boulevard, Audi 2 (Dolby Atmos)",
      balconySeatPrice: 400,
      middleSeatPrice: 250,
      lowerSeatPrice: 150,
      balconySeats: {
        rows: 2,
        cols: 8,
        seats: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
      },
      middleSeats: {
        rows: 3,
        cols: 8,
        seats: [
          "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8",
          "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8",
          "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8",
        ],
      },
      lowerSeats: {
        rows: 2,
        cols: 8,
        seats: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8"],
      },
      adminName: "admin",
    });

    // Seed Movies
    const m1 = await Movie.create({
      movieName: "Dune: Part Two",
      description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      genres: ["Action", "Sci-Fi", "Adventure"],
      releaseDate: new Date("2024-03-01"),
      runtime: 166,
      certification: "PG-13",
      rating: 8.6,
      language: "English",
      media: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    });

    const m2 = await Movie.create({
      movieName: "Oppenheimer",
      description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
      genres: ["Biography", "Drama", "History"],
      releaseDate: new Date("2023-07-21"),
      runtime: 180,
      certification: "R",
      rating: 8.9,
      language: "English",
      media: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=800&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    });

    const m3 = await Movie.create({
      movieName: "Interstellar",
      description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.",
      genres: ["Adventure", "Drama", "Sci-Fi"],
      releaseDate: new Date("2014-11-07"),
      runtime: 169,
      certification: "PG-13",
      rating: 8.7,
      language: "English",
      media: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    });

    const m4 = await Movie.create({
      movieName: "The Dark Knight",
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests.",
      genres: ["Action", "Crime", "Drama"],
      releaseDate: new Date("2008-07-18"),
      runtime: 152,
      certification: "PG-13",
      rating: 9.0,
      language: "English",
      media: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    });

    const m5 = await Movie.create({
      movieName: "Inception",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
      genres: ["Action", "Adventure", "Sci-Fi"],
      releaseDate: new Date("2010-07-16"),
      runtime: 148,
      certification: "PG-13",
      rating: 8.8,
      language: "English",
      media: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    });

    // Seed Shows
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const showList = [
      {
        adminEmail: "admin@imovies.com",
        showId: "show-dune-01",
        movieId: m1.movieName,
        theatreName: t1.theatreName,
        showdate: today,
        showtime: "14:30",
        tickets: {
          bookedSeats: ["A3", "A4", "C2"],
          balconySeatPrice: t1.balconySeatPrice,
          middleSeatPrice: t1.middleSeatPrice,
          lowerSeatPrice: t1.lowerSeatPrice,
        },
      },
      {
        adminEmail: "admin@imovies.com",
        showId: "show-dune-02",
        movieId: m1.movieName,
        theatreName: t2.theatreName,
        showdate: today,
        showtime: "18:45",
        tickets: {
          bookedSeats: ["B1", "B2"],
          balconySeatPrice: t2.balconySeatPrice,
          middleSeatPrice: t2.middleSeatPrice,
          lowerSeatPrice: t2.lowerSeatPrice,
        },
      },
      {
        adminEmail: "admin@imovies.com",
        showId: "show-opp-01",
        movieId: m2.movieName,
        theatreName: t1.theatreName,
        showdate: today,
        showtime: "20:00",
        tickets: {
          bookedSeats: ["C5", "C6", "D4"],
          balconySeatPrice: t1.balconySeatPrice,
          middleSeatPrice: t1.middleSeatPrice,
          lowerSeatPrice: t1.lowerSeatPrice,
        },
      },
      {
        adminEmail: "admin@imovies.com",
        showId: "show-inter-01",
        movieId: m3.movieName,
        theatreName: t2.theatreName,
        showdate: tomorrow,
        showtime: "16:00",
        tickets: {
          bookedSeats: ["A1"],
          balconySeatPrice: t2.balconySeatPrice,
          middleSeatPrice: t2.middleSeatPrice,
          lowerSeatPrice: t2.lowerSeatPrice,
        },
      },
      {
        adminEmail: "admin@imovies.com",
        showId: "show-dark-01",
        movieId: m4.movieName,
        theatreName: t1.theatreName,
        showdate: tomorrow,
        showtime: "21:30",
        tickets: {
          bookedSeats: [],
          balconySeatPrice: t1.balconySeatPrice,
          middleSeatPrice: t1.middleSeatPrice,
          lowerSeatPrice: t1.lowerSeatPrice,
        },
      },
    ];

    for (const s of showList) {
      await Show.create(s);
    }

    console.log("iMovies seed completed successfully!");
  } catch (error) {
    console.error("Seeding error:", error.message);
  }
};

module.exports = { seedDefaultData };
