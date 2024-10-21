import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import Button from '../../components/bootstrap/Button';
import Spinner from '../../components/bootstrap/Spinner';
import Alert from '../../components/bootstrap/Alert';
import { useRouter } from 'next/router';

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
  selectedRole: string;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerified, selectedRole }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (Object.keys(router.query).length > 0) {
      router.replace('/auth-pages/sign-up', undefined, { shallow: true });
    }
  }, []);

  useEffect(() => {
    const { phoneNumber: urlPhoneNumber } = router.query;
    if (urlPhoneNumber && typeof urlPhoneNumber === 'string') {
      phoneFormik.setFieldValue('phoneNumber', urlPhoneNumber);
      handleSendOtp(urlPhoneNumber);
    }
  }, [router.query]);

  const phoneFormik = useFormik({
    initialValues: {
      phoneNumber: '',
    },
    validationSchema: Yup.object({
      phoneNumber: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
        .required('Phone number is required'),
    }),
    onSubmit: async (values) => {
      if (!selectedRole) {
        setError('Please select a role before proceeding');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        await handleSendOtp(values.phoneNumber);
      } catch (error) {
        console.error('Error sending OTP:', error);
        setError(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, 'OTP must be 6 digits')
        .required('OTP is required'),
    }),
    onSubmit: async (values) => {
      if (!selectedRole) {
        setError('Role is required for verification');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phoneFormik.values.phoneNumber,
            otp: values.otp,
            role: selectedRole.toLowerCase()
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid OTP');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Invalid OTP');
        }

        // Store user data in localStorage
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userPhone', phoneFormik.values.phoneNumber);
        localStorage.setItem('isVerified', 'true');
        
        onVerified(phoneFormik.values.phoneNumber);

        // Simplified navigation
        router.push('/');

        return false; // Prevent default form submission
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setError(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleSendOtp = async (number: string) => {
    if (!selectedRole) {
      throw new Error('Please select a role before requesting OTP');
    }
    console.log('Sending OTP request with:', { number, role: selectedRole });
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: number, 
          role: selectedRole.toLowerCase() 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }
      
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
      // Keep the step as 'phone' so the user can try again
      setStep('phone');
    }
  };

  // New function to handle verification success
  const handleVerificationSuccess = async (phoneNumber: string, role: string) => {
    try {
      // Store user data
      localStorage.setItem('userRole', role);
      localStorage.setItem('userPhone', phoneNumber);
      localStorage.setItem('isVerified', 'true');
      
      // Call the onVerified callback
      onVerified(phoneNumber);
      
      // Perform navigation
      await router.push('/');
      
      // Force a page reload after navigation
      window.location.href = '/';
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Failed to navigate after verification');
    }
  };

  // New function to prevent form submission from adding to URL
  const handleFormSubmit = async (e: React.FormEvent, formik: any) => {
    e.preventDefault();
    await formik.submitForm();
  };

  return (
    <div>
      {error && (
        <Alert color="danger" isLight className="mb-4">
          {error}
        </Alert>
      )}
      {step === 'phone' ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          phoneFormik.handleSubmit(e);
        }}>
          <FormGroup id="phoneNumber" isFloating label="Phone Number">
            <Input
              type="tel"
              placeholder="+1234567890"
              {...phoneFormik.getFieldProps('phoneNumber')}
              isValid={phoneFormik.isValid}
              isTouched={phoneFormik.touched.phoneNumber}
              invalidFeedback={phoneFormik.errors.phoneNumber}
            />
          </FormGroup>
          <Button
            type="submit"
            color="primary"
            className="w-100 py-3"
            isDisable={isLoading || !phoneFormik.isValid || !selectedRole}
          >
            {isLoading ? <Spinner isSmall inButton isGrow /> : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          otpFormik.handleSubmit(e);
          return false;
        }}>
          <FormGroup id="otp" isFloating label="OTP">
            <Input
              type="text"
              placeholder="123456"
              {...otpFormik.getFieldProps('otp')}
              isValid={otpFormik.isValid}
              isTouched={otpFormik.touched.otp}
              invalidFeedback={otpFormik.errors.otp}
            />
          </FormGroup>
          <Button
            type="submit"
            color="primary"
            className="w-100 py-3"
            isDisable={isLoading || !otpFormik.isValid}
          >
            {isLoading ? <Spinner isSmall inButton isGrow /> : 'Verify OTP'}
          </Button>
          <Button
            color="link"
            className="w-100 mt-3"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setStep('phone');
            }}
          >
            Change Phone Number
          </Button>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;
