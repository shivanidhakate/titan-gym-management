const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const Booking = require('../models/Booking');
const WorkoutPlan = require('../models/WorkoutPlan');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const BMIRecords = require('../models/BMIRecords');

const seedData = async (isAutoSeed = false) => {
  try {
    if (!isAutoSeed) {
      // Connect to DB
      const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym-management';
      await mongoose.connect(connStr, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Seed: Connected to MongoDB.');
    }

    // Clear DB
    await User.deleteMany();
    await MembershipPlan.deleteMany();
    await Booking.deleteMany();
    await WorkoutPlan.deleteMany();
    await Attendance.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    await BMIRecords.deleteMany();
    console.log('Seed: Cleared existing database records.');

    // 1. Create Membership Plans
    const plans = await MembershipPlan.insertMany([
      {
        name: 'Basic Monthly',
        description: 'Standard access to general gym areas for individuals starting out.',
        durationMonths: 1,
        price: 999,
        features: ['Full gym access', 'Standard cardio zone', 'Locker room access', '1 Fitness consultation'],
        isActive: true
      },
      {
        name: 'Premium Quarterly',
        description: 'Popular Choice! Ideal for committed gym-goers seeking group sessions.',
        durationMonths: 3,
        price: 2499,
        features: ['Full gym access', 'Cardio & Strength zones', 'Group aerobics classes', 'Steam & spa access', '2 Personal training sessions'],
        isActive: true
      },
      {
        name: 'Titan Annual VIP',
        description: 'Ultimate premium package. Includes unlimited group classes and personal trainers.',
        durationMonths: 12,
        price: 7999,
        features: ['24/7 Gym access', 'VIP locker room', 'All group classes (yoga, HIIT, boxing)', 'Dedicated personal trainer', 'Customized nutrition plans', 'Monthly body composition reports', 'Free gym merchandise'],
        isActive: true
      }
    ]);
    console.log('Seed: Created Membership Plans.');

    // 2. Create Admin
    const admin = await User.create({
      name: 'Chief Admin',
      email: 'admin@titangym.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+91 99999 88888',
      address: 'Admin Office Suite A, Gym Center'
    });
    console.log('Seed: Created Admin (admin@titangym.com / adminpassword123).');

    // 3. Create Trainers
    const trainer1 = await User.create({
      name: 'John Carter',
      email: 'john.trainer@titangym.com',
      password: 'trainerpassword123',
      role: 'trainer',
      phone: '+91 88888 77777',
      address: 'Trainer Quarters, Gym Block B',
      profilePicture: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
      trainerSpecialties: ['Bodybuilding', 'Nutrition Planning', 'Weight Gain'],
      trainerBio: 'Former weightlifting champion with 8+ years coaching experience.',
      trainerRate: 500,
      trainerStatus: 'active'
    });

    const trainer2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.trainer@titangym.com',
      password: 'trainerpassword123',
      role: 'trainer',
      phone: '+91 77777 66666',
      address: 'Downtown Apt 4C, Tech City',
      profilePicture: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=200',
      trainerSpecialties: ['HIIT', 'Cardio Fitness', 'Weight Loss', 'Pilates'],
      trainerBio: 'Certified fitness expert specializing in body transformation and endurance coaching.',
      trainerRate: 600,
      trainerStatus: 'active'
    });

    const trainer3 = await User.create({
      name: 'Mike Tyson',
      email: 'mike.trainer@titangym.com',
      password: 'trainerpassword123',
      role: 'trainer',
      phone: '+91 66666 55555',
      address: 'Strength gym complex, Zone 1',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      trainerSpecialties: ['Strength & Conditioning', 'Boxing Training', 'Athletic Prep'],
      trainerBio: 'Specialist in functional movements, power building, and competitive athletic conditioning.',
      trainerRate: 800,
      trainerStatus: 'active'
    });
    console.log('Seed: Created Trainers (john.trainer/sarah.trainer/mike.trainer with trainerpassword123).');

    // 4. Create Members
    // Member 1: Active Basic Plan
    const member1Start = new Date();
    member1Start.setDate(member1Start.getDate() - 15); // Started 15 days ago
    const member1End = new Date(member1Start);
    member1End.setMonth(member1End.getMonth() + 1);

    const member1 = await User.create({
      name: 'David Beckham',
      email: 'member@titangym.com',
      password: 'memberpassword123',
      role: 'member',
      phone: '+91 91997 76655',
      address: '22 Victoria Lane, Westend',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      assignedTrainer: trainer1._id,
      activeMembership: {
        planId: plans[0]._id,
        status: 'active',
        startDate: member1Start,
        endDate: member1End
      }
    });

    // Member 2: Active Quarterly Plan
    const member2Start = new Date();
    member2Start.setDate(member2Start.getDate() - 40); // Started 40 days ago (expires in ~50 days)
    const member2End = new Date(member2Start);
    member2End.setMonth(member2End.getMonth() + 3);

    const member2 = await User.create({
      name: 'Serena Williams',
      email: 'member2@titangym.com',
      password: 'memberpassword123',
      role: 'member',
      phone: '+91 92222 33333',
      address: 'Tennis Club Estates, Tech City',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      assignedTrainer: trainer2._id,
      activeMembership: {
        planId: plans[1]._id,
        status: 'active',
        startDate: member2Start,
        endDate: member2End
      }
    });

    // Member 3: Expired Member (No active membership plan)
    const member3 = await User.create({
      name: 'Bruce Wayne',
      email: 'member3@titangym.com',
      password: 'memberpassword123',
      role: 'member',
      phone: '+91 98765 43210',
      address: 'Wayne Manor, Gotham Outskirts',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      assignedTrainer: trainer3._id,
      activeMembership: {
        planId: plans[2]._id,
        status: 'none', // Expired/none
        startDate: null,
        endDate: null
      }
    });
    console.log('Seed: Created Members (member@, member2@, member3@ with memberpassword123).');

    // 5. Generate progress metrics (BMI History)
    const records = [];
    const dateOf = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    // David Beckham history
    records.push({ memberId: member1._id, weight: 80, height: 180, bmi: 24.7, bodyFat: 16, recordedAt: dateOf(30) });
    records.push({ memberId: member1._id, weight: 79, height: 180, bmi: 24.4, bodyFat: 15.2, recordedAt: dateOf(15) });
    records.push({ memberId: member1._id, weight: 78, height: 180, bmi: 24.1, bodyFat: 14.5, recordedAt: dateOf(2) });

    // Serena Williams history
    records.push({ memberId: member2._id, weight: 72, height: 175, bmi: 23.5, bodyFat: 21, recordedAt: dateOf(40) });
    records.push({ memberId: member2._id, weight: 70, height: 175, bmi: 22.9, bodyFat: 19.5, recordedAt: dateOf(20) });
    records.push({ memberId: member2._id, weight: 69, height: 175, bmi: 22.5, bodyFat: 18.2, recordedAt: dateOf(5) });

    await BMIRecords.insertMany(records);
    console.log('Seed: Logged progress metrics (BMI charts data).');

    // 6. Generate historical payments
    await Payment.insertMany([
      {
        memberId: member1._id,
        planId: plans[0]._id,
        amount: plans[0].price,
        status: 'completed',
        paymentMethod: 'razorpay_mock',
        razorpayOrderId: 'order_seed_001',
        razorpayPaymentId: 'pay_seed_001',
        transactionDate: member1Start
      },
      {
        memberId: member2._id,
        planId: plans[1]._id,
        amount: plans[1].price,
        status: 'completed',
        paymentMethod: 'razorpay_mock',
        razorpayOrderId: 'order_seed_002',
        razorpayPaymentId: 'pay_seed_002',
        transactionDate: member2Start
      }
    ]);
    console.log('Seed: Created Payments log.');

    // 7. Generate attendance records
    const attendanceLogs = [];
    const checkInTimes = ['07:30 AM', '08:15 AM', '08:45 AM', '09:00 AM'];

    // Generate 10 days of attendance for David Beckham
    for (let i = 0; i < 10; i++) {
      attendanceLogs.push({
        memberId: member1._id,
        date: dateOf(i + 2),
        status: 'present',
        checkInTime: checkInTimes[i % checkInTimes.length],
        qrCodeData: `token_seed_m1_${i}`
      });
    }

    // Generate 15 days of attendance for Serena Williams
    for (let i = 0; i < 15; i++) {
      attendanceLogs.push({
        memberId: member2._id,
        date: dateOf(i + 3),
        status: 'present',
        checkInTime: checkInTimes[(i + 1) % checkInTimes.length],
        qrCodeData: `token_seed_m2_${i}`
      });
    }

    await Attendance.insertMany(attendanceLogs);
    console.log('Seed: Injected Attendance logs.');

    // 8. Generate workout plans
    await WorkoutPlan.create({
      memberId: member1._id,
      trainerId: trainer1._id,
      title: 'Hypertrophy Strength Program',
      startDate: member1Start,
      endDate: member1End,
      days: [
        {
          day: 'Monday',
          exercises: [
            { name: 'Bench Press', sets: 4, reps: '10', weight: '60 kg', notes: 'Warm up first set' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '12', weight: '22 kg', notes: 'Control negative motion' },
            { name: 'Triceps Pushdown', sets: 4, reps: '15', weight: '30 kg', notes: 'Squeeze triceps at bottom' }
          ]
        },
        {
          day: 'Wednesday',
          exercises: [
            { name: 'Deadlift', sets: 4, reps: '6', weight: '100 kg', notes: 'Keep spine neutral' },
            { name: 'Lat Pulldown', sets: 3, reps: '12', weight: '55 kg', notes: 'Pull to upper chest' },
            { name: 'Bicep Barbell Curl', sets: 3, reps: '12', weight: '25 kg', notes: 'No swinging' }
          ]
        },
        {
          day: 'Friday',
          exercises: [
            { name: 'Barbell Back Squat', sets: 4, reps: '8', weight: '80 kg', notes: 'Go deep below parallel' },
            { name: 'Leg Press', sets: 3, reps: '12', weight: '150 kg', notes: 'Do not lock knees' },
            { name: 'Seated Calf Raise', sets: 4, reps: '15', weight: '40 kg', notes: 'Hold stretch for 1s' }
          ]
        }
      ]
    });

    await WorkoutPlan.create({
      memberId: member2._id,
      trainerId: trainer2._id,
      title: 'HIIT & Weight Loss Circuit',
      startDate: member2Start,
      endDate: member2End,
      days: [
        {
          day: 'Tuesday',
          exercises: [
            { name: 'Treadmill Sprints', sets: 5, reps: '30s sprint / 30s rest', weight: 'Speed 14', notes: 'Max effort sprints' },
            { name: 'Kettlebell Swings', sets: 3, reps: '20', weight: '16 kg', notes: 'Drive from hips' },
            { name: 'Burpees', sets: 3, reps: '15', weight: 'Bodyweight', notes: 'Minimal rest' }
          ]
        },
        {
          day: 'Thursday',
          exercises: [
            { name: 'Jump Rope', sets: 5, reps: '2 mins', weight: 'Bodyweight', notes: 'Keep fast pace' },
            { name: 'Goblet Squats', sets: 4, reps: '15', weight: '14 kg', notes: 'Explosive ascent' },
            { name: 'Plank Hold', sets: 3, reps: '60 seconds', weight: 'Bodyweight', notes: 'Keep core tight' }
          ]
        }
      ]
    });
    console.log('Seed: Assigned Default Workout Plans.');

    // 9. Initial bookings
    await Booking.create({
      memberId: member1._id,
      trainerId: trainer1._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'approved',
      notes: 'Focusing on bench press form check.'
    });

    await Booking.create({
      memberId: member2._id,
      trainerId: trainer2._id,
      date: new Date(Date.now() + 48 * 60 * 60 * 1000), // in 2 days
      timeSlot: '05:00 PM - 06:00 PM',
      status: 'pending',
      notes: 'Initial body assessment update.'
    });
    console.log('Seed: Created Training Session bookings.');

    // 10. Initial notifications
    await Notification.create({
      userId: member1._id,
      title: 'Welcome to Titan Gym!',
      message: 'Explore your member panel: schedule workouts, track weight metrics, and scan check-ins.',
      type: 'general'
    });

    await Notification.create({
      userId: member2._id,
      title: 'Training Session Scheduled',
      message: 'Your personal training session for tomorrow with Sarah Jenkins is approved.',
      type: 'booking'
    });

    console.log('Seed: Inserted notification logs.');
    console.log('\nSeed process complete successfully!');
    if (!isAutoSeed) {
      mongoose.disconnect();
    }
  } catch (error) {
    console.error('Seed: Seeding script failed:', error.message);
    if (!isAutoSeed) process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
