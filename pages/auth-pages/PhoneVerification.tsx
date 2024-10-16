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
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerified }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: values.phoneNumber }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send OTP');
        }
        
        setStep('otp');
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
    onSubmit: async (values, { setSubmitting }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: phoneFormik.values.phoneNumber, otp: values.otp }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid OTP');
        }
        
        console.log('OTP verified successfully');
        onVerified(phoneFormik.values.phoneNumber);
        
        // Use router.push as a Promise
        await router.push('/');
        console.log('Navigation to /');
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setError(error instanceof Error ? error.message : 'Invalid OTP. Please try again.');
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  const handleSendOtp = async (number: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: number }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }
      
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert color="danger" isLight className="mb-4">
          {error}
        </Alert>
      )}
      {step === 'phone' ? (
        <form onSubmit={phoneFormik.handleSubmit}>
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
            isDisable={isLoading || !phoneFormik.isValid}
          >
            {isLoading ? <Spinner isSmall inButton isGrow /> : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          otpFormik.handleSubmit();
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
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              otpFormik.handleSubmit();
            }}
          >
            {isLoading ? <Spinner isSmall inButton isGrow /> : 'Verify OTP'}
          </Button>
          <Button
            color="link"
            className="w-100 mt-3"
            onClick={() => setStep('phone')}
          >
            Change Phone Number
          </Button>
        </form>
      )}
    </div>
  );
};

export default PhoneVerification;