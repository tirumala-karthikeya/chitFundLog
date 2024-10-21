import React, { useCallback, useContext, useState } from 'react';
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
import PhoneVerification from '../PhoneVerification';

const LoginHeader: React.FC<{ isLogin: boolean }> = ({ isLogin }) => {
	return (
		<>
			<div className='text-center h1 fw-bold mt-5'>Welcome,</div>
			<div className='text-center h4 text-muted mb-5'>
				{isLogin ? 'Sign in' : 'Sign up'} with your phone number!
			</div>
		</>
	);
};

const Login: NextPage = () => {
	const router = useRouter();
	const { setUser } = useContext(AuthContext);
	const { darkModeStatus } = useDarkMode();
	const [isPhoneVerified, setIsPhoneVerified] = useState(false);
	const [isLogin, setIsLogin] = useState(true);
	const [selectedRole, setSelectedRole] = useState('user');

	const handleOnClick = useCallback(() => router.push('/'), [router]);

	const handlePhoneVerified = (phoneNumber: string) => {
		setIsPhoneVerified(true);
		formik.setFieldValue('phoneNumber', phoneNumber);
	};

	const formik = useFormik({
		initialValues: {
			phoneNumber: '',
		},
		validate: (values) => {
			const errors: { phoneNumber?: string } = {};
			if (!values.phoneNumber) {
				errors.phoneNumber = 'Required';
			}
			return errors;
		},
		validateOnChange: false,
		onSubmit: async (values) => {
			if (isPhoneVerified) {
				if (setUser) {
					setUser(values.phoneNumber);
				}
				handleOnClick();
			} else {
				formik.setFieldError('phoneNumber', 'Phone verification required.');
			}
		},
	});

	return (
		<PageWrapper isProtected={false} className='bg-light'>
			<Head>
				<title>Login</title>
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
												className='rounded-1 w-100'
												size='lg'
												onClick={() => router.push('/auth-pages/login')}>
												Login
											</Button>
										</div>
										<div className='col'>
											<Button
												color={darkModeStatus ? 'light' : 'dark'}
												isLight
												className='rounded-1 w-100'
												size='lg'
												onClick={() => router.push('/auth-pages/sign-up')}>
												Sign Up
											</Button>
										</div>
									</div>
								</div>

								
								<div className='text-center mt-3'>
									<h3>Login to Chit Fund Log</h3>
								</div>
								<form className='row g-4 mt-3'>
									<div className='col-12'>
										{!isPhoneVerified ? (
											<PhoneVerification 
												onVerified={handlePhoneVerified} 
												selectedRole={selectedRole}
											/>
										) : (
											<FormGroup id='phoneNumber' isFloating label='Phone Number'>
												<Input
													type='tel'
													readOnly
													value={formik.values.phoneNumber}
												/>
											</FormGroup>
										)}
									</div>
									<div className='col-12'>
										<Button
											color='warning'
											className='w-100 py-3'
											onClick={formik.handleSubmit}
											isDisable={!isPhoneVerified}>
											{isLogin ? 'Login' : 'Sign Up'}
										</Button>
									</div>
								</form>
							</CardBody>
						</Card>
						<div className='text-center'>
							<Link
								href='/'
								className='text-decoration-none me-3 link-dark'>
								Privacy policy
							</Link>
							<Link
								href='/'
								className='link-dark text-decoration-none'>
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

export default Login;
