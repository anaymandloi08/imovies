const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

const moviesData = [
  {
    title: 'Dune: Part Two',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    duration: 166,
    rating: 8.6,
    language: 'English',
    releaseDate: '2024-03-01',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
    isNowShowing: true
  },
  {
    title: 'Oppenheimer',
    genre: ['Biography', 'Drama', 'History'],
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and political dilemmas that defined his life.',
    duration: 180,
    rating: 8.9,
    language: 'English',
    releaseDate: '2023-07-21',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    isNowShowing: true
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    genre: ['Animation', 'Action', 'Adventure'],
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When heroes clash on handling a new threat, Miles must redefine what it means to be a hero.',
    duration: 140,
    rating: 8.7,
    language: 'English',
    releaseDate: '2023-06-02',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    isNowShowing: true
  },
  {
    title: 'Interstellar',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    duration: 169,
    rating: 8.7,
    language: 'English',
    releaseDate: '2014-11-07',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    isNowShowing: true
  },
  {
    title: 'Inception',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    duration: 148,
    rating: 8.8,
    language: 'English',
    releaseDate: '2010-07-16',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    isNowShowing: true
  },
  {
    title: 'The Dark Knight',
    genre: ['Action', 'Crime', 'Drama'],
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    duration: 152,
    rating: 9.0,
    language: 'English',
    releaseDate: '2008-07-18',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1400&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    isNowShowing: true
  }
];

const theatresData = [
  {
    name: 'PVR ICON IMAX',
    city: 'Metropolis',
    location: 'Nexus Grand Mall, 4th Floor',
    screens: 5
  },
  {
    name: 'Cinépolis VIP Grand',
    city: 'Metropolis',
    location: 'City Centre Galleria, Sector 18',
    screens: 6
  },
  {
    name: 'INOX Megaplex',
    city: 'Metropolis',
    location: 'Phoenix Marketcity, East Wing',
    screens: 4
  }
];

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    console.log('[Seed] Cleared old collections.');

    // Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash('Password123!', salt);
    const adminPassword = await bcrypt.hash('AdminPass123!', salt);

    const demoUser = await User.create({
      name: 'John Moviegoer',
      email: 'user@imovies.com',
      password: userPassword,
      role: 'user'
    });

    const adminUser = await User.create({
      name: 'Admin Manager',
      email: 'admin@imovies.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('[Seed] Created default user (user@imovies.com) and admin (admin@imovies.com).');

    // Create Movies
    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Inserted ${createdMovies.length} movies.`);

    // Create Theatres
    const createdTheatres = await Theatre.insertMany(theatresData);
    console.log(`[Seed] Inserted ${createdTheatres.length} theatres.`);

    // Generate Shows for today and next 2 days
    const showTimes = ['10:30 AM', '01:45 PM', '05:30 PM', '09:15 PM'];
    const dates = [getTodayString(0), getTodayString(1), getTodayString(2)];
    const showsToInsert = [];

    for (const movie of createdMovies) {
      for (const theatre of createdTheatres) {
        for (const date of dates) {
          for (let i = 0; i < showTimes.length; i++) {
            const time = showTimes[i];
            // Sample already-booked seats for realism
            let bookedSeats = [];
            if (i === 1) bookedSeats = ['B3', 'B4', 'C5'];
            if (i === 2) bookedSeats = ['D4', 'D5', 'D6', 'E5', 'E6'];
            if (i === 3) bookedSeats = ['A1', 'A2', 'F9', 'F10'];

            showsToInsert.push({
              movie: movie._id,
              theatre: theatre._id,
              screenName: `Screen ${((i % theatre.screens) + 1)}`,
              date,
              time,
              standardPrice: 250,
              vipPrice: 450,
              rows: ['A', 'B', 'C', 'D', 'E', 'F'],
              seatsPerRow: 10,
              bookedSeats
            });
          }
        }
      }
    }

    const createdShows = await Show.insertMany(showsToInsert);
    console.log(`[Seed] Created ${createdShows.length} scheduled showtimes.`);

    // Create 1 sample booking for Demo User
    const sampleShow = createdShows[0];
    const sampleBooking = await Booking.create({
      bookingReference: 'IMV-839210',
      user: demoUser._id,
      show: sampleShow._id,
      seats: ['C7', 'C8'],
      totalAmount: 500,
      status: 'Confirmed'
    });
    // add to bookedSeats
    sampleShow.bookedSeats.push('C7', 'C8');
    await sampleShow.save();
    console.log('[Seed] Created sample booking for demo user (Ref: IMV-839210).');

    console.log('========================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Credentials:');
    console.log('  User:  user@imovies.com  / Password123!');
    console.log('  Admin: admin@imovies.com / AdminPass123!');
    console.log('========================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
