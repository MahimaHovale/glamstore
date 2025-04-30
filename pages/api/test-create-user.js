import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Dynamically import the User model
    const UserModel = mongoose.models.User || 
      mongoose.model('User', new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
        password: { type: String, required: true },
      }, { timestamps: true }));
    
    // Create a test user directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testUser = {
      name: 'Test User ' + Math.floor(Math.random() * 1000),
      email: `test${Math.floor(Math.random() * 10000)}@example.com`,
      role: 'customer',
      password: hashedPassword
    };
    
    console.log('Creating user with data:', { ...testUser, password: '[HIDDEN]' });
    
    const newUser = await UserModel.create(testUser);
    console.log('User created with ID:', newUser._id);
    
    // Return the user without the password
    const { password, ...userWithoutPassword } = newUser.toObject();
    
    return res.status(201).json({
      message: 'Test user created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return res.status(500).json({ 
      error: 'Failed to create test user',
      details: error.message
    });
  }
} 