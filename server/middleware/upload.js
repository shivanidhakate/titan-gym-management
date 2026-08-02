const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Dynamic storage engine to support fallback when Cloudinary is not configured
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on route (e.g. users, trainers)
    let folder = 'gym_profiles';
    if (req.baseUrl.includes('trainer')) {
      folder = 'gym_trainers';
    }
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      public_id: `${req.user.id}_${Date.now()}`,
    };
  },
});

// A wrapper to handle the fallback gracefully if keys are missing
const upload = multer({ 
  storage: process.env.CLOUDINARY_API_KEY ? storage : multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;
