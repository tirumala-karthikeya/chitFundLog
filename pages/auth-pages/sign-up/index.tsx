import React, { FC, useCallback, useContext, useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import AuthContext from '../../../context/authContext';
import useDarkMode from '../../../hooks/useDarkMode';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Logo from '../../../components/Logo';
import Button from '../../../components/bootstrap/Button';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Select from '../../../components/bootstrap/forms/Select';
import Option from '../../../components/bootstrap/Option';
import Spinner from '../../../components/bootstrap/Spinner';
import PhoneVerification from '../PhoneVerification';
import { supabase } from '../../../lib/supabase';
import * as Yup from 'yup';

const SignUpHeader: FC = () => {
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Create Account,</div>
			<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
		</>
	);
};

const SignUp: NextPage = () => {
	const router = useRouter();
	const { setUser } = useContext(AuthContext);
	const { darkModeStatus } = useDarkMode();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isPhoneVerified, setIsPhoneVerified] = useState(false);
	const [showOtpInput, setShowOtpInput] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedRole, setSelectedRole] = useState('');
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		// Retrieve the role from localStorage when the component mounts
		const storedRole = localStorage.getItem('selectedRole');
		if (storedRole) {
			setSelectedRole(storedRole);
		}
	}, []);

	const validationSchema = Yup.object({
		phoneNumber: Yup.string().required('Required'),
		role: Yup.string().oneOf(['owner', 'participant', 'Owner', 'Participant'], 'Invalid role').required('Required'),
		otp: Yup.string().when('$showOtpInput', {
			is: true,
			then: (schema) => schema.required('OTP is required'),
			otherwise: (schema) => schema,
		}),
	});

	const formik = useFormik({
		initialValues: {
			phoneNumber: '',
			role: '',
			otp: '',
		},
		validationSchema,
		onSubmit: async (values) => {
			setIsLoading(true);
			setError(null);
			try {
				if (!showOtpInput) {
					console.log('Submitting form with role:', values.role);
					await requestOtp(values.phoneNumber, values.role);
					setShowOtpInput(true);
					setSelectedRole(values.role);
					localStorage.setItem('selectedRole', values.role);
					console.log('Role after OTP request:', values.role);
				} else {
					console.log('Verifying OTP with role:', selectedRole);
					await verifyOtpAndSignUp({ ...values, role: selectedRole });
				}
			} catch (error) {
				console.error('Error during sign-up:', error);
				setError('Failed to complete sign-up. Please try again.');
			} finally {
				setIsLoading(false);
			}
		},
	});

	const requestOtp = async (phoneNumber: string, role: string) => {
		console.log('Requesting OTP for:', phoneNumber, 'Role:', role);
		const response = await fetch('/api/send-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phoneNumber, role }),
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Failed to send OTP: ${errorData.error}`);
		}
		const responseData = await response.json();
		console.log('OTP request response:', responseData);
	};

	const verifyOtpAndSignUp = async (values: typeof formik.values) => {
		console.log('Verifying OTP and signing up:', values);
		console.log('Selected role before API call:', selectedRole);  // Add this line
		const response = await fetch('/api/verify-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				phoneNumber: values.phoneNumber,
				otp: values.otp,
				role: selectedRole.toLowerCase(),  // Use selectedRole instead of values.role
			}),
		});
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Failed to verify OTP: ${errorData.error}`);
		}

		const responseData = await response.json();
		console.log('Verification response:', responseData);

		console.log('Sign-up successful. Role:', responseData.role);
		localStorage.setItem('userRole', responseData.role);
		router.push('/');
	};

	const handlePhoneVerified = (phoneNumber: string) => {
		setIsPhoneVerified(true);
		formik.setFieldValue('phoneNumber', phoneNumber);
	};

	if (!isClient) {
		return null; // or a loading spinner
	}

	return (
			<PageWrapper isProtected={false} className='bg-light'>
				<Head>
					<title>Sign Up</title>
				</Head>
				<Page className='p-0'>
					<div className='row h-100 align-items-center justify-content-center'>
						<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
							<Card className='shadow-3d-dark' data-tour='signup-page'>
								<CardBody>
									<div className='text-center my-5'>
										<Link
											href='/'
											className={classNames(
												'text-decoration-none  fw-bold display-2',
												{
													'text-dark': !darkModeStatus,
													'text-light': darkModeStatus,
												},
											)}>
											<Logo width={200} />
										</Link>
									</div>
									<div
										className={classNames('rounded-3', {
											'bg-l10-dark': !darkModeStatus,
											'bg-dark': darkModeStatus,
										})}>
										<div className='row row-cols-2 g-3 pb-3 px-3 mt-0'>
											<div className='col'>
												<Button
													color={darkModeStatus ? 'light' : 'dark'}
													isLight
													className='rounded-1 w-100'
													size='lg'
													onClick={() => router.push('/auth-pages/login')}>
													Login
												</Button>
											</div>
											<div className='col'>
												<Button
													color={darkModeStatus ? 'light' : 'dark'}
													className='rounded-1 w-100'
													size='lg'
													onClick={() => router.push('/auth-pages/sign-up')}>
													Sign Up
												</Button>
											</div>
										</div>
									</div>

									<SignUpHeader />

									<form className='row g-4' onSubmit={formik.handleSubmit}>
										<div className='col-12'>
											<FormGroup id='role' isFloating label='User Role'>
												<Select
													ariaLabel='User role'
													placeholder='Select role'
													onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
														const selectedValue = e.target.value;
														formik.handleChange(e);
														setSelectedRole(selectedValue);
														localStorage.setItem('selectedRole', selectedValue);
														console.log('Role selected:', selectedValue);  // Add this line
													}}
													onBlur={formik.handleBlur}
													value={selectedRole || formik.values.role}
													name='role'
													isValid={formik.touched.role && !formik.errors.role}
													isTouched={formik.touched.role}
													invalidFeedback={formik.errors.role}
													disabled={showOtpInput}
												>
													<Option value=''>Choose...</Option>
													<Option value='owner'>Owner</Option>
													<Option value='participant'>Participant</Option>
												</Select>
											</FormGroup>
										</div>
										<div className='col-12'>
											<PhoneVerification onVerified={handlePhoneVerified} />
										</div>
										{showOtpInput && (
											<div className='col-12'>
												<FormGroup id='otp' isFloating label='Enter OTP'>
													<Input
														type='text'
														name='otp'
														value={formik.values.otp}
														onChange={formik.handleChange}
														onBlur={formik.handleBlur}
														isValid={formik.touched.otp && !formik.errors.otp}
														isTouched={formik.touched.otp}
														invalidFeedback={formik.errors.otp}
													/>
												</FormGroup>
											</div>
										)}
										{error && (
											<div className='col-12'>
												<div className='alert alert-danger' role='alert'>
													{error}
													{error === 'User already exists. Please log in instead.' && (
														<>
															{' '}
															<Link href='/auth-pages/login'>Click here to log in</Link>.
														</>
													)}
												</div>
											</div>
										)}
										<div className='col-12'>
											<Button
												color='info'
												className='w-100 py-3'
												type='submit'
												isDisable={isLoading || !isPhoneVerified || !selectedRole}>
												{isLoading ? <Spinner isSmall inButton /> : (showOtpInput ? 'Verify OTP' : 'Request OTP')}
											</Button>
										</div>
									</form>
								</CardBody>
							</Card>
							<div className='text-center'>
								<Link
									href='/'
									className={classNames('text-decoration-none me-3 link-dark')}>
									Privacy policy
								</Link>
								<Link
									href='/'
									className={classNames('link-dark text-decoration-none')}>
									Terms of use
								</Link>
							</div>
						</div>
					</div>
				</Page>
			</PageWrapper>
		);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default SignUp;