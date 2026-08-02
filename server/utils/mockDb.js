// Mock Database Store for Offline Execution
const bcrypt = require('bcryptjs');

const mockDb = {
  users: [],
  plans: [],
  bookings: [],
  workouts: [],
  attendance: [],
  payments: [],
  notifications: [],
  bmiRecords: []
};

// Initialize Mock Data
const initMockData = () => {
  // 1. Plans
  mockDb.plans = [
    {
      _id: 'plan_basic',
      name: 'Basic Monthly',
      description: 'Standard access to general gym areas for individuals starting out.',
      durationMonths: 1,
      price: 999,
      features: ['Full gym access', 'Standard cardio zone', 'Locker room access', '1 Fitness consultation'],
      isActive: true
    },
    {
      _id: 'plan_premium',
      name: 'Premium Quarterly',
      description: 'Popular Choice! Ideal for committed gym-goers seeking group sessions.',
      durationMonths: 3,
      price: 2499,
      features: ['Full gym access', 'Cardio & Strength zones', 'Group aerobics classes', 'Steam & spa access', '2 Personal training sessions'],
      isActive: true
    },
    {
      _id: 'plan_titan',
      name: 'Titan Annual VIP',
      description: 'Ultimate premium package. Includes unlimited group classes and personal trainers.',
      durationMonths: 12,
      price: 7999,
      features: ['24/7 Gym access', 'VIP locker room', 'All group classes (yoga, HIIT, boxing)', 'Dedicated personal trainer', 'Customized nutrition plans', 'Monthly body composition reports', 'Free gym merchandise'],
      isActive: true
    }
  ];

  // Passwords hashed mock
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('memberpassword123', salt);
  const trainerPassword = bcrypt.hashSync('trainerpassword123', salt);
  const adminPassword = bcrypt.hashSync('adminpassword123', salt);

  // 2. Users
  mockDb.users = [
    {
      _id: 'user_admin',
      name: 'Chief Admin',
      email: 'admin@titangym.com',
      password: adminPassword,
      role: 'admin',
      phone: '+91 99999 88888',
      address: 'Admin Office Suite A',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      activeMembership: { planId: null, status: 'none', startDate: null, endDate: null }
    },
    {
      _id: 'user_trainer1',
      name: 'John Carter',
      email: 'john.trainer@titangym.com',
      password: trainerPassword,
      role: 'trainer',
      phone: '+91 88888 77777',
      address: 'Trainer Quarters B',
      profilePicture: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200',
      trainerSpecialties: ['Bodybuilding', 'Nutrition Planning'],
      trainerBio: 'Former weightlifting champion with 8+ years coaching experience.',
      trainerRate: 500,
      trainerStatus: 'active'
    },
    {
      _id: 'user_trainer2',
      name: 'Sarah Jenkins',
      email: 'sarah.trainer@titangym.com',
      password: trainerPassword,
      role: 'trainer',
      phone: '+91 77777 66666',
      address: 'Downtown Apt 4C',
      profilePicture: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=200',
      trainerSpecialties: ['HIIT', 'Cardio Fitness', 'Weight Loss'],
      trainerBio: 'Certified fitness expert specializing in body transformation.',
      trainerRate: 600,
      trainerStatus: 'active'
    },
    {
      _id: 'user_trainer3',
      name: 'Mike Tyson',
      email: 'mike.trainer@titangym.com',
      password: trainerPassword,
      role: 'trainer',
      phone: '+91 66666 55555',
      address: 'Strength Gym Complex',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      trainerSpecialties: ['Strength & Conditioning', 'Boxing'],
      trainerBio: 'Specialist in functional movements and competitive conditioning.',
      trainerRate: 800,
      trainerStatus: 'active'
    },
    {
      _id: 'user_member1',
      name: 'David Beckham',
      email: 'member@titangym.com',
      password: hashedPassword,
      role: 'member',
      phone: '+91 91997 76655',
      address: '22 Victoria Lane',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      assignedTrainer: 'user_trainer1',
      activeMembership: {
        planId: 'plan_basic',
        status: 'active',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    },
    {
      _id: 'user_member2',
      name: 'Serena Williams',
      email: 'member2@titangym.com',
      password: hashedPassword,
      role: 'member',
      phone: '+91 92222 33333',
      address: 'Tennis Club Estates',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      assignedTrainer: 'user_trainer2',
      activeMembership: {
        planId: 'plan_premium',
        status: 'active',
        startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000)
      }
    },
    {
      _id: 'user_member3',
      name: 'Bruce Wayne',
      email: 'member3@titangym.com',
      password: hashedPassword,
      role: 'member',
      phone: '+91 98765 43210',
      address: 'Wayne Manor',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      assignedTrainer: 'user_trainer3',
      activeMembership: {
        planId: 'plan_titan',
        status: 'none',
        startDate: null,
        endDate: null
      }
    }
  ];

  // 3. BMI History
  mockDb.bmiRecords = [
    { _id: 'bmi1', memberId: 'user_member1', weight: 80, height: 180, bmi: 24.7, bodyFat: 16, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { _id: 'bmi2', memberId: 'user_member1', weight: 79, height: 180, bmi: 24.4, bodyFat: 15.2, recordedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { _id: 'bmi3', memberId: 'user_member1', weight: 78, height: 180, bmi: 24.1, bodyFat: 14.5, recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    
    { _id: 'bmi4', memberId: 'user_member2', weight: 72, height: 175, bmi: 23.5, bodyFat: 21, recordedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
    { _id: 'bmi5', memberId: 'user_member2', weight: 70, height: 175, bmi: 22.9, bodyFat: 19.5, recordedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { _id: 'bmi6', memberId: 'user_member2', weight: 69, height: 175, bmi: 22.5, bodyFat: 18.2, recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
  ];

  // 4. Payments
  mockDb.payments = [
    {
      _id: 'pay_seed_001',
      memberId: 'user_member1',
      planId: 'plan_basic',
      amount: 999,
      status: 'completed',
      paymentMethod: 'razorpay_mock',
      razorpayOrderId: 'order_seed_001',
      razorpayPaymentId: 'pay_seed_001',
      transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      _id: 'pay_seed_002',
      memberId: 'user_member2',
      planId: 'plan_premium',
      amount: 2499,
      status: 'completed',
      paymentMethod: 'razorpay_mock',
      razorpayOrderId: 'order_seed_002',
      razorpayPaymentId: 'pay_seed_002',
      transactionDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    }
  ];

  // 5. Workouts
  mockDb.workouts = [
    {
      _id: 'work_1',
      memberId: 'user_member1',
      trainerId: 'user_trainer1',
      title: 'Hypertrophy Strength Program',
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
    },
    {
      _id: 'work_2',
      memberId: 'user_member2',
      trainerId: 'user_trainer2',
      title: 'HIIT & Weight Loss Circuit',
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
    }
  ];

  // 6. Bookings
  mockDb.bookings = [
    {
      _id: 'book_1',
      memberId: 'user_member1',
      trainerId: 'user_trainer1',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      timeSlot: '09:00 AM - 10:00 AM',
      status: 'approved',
      notes: 'Focusing on bench press form check.'
    },
    {
      _id: 'book_2',
      memberId: 'user_member2',
      trainerId: 'user_trainer2',
      date: new Date(Date.now() + 48 * 60 * 60 * 1000), // in 2 days
      timeSlot: '05:00 PM - 06:00 PM',
      status: 'pending',
      notes: 'Initial body assessment update.'
    }
  ];

  // 7. Attendance
  const checkInTimes = ['07:30 AM', '08:15 AM', '08:45 AM', '09:00 AM'];
  for (let i = 0; i < 10; i++) {
    mockDb.attendance.push({
      _id: `att_m1_${i}`,
      memberId: 'user_member1',
      date: new Date(Date.now() - (i + 2) * 24 * 60 * 60 * 1000),
      status: 'present',
      checkInTime: checkInTimes[i % checkInTimes.length],
      qrCodeData: `token_seed_m1_${i}`
    });
  }
  for (let i = 0; i < 15; i++) {
    mockDb.attendance.push({
      _id: `att_m2_${i}`,
      memberId: 'user_member2',
      date: new Date(Date.now() - (i + 3) * 24 * 60 * 60 * 1000),
      status: 'present',
      checkInTime: checkInTimes[(i + 1) % checkInTimes.length],
      qrCodeData: `token_seed_m2_${i}`
    });
  }

  // 8. Notifications
  mockDb.notifications = [
    {
      _id: 'notif_1',
      userId: 'user_member1',
      title: 'Welcome to Titan Gym!',
      message: 'Explore your member panel: schedule workouts, track weight metrics, and scan check-ins.',
      type: 'general',
      isRead: false,
      createdAt: new Date()
    },
    {
      _id: 'notif_2',
      userId: 'user_member2',
      title: 'Training Session Scheduled',
      message: 'Your personal training session for tomorrow with Sarah Jenkins is approved.',
      type: 'booking',
      isRead: false,
      createdAt: new Date()
    }
  ];
};

initMockData();

module.exports = {
  mockDb,
  helpers: {
    findUserById: (id) => mockDb.users.find(u => u._id === id),
    findUserByEmail: (email) => {
      const target = (email || '').toLowerCase().trim();
      if (target === 'trainer@titangym.com') {
        return mockDb.users.find(u => u.email === 'john.trainer@titangym.com');
      }
      return mockDb.users.find(u => u.email.toLowerCase() === target);
    },
    findPlanById: (id) => mockDb.plans.find(p => p._id === id),
    findBookingById: (id) => mockDb.bookings.find(b => b._id === id),
    findWorkoutByMemberId: (mId) => mockDb.workouts.find(w => w.memberId === mId),
    findBmiHistory: (mId) => mockDb.bmiRecords.filter(r => r.memberId === mId),
    findPaymentsByMemberId: (mId) => mockDb.payments.filter(p => p.memberId === mId),
    findAttendanceByMemberId: (mId) => mockDb.attendance.filter(a => a.memberId === mId),
    findNotificationsByUserId: (uId) => mockDb.notifications.filter(n => n.userId === uId)
  }
};
