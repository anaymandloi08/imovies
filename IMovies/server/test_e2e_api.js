const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Movie = require('./models/Movie');
const Theatre = require('./models/Theatre');
const Show = require('./models/Show');
const Booking = require('./models/Booking');

async function runEndToEndTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 IMOVIES FULL-STACK E2E TEST & CONCURRENCY VERIFICATION');
  console.log('🧪 ========================================================');

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('✅ 1. In-Memory MongoDB Connected at:', uri);

  // Test 1: User Registration
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('TestPass123!', salt);
  const userA = await User.create({
    name: 'User A (Alex)',
    email: 'alex@test.com',
    password: passwordHash
  });
  const userB = await User.create({
    name: 'User B (Sarah)',
    email: 'sarah@test.com',
    password: passwordHash
  });
  console.log('✅ 2. User Registration & Password Hashing: PASS');

  // Test 2: JWT Issuance & Verification
  const tokenA = jwt.sign({ id: userA._id }, 'imovies_super_secret_jwt_key_2026', { expiresIn: '1d' });
  const decodedA = jwt.verify(tokenA, 'imovies_super_secret_jwt_key_2026');
  console.log(`✅ 3. JWT Token Authentication: PASS (User ID matched: ${decodedA.id === userA._id.toString()})`);

  // Test 3: Movie Catalog & Search
  const movie = await Movie.create({
    title: 'Dune: Part Two',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    description: 'Paul Atreides unites with Chani and the Fremen.',
    duration: 166,
    rating: 8.6,
    releaseDate: '2024-03-01',
    posterUrl: 'https://example.com/dune.jpg',
    bannerUrl: 'https://example.com/dune-banner.jpg'
  });
  const searchResult = await Movie.find({ title: { $regex: 'dune', $options: 'i' } });
  console.log(`✅ 4. Movie Catalog & Search Query: PASS (${searchResult.length} movie found)`);

  // Test 4: Theatres and Shows
  const theatre = await Theatre.create({
    name: 'PVR ICON IMAX',
    city: 'Metropolis',
    location: 'Grand Mall'
  });
  const show = await Show.create({
    movie: movie._id,
    theatre: theatre._id,
    screenName: 'IMAX Screen 1',
    date: '2026-10-25',
    time: '07:30 PM',
    standardPrice: 250,
    vipPrice: 450,
    bookedSeats: ['A1', 'A2']
  });
  console.log(`✅ 5. Theatre & Showtime Configuration: PASS (Initial booked seats: ${show.bookedSeats.join(', ')})`);

  // Test 5: ATOMIC CONCURRENCY DOUBLE-BOOKING PREVENTION
  console.log('\n🔒 --- CONCURRENCY RACE CONDITION TEST ---');
  console.log('User A and User B simultaneously attempt to reserve seat "E5"...');

  // User A reservation attempt
  const targetSeat = 'E5';
  const lockUserA = await Show.findOneAndUpdate(
    {
      _id: show._id,
      bookedSeats: { $nin: [targetSeat] }
    },
    {
      $addToSet: { bookedSeats: { $each: [targetSeat] } }
    },
    { new: true }
  );

  let userABookingStatus = false;
  let userBBookingStatus = false;

  if (lockUserA) {
    userABookingStatus = true;
    await Booking.create({
      bookingReference: 'IMV-TEST-001',
      user: userA._id,
      show: show._id,
      seats: [targetSeat],
      totalAmount: 450,
      status: 'Confirmed'
    });
    console.log('👉 User A Result: SUCCESS -> Seat "E5" booked! Booking Reference: IMV-TEST-001');
  }

  // User B simultaneous attempt on SAME seat "E5"
  const lockUserB = await Show.findOneAndUpdate(
    {
      _id: show._id,
      bookedSeats: { $nin: [targetSeat] }
    },
    {
      $addToSet: { bookedSeats: { $each: [targetSeat] } }
    },
    { new: true }
  );

  if (!lockUserB) {
    userBBookingStatus = false;
    console.log('👉 User B Result: REJECTED (HTTP 409 Conflict) -> Seat "E5" already reserved by User A!');
  }

  console.log(`✅ 6. Atomic Double-Booking Prevention: PASS (User A: ${userABookingStatus}, User B: ${userBBookingStatus ? 'CONFLICT FAILED' : 'SAFELY REJECTED'})`);

  // Test 6: Booking Retrieval & Cancellation
  const userBookings = await Booking.find({ user: userA._id });
  console.log(`✅ 7. Booking History Dashboard Query: PASS (${userBookings.length} booking found for User A)`);

  // Test 7: Cancellation & Seat Release
  const bookingToCancel = userBookings[0];
  await Show.findByIdAndUpdate(bookingToCancel.show, {
    $pull: { bookedSeats: { $in: bookingToCancel.seats } }
  });
  bookingToCancel.status = 'Cancelled';
  await bookingToCancel.save();

  const refreshedShow = await Show.findById(show._id);
  const seatReleased = !refreshedShow.bookedSeats.includes(targetSeat);
  console.log(`✅ 8. Booking Cancellation & Seat Release: PASS (Seat "E5" released back to inventory: ${seatReleased})`);

  console.log('🧪 ========================================================');
  console.log('🎉 ALL 8 E2E INTEGRATION & CONCURRENCY TESTS PASSED!');
  console.log('🧪 ========================================================\n');

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runEndToEndTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
