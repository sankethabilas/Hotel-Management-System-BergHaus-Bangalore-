import { User } from '../models/userModel.js';
import { createGuestRegisteredNotification } from '../services/notificationService.js';

// Get all users or filter by role
export async function getUsers(req, res) {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
}

// Get user by ID
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
}

// Create new user
export async function createUser(req, res) {
  try {
    const { firstName, lastName, name, email, phone, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Handle both formats: name (old) or firstName+lastName (new)
    let userFirstName, userLastName;
    if (firstName && lastName) {
      userFirstName = firstName;
      userLastName = lastName;
    } else if (name) {
      // Split name into first and last if provided as single field
      const nameParts = name.trim().split(' ');
      userFirstName = nameParts[0];
      userLastName = nameParts.slice(1).join(' ') || nameParts[0];
    } else {
      return res.status(400).json({ message: 'firstName and lastName are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ 
      firstName: userFirstName, 
      lastName: userLastName, 
      email, 
      phone, 
      role: role || 'guest' 
    });

    // Create notification if new guest is registered
    if (user.role === 'guest') {
      await createGuestRegisteredNotification(user);
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
}
