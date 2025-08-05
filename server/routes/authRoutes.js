// server/routes/authRoutes.js
import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Username-based login endpoint
router.post('/login-username', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Get all users and find the one with matching username
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return res.status(500).json({ error: 'Server error' });
    }

    // Find user by username in metadata
    const userWithUsername = users.users.find(user => 
      user.user_metadata?.username === username
    );

    if (!userWithUsername) {
      return res.status(401).json({ error: 'Username not found' });
    }

    // Sign in with the found email
    const { data, error } = await supabase.auth.admin.signInWithUserPassword({
      email: userWithUsername.email,
      password: password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Return the session tokens
    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user
    });

  } catch (error) {
    console.error('Auth route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-confirm email endpoint
router.post('/confirm-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Attempting to confirm email for:', email);

    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return res.status(500).json({ error: 'Server error' });
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', user.id, 'Email confirmed:', user.email_confirmed_at);

    // Update user to confirm email - use the correct parameter
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirmed_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error confirming email:', error);
      return res.status(500).json({ error: 'Failed to confirm email: ' + error.message });
    }

    console.log('Email confirmed successfully for user:', user.id);
    res.json({ message: 'Email confirmed successfully', user: data.user });

  } catch (error) {
    console.error('Confirm email error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

export default router; 