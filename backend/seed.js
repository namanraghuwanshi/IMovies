// Database Seeder Script
// Run using: npm run seed (or node seed.js)
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

// Helper function to format dates as YYYY-MM-DD for the next N days
const getFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await Booking.deleteMany({});
    await Showtime.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing collections (Bookings, Showtimes, Movies, Users).');

    // 2. Insert Users
    // Passwords will be automatically hashed by UserSchema pre-save hook
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Inserted Admin and Test Users.');

    // 3. Insert 6 Sample Movies
    const moviesData = [
      {
        title: 'Inception',
        description:
          'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: 'Sci-Fi',
        language: 'English',
        duration: 148,
        rating: 8.8,
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600',
        releaseDate: new Date('2010-07-16'),
      },
      {
        title: 'The Dark Knight',
        description:
          'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: 'Action',
        language: 'English',
        duration: 152,
        rating: 9.0,
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        releaseDate: new Date('2008-07-18'),
      },
      {
        title: 'Interstellar',
        description:
          'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: 'Sci-Fi',
        language: 'English',
        duration: 169,
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600',
        releaseDate: new Date('2014-11-07'),
      },
      {
        title: 'Avengers: Endgame',
        description:
          'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions.',
        genre: 'Action',
        language: 'English',
        duration: 181,
        rating: 8.4,
        posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
        releaseDate: new Date('2019-04-26'),
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description:
          'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        genre: 'Animation',
        language: 'English',
        duration: 140,
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600',
        releaseDate: new Date('2023-06-02'),
      },
      {
        title: 'Oppenheimer',
        description:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: 'Drama',
        language: 'English',
        duration: 180,
        rating: 8.9,
        posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
        releaseDate: new Date('2023-07-21'),
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`Inserted ${createdMovies.length} movies.`);

    // 4. Insert 2-3 Showtimes per Movie over the next 7 days
    const showtimesData = [];

    createdMovies.forEach((movie, index) => {
      // Showtime 1: Tomorrow afternoon
      showtimesData.push({
        movie: movie._id,
        theater: 'PVR Cinemas, Screen 1',
        date: getFutureDate(1),
        time: '02:30 PM',
        price: 250,
        totalSeats: 40,
        bookedSeats: index === 0 ? ['A1', 'A2'] : [], // Pre-book 2 seats for movie 1
      });

      // Showtime 2: 3 days ahead in the evening
      showtimesData.push({
        movie: movie._id,
        theater: 'INOX Megaplex, Screen 2',
        date: getFutureDate(3),
        time: '06:45 PM',
        price: 300,
        totalSeats: 40,
        bookedSeats: [],
      });

      // Showtime 3: 5 days ahead at night
      showtimesData.push({
        movie: movie._id,
        theater: 'Cinepolis VIP, Screen 4',
        date: getFutureDate(5),
        time: '09:30 PM',
        price: 350,
        totalSeats: 40,
        bookedSeats: [],
      });
    });

    const createdShowtimes = await Showtime.insertMany(showtimesData);
    console.log(`Inserted ${createdShowtimes.length} showtimes.`);

    // 5. Insert 1 sample booking for the regular user (for testing My Bookings immediately)
    const firstShowtime = createdShowtimes[0];
    const sampleBooking = await Booking.create({
      user: regularUser._id,
      showtime: firstShowtime._id,
      seats: ['A1', 'A2'],
      totalAmount: firstShowtime.price * 2,
      status: 'confirmed',
    });
    console.log(`Inserted sample booking for user: ${regularUser.email}`);

    console.log('\n======================================');
    console.log('Database Seeding Completed Successfully!');
    console.log('======================================');
    console.log('Demo Credentials:');
    console.log('  Admin User : admin@imovies.com / admin123 (Role: admin)');
    console.log('  Normal User: user@imovies.com  / user123  (Role: user)');
    console.log(`  Movies     : ${createdMovies.length}`);
    console.log(`  Showtimes  : ${createdShowtimes.length}`);
    console.log(`  Bookings   : 1`);
    console.log('======================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Execute Seeder
seedDatabase();
