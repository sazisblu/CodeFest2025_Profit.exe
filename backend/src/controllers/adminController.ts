import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔐 Login attempt for:', email);

    // Query admin_users table
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    console.log('📋 Database query result:', { hasError: !!error, hasAdmin: !!admin, errorMsg: error?.message });

    if (error || !admin) {
      console.log('❌ Admin not found or query error:', error?.message);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✓ Admin found:', admin.email, 'is_active:', admin.is_active);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    console.log('🔑 Password verification:', isPasswordValid ? '✓ Valid' : '✗ Invalid');
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last_login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: admin.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify admin token
export const verifyAdminToken = async (req: any, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify admin still exists and is active
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active')
      .eq('id', decoded.adminId)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get admin profile
export const getAdminProfile = async (req: any, res: Response) => {
  return res.json({ admin: req.admin });
};

// Helper function to hash password (for manual admin creation)
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};
