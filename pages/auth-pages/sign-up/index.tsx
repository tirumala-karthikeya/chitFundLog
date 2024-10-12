import React, { FC, useCallback, useContext, useState } from 'react';
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

	const handleOnClick = useCallback(() => router.push('/'), [router]);

	const formik = useFormik({
		initialValues: {
			email: '',
			password: '',
			role: '',
		},
		validate: (values) => {
			const errors: { email?: string; password?: string; role?: string } = {};

			if (!values.email) {
				errors.email = 'Required';
			} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
				errors.email = 'Invalid email address';
			}

			if (!values.password) {
				errors.password = 'Required';
			}

			if (!values.role) {
				errors.role = 'Required';
			}

			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			setIsLoading(true);
			try {
				const response = await fetch('/api/auth/signup', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(values),
				});

				if (response.ok) {
					const data = await response.json();
					if (setUser) {
						setUser(data.email);
					}
					handleOnClick(); // Redirect to home page
				} else {
					// Handle error
					const errorData = await response.json();
					console.error('Signup failed:', errorData.error);
				}
			} catch (error) {
				console.error('Error during signup:', error);
				// Handle network errors or other unexpected issues
			} finally {
				setIsLoading(false);
			}
		},
	});

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
										<FormGroup id='email' isFloating label='Your email'>
											<Input
												type='email'
												autoComplete='email'
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.email}
												isValid={formik.touched.email && !formik.errors.email}
												isTouched={formik.touched.email}
												invalidFeedback={formik.errors.email}
												validFeedback='Looks good!'
											/>
										</FormGroup>
									</div>
									<div className='col-12'>
										<FormGroup id='password' isFloating label='Password'>
											<Input
												type='password'
												autoComplete='new-password'
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.password}
												isValid={formik.touched.password && !formik.errors.password}
												isTouched={formik.touched.password}
												invalidFeedback={formik.errors.password}
												validFeedback='Looks good!'
											/>
										</FormGroup>
									</div>
									<div className='col-12'>
										<FormGroup id='role' isFloating label='User Role'>
											<Select
												ariaLabel='User role'
												onChange={formik.handleChange}
												onBlur={formik.handleBlur}
												value={formik.values.role}
												isValid={formik.touched.role && !formik.errors.role}
												isTouched={formik.touched.role}
												invalidFeedback={formik.errors.role}>
												<Option value=''>Choose...</Option>
												<Option value='owner'>Owner</Option>
												<Option value='participant'>Participant</Option>
											</Select>
										</FormGroup>
									</div>
									<div className='col-12'>
										<Button
											color='info'
											className='w-100 py-3'
											type='submit'
											isDisable={isLoading || !formik.isValid}>
											{isLoading && <Spinner isSmall inButton isGrow />}
											Sign Up
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
