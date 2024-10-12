import React, { FC, useCallback, useContext, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import classNames from 'classnames';
import Link from 'next/link';
import PropTypes from 'prop-types';
import AuthContext from '../../../context/authContext';
import useDarkMode from '../../../hooks/useDarkMode';
import { supabase } from '../../../lib/supabase';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Logo from '../../../components/Logo';
import Button from '../../../components/bootstrap/Button';
import Alert from '../../../components/bootstrap/Alert';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Spinner from '../../../components/bootstrap/Spinner';
import axios from 'axios';

interface ILoginHeaderProps {
	isNewUser?: boolean;
}
const LoginHeader: FC<ILoginHeaderProps> = ({ isNewUser }) => {
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Create Account,</div>
				<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>Sign in to continue!</div>
		</>
	);
};

interface ILoginProps {
	isSignUp?: boolean;
}
const Login: NextPage<ILoginProps> = ({ isSignUp }) => {
	const router = useRouter();

	const { setUser } = useContext(AuthContext);

	const { darkModeStatus } = useDarkMode();

	const [signInPassword, setSignInPassword] = useState<boolean>(false);
	const [singUpStatus, setSingUpStatus] = useState<boolean>(!!isSignUp);

	const handleOnClick = useCallback(() => router.push('/'), [router]);

	const usernameCheck = async (username: string) => {
		const { data, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', username)
			.single();
		
		if (error) {
			console.error('Error checking email:', error);
			return false;
		}
		
		return !!data;
	};

	const passwordCheck = async (values: { email: string; password: string }): Promise<boolean> => {
		try {
			const response = await axios.post('http://localhost:3000/api/authLogin/login', {
				email: values.email,
				password: values.password
			});
			console.log('Login successful:', response.data);
			return true;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					console.log('Invalid credentials');
					return false;
				}
				console.log('Error during sign in:', error.response?.data || 'Unknown error');
			} else {
				console.log('An unexpected error occurred:', error);
			}
			return false;
		}
	};

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			loginUsername: '',
			loginPassword: '',
		},
			validate: (values) => {
				const errors: { loginUsername?: string; loginPassword?: string } = {};

				if (!values.loginUsername) {
					errors.loginUsername = 'Required';
				}

				if (!values.loginPassword) {
					errors.loginPassword = 'Required';
				}

				return errors;
			},
			validateOnChange: false,
			onSubmit: async (values) => {
				try {
					const loginSuccess = await passwordCheck({ email: values.loginUsername, password: values.loginPassword });
					if (loginSuccess) {
						router.push('/');
					} else {
						formik.setFieldError('loginPassword', 'Invalid email or password. Please try again.');
					}
				} catch (error) {
					console.error('Login error:', error);
					formik.setFieldError('loginPassword', 'An error occurred during login. Please try again later.');
				}
			},
	});

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const handleContinue = async () => {
		setIsLoading(true);
		try {
			const userExists = await usernameCheck(formik.values.loginUsername);
			if (!userExists) {
				formik.setFieldError('loginUsername', 'No user found with this email.');
			} else {
				setSignInPassword(true);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<PageWrapper
			isProtected={false}
			className={classNames({ 'bg-dark': !singUpStatus, 'bg-light': singUpStatus })}>
			<Head>
				<title>{singUpStatus ? 'Sign Up' : 'Login'}</title>
			</Head>
			<Page className='p-0'>
				<div className='row h-100 align-items-center justify-content-center'>
					<div className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'>
						<Card className='shadow-3d-dark' data-tour='login-page'>
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
												isLight={singUpStatus}
												className='rounded-1 w-100'
												size='lg'
												onClick={() => {
													setSignInPassword(false);
													setSingUpStatus(false);
												}}>
												Login
											</Button>
										</div>
										<div className='col'>
											<Button
												color={darkModeStatus ? 'light' : 'dark'}
												isLight={!singUpStatus}
												className='rounded-1 w-100'
												size='lg'
												onClick={() => router.push('/auth-pages/sign-up')}>
												Sign Up
											</Button>
										</div>
									</div>
								</div>

								<LoginHeader isNewUser={singUpStatus} />

								<FormGroup
									id='loginUsername'
									isFloating
									label='Your email or username'
									className={classNames({
										'd-none': signInPassword,
									})}>
									<Input
										autoComplete='username'
										value={formik.values.loginUsername}
										isTouched={formik.touched.loginUsername}
										invalidFeedback={
											formik.errors.loginUsername
										}
										isValid={formik.isValid}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										onFocus={() => {
											formik.setErrors({});
										}}
									/>
								</FormGroup>
								{signInPassword && (
									<div className='text-center h4 mb-3 fw-bold'>
										Hi, {formik.values.loginUsername}.
									</div>
								)}
								<FormGroup
									id='loginPassword'
									isFloating
									label='Password'
									className={classNames({
										'd-none': !signInPassword,
									})}>
									<Input
										type='password'
										autoComplete='current-password'
										value={formik.values.loginPassword}
										isTouched={formik.touched.loginPassword}
										invalidFeedback={
											formik.errors.loginPassword
										}
										validFeedback='Looks good!'
										isValid={formik.isValid}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
									/>
								</FormGroup>
								<div className='col-12 mt-3'>
									{!signInPassword ? (
										<Button
											color='warning'
											className='w-100 py-3'
											isDisable={!formik.values.loginUsername}
											onClick={handleContinue}>
											{isLoading && (
												<Spinner isSmall inButton isGrow />
											)}
											Continue
										</Button>
									) : (
										<Button
											color='warning'
											className='w-100 py-3'
											onClick={formik.handleSubmit}>
											Login
										</Button>
									)}
								</div>

								{/* BEGIN :: Social Login */}
								{/* {!signInPassword && (
									<>
										<div className='col-12 mt-3 text-center text-muted'>
											OR
										</div>
										<div className='col-12 mt-3'>
											<Button
												isOutline
												color={darkModeStatus ? 'light' : 'dark'}
												className={classNames('w-100 py-3', {
													'border-light': !darkModeStatus,
													'border-dark': darkModeStatus,
												})}
												icon='CustomApple'
												onClick={handleOnClick}>
												Sign in with Apple
											</Button>
										</div>
										<div className='col-12'>
											<Button
												isOutline
												color={darkModeStatus ? 'light' : 'dark'}
												className={classNames('w-100 py-3', {
													'border-light': !darkModeStatus,
													'border-dark': darkModeStatus,
												})}
												icon='CustomGoogle'
												onClick={handleOnClick}>
												Continue with Google
											</Button>
										</div>
									</>
								)} */}
								{/* END :: Social Login */}
							</CardBody>
						</Card>
						<div className='text-center'>
							<Link
								href='/'
								className={classNames('text-decoration-none me-3', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Privacy policy
							</Link>
							<Link
								href='/'
								className={classNames('link-light text-decoration-none', {
									'link-light': singUpStatus,
									'link-dark': !singUpStatus,
								})}>
								Terms of use
							</Link>
						</div>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};
Login.propTypes = {
	isSignUp: PropTypes.bool,
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default Login;
