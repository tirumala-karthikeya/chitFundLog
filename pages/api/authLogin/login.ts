import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if the password is hashed
      if (data.password.startsWith('$2b$')) {
        // Compare hashed password
        const passwordMatch = await bcrypt.compare(password, data.password);
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        // Plain text password (temporary, remove this after updating all passwords)
        if (password !== data.password) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

      }

      // Password is correct
      res.status(200).json({ message: 'Login successful', user: { id: data.id, email: data.email, role: data.role } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}