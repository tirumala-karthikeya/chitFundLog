"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneVerification from '../PhoneAuth';

const SignUp = () => {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleVerified = (phone: string) => {
    setIsVerified(true);
    setPhoneNumber(phone);

    localStorage.setItem('phoneNumber', phone);
    localStorage.setItem('userRole', role);
    router.push('/'); 
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-body-secondary">
      <section className="form-signin w-100 m-auto" style={{ maxWidth: "400px" }}>
      <form className="container text-center ">
        <div >
          <h2 className="">Create Account</h2>
          <p className="">Sign up to get started</p>
        </div>

        <div className="space-y-4 p-3">
          <div>
            <label className="block text-sm font-medium mb-1">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded form-select"
              disabled={isVerified}
            >
              <option value="">Choose...</option>
              <option value="owner">Owner</option>
              <option value="participant">Participant</option>
            </select>
          </div>

          {role && (
            <div className='mt-4'>
              <PhoneVerification 
              onVerified={handleVerified}
              selectedRole={role}
            />
            </div>
            
          )}
        </div>
      </form>
      </section>
      
    </div>
  );
};

export default SignUp;