import React, { useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useFormik } from 'formik';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import Page from '../../layout/Page/Page';
import Card, { CardBody, CardHeader, CardTitle } from '../../components/bootstrap/Card';
import Wizard, { WizardItem } from '../../components/Wizard';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import Select from '../../components/bootstrap/forms/Select';
import Textarea from '../../components/bootstrap/forms/Textarea';
import Button from '../../components/bootstrap/Button';
import { supabase } from '../../lib/supabase';

interface FormValues {
  chitName: string;
  chitType: 'Commission-Based' | 'Fixed';
  auctionType: string;
  totalChitValue: number;
  startDate: string;
  endDate: Date | string;
  numberOfMembers: number;
  contributionAmount: number;
  duration: number;
  description?: string;
  termsAndConditions: string;
  commissionPercentage?: number;
  status: 'published' | 'draft';
}

const CreateChit: NextPage = () => {
	const [activeStep, setActiveStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [inviteEmail, setInviteEmail] = useState('');
	const [invitedUsers, setInvitedUsers] = useState<string[]>([]);

	const handleInviteUser = () => {
		if (inviteEmail && !invitedUsers.includes(inviteEmail)) {
			setInvitedUsers([...invitedUsers, inviteEmail]);
			setInviteEmail('');
			// Here you would typically send an invitation email
			// This is just a placeholder for the actual email sending logic
			console.log(`Invitation sent to ${inviteEmail}`);
		}
	};

	const formik = useFormik({
		initialValues: {
			chitName: '',
			chitType: 'Commission-Based',
			auctionType: '',
			totalChitValue: 0,
			contributionAmount: 0,
			numberOfMembers: 0,
			commissionPercentage: 0,
			description: '',
			termsAndConditions: '',
			startDate: '',
			endDate: '',
			duration: 0,
			status: 'published',
		},
		onSubmit: async (values: FormValues, { resetForm }: { resetForm: () => void }) => {
			setIsLoading(true);
			setError(null);

			try {
				const { data, error } = await supabase
					.from('chits')
					.insert([
						{
							chit_name: values.chitName,
							chit_type: values.chitType,
							auction_type: values.auctionType,
							total_chit_value: values.totalChitValue,
							contribution_amount: values.contributionAmount,
							number_of_members: values.numberOfMembers,
							commission_percentage: values.chitType === 'Commission-Based' ? values.commissionPercentage : null,
							start_date: values.startDate,
							duration: values.duration,
							description: values.description,
							terms_and_conditions: values.termsAndConditions,
							status: values.status, // This will be either 'published' or 'draft'
						}
					]);

				if (error) throw error;

				console.log('Chit created successfully:', data);
				resetForm();
				// You might want to show a success message or redirect the user here
			} catch (error) {
				console.error('Error creating chit:', error);
				setError('Failed to create chit. Please try again.');
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<PageWrapper>
			<Head>
				<title>Create Chit</title>
			</Head>
			<SubHeader>
				<SubHeaderLeft>
					<h2>Create Chit</h2>
				</SubHeaderLeft>
			</SubHeader>
			<Page container='fluid'>
				<Card className='mb-0 h-100 min-vh-100'>
					<CardHeader>
						<CardTitle>Create New Chit</CardTitle>
					</CardHeader>
					<CardBody className='h-100'>
						<Wizard
							isHeader
							color='info'
							onSubmit={formik.handleSubmit}
							className='shadow-3d-info h-100'
							stretch>
							<WizardItem id='step1' title='Chit Details'>
								<Card className='h-100'>
									<CardBody>
										<div className='row g-4'>
											<div className='col-lg-6'>
												{/* First column of form fields */}
												<FormGroup id='chitName' label='Chit Name' className='mb-4'>
													<Input
														onChange={formik.handleChange}
														value={formik.values.chitName}
														className='form-control-lg'
													/>
												</FormGroup>
												<FormGroup id='chitType' label='Chit Type' className='mb-4'>
													<Select
														ariaLabel="Select Chit Type"
														onChange={formik.handleChange}
														value={formik.values.chitType}
														className='form-select-lg'>
														<option value=''>Select Chit Type</option>
														<option value='Commission-Based'>Commission-Based</option>
														<option value='Owner-Based'>Owner-Based</option>
													</Select>
												</FormGroup>
												<FormGroup id='auctionType' label='Auction Type' className='mb-4'>
													<Select
														ariaLabel='Select Auction Type'
														onChange={formik.handleChange}
														value={formik.values.auctionType}
														className='form-select-lg'>
														<option value=''>Select Auction Type</option>
														<option value='Online'>Online</option>
														<option value='Offline'>Offline</option>
													</Select>
												</FormGroup>
												<FormGroup id='totalChitValue' label='Total Chit Value' className='mb-4'>
													<Input
														type='number'
														onChange={formik.handleChange}
														value={formik.values.totalChitValue}
														className='form-control-lg'
													/>
												</FormGroup>
												<FormGroup id='contributionAmount' label='Contribution Amount' className='mb-4'>
													<Input
														type='number'
														onChange={formik.handleChange}
														value={formik.values.contributionAmount}
														className='form-control-lg'
													/>
												</FormGroup>
											</div>
											<div className='col-lg-6'>
												{/* Second column of form fields */}
												<FormGroup id='numberOfMembers' label='Number of Members' className='mb-4'>
													<Input
														type='number'
														onChange={formik.handleChange}
														value={formik.values.numberOfMembers}
														className='form-control-lg'
													/>
												</FormGroup>
												{formik.values.chitType === 'Commission-Based' && (
													<FormGroup id='commissionPercentage' label='Commission Percentage' className='mb-4'>
														<Input
															type='number'
															onChange={formik.handleChange}
															value={formik.values.commissionPercentage}
															className='form-control-lg'
														/>
													</FormGroup>
												)}
												<FormGroup id='description' label='Description' className='mb-4'>
													<Textarea
														onChange={formik.handleChange}
														value={formik.values.description}
														className='form-control-lg'
														rows={4}
													/>
												</FormGroup>
												<FormGroup id='termsAndConditions' label='Terms and Conditions' className='mb-4'>
													<Textarea
														onChange={formik.handleChange}
														value={formik.values.termsAndConditions}
														className='form-control-lg'
														rows={4}
													/>
												</FormGroup>
												<FormGroup id='startDate' label='Start Date' className='mb-4'>
													<Input
														type='date'
														onChange={formik.handleChange}
														value={formik.values.startDate}
														className='form-control-lg'
													/>
												</FormGroup>
												<FormGroup id='duration' label='Duration (Months)' className='mb-4'>
													<Input
														type='number'
														onChange={formik.handleChange}
														value={formik.values.duration}
														className='form-control-lg'
													/>
												</FormGroup>
											</div>
										</div>
									</CardBody>
								</Card>
							</WizardItem>
							<WizardItem id='step2' title='Invite Users'>
								<Card>
									<CardBody>
										<h4 className='mb-4'>Invite Users to Join the Chit</h4>
										<div className='row g-4'>
											<div className='col-lg-6'>
												<FormGroup id='inviteEmail' label='Email Address' className='mb-4'>
													<Input
														type='email'
														value={inviteEmail}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
														className='form-control-lg'
														placeholder='Enter email address'
													/>
												</FormGroup>
												<Button
													color='primary'
													onClick={handleInviteUser}
													isDisable={!inviteEmail}
												>
													Invite User
												</Button>
											</div>
											<div className='col-lg-6'>
												<h5>Invited Users:</h5>
												{invitedUsers.length > 0 ? (
													<ul className='list-group'>
														{invitedUsers.map((email, index) => (
															<li key={index} className='list-group-item'>
																{email}
																<Button
																	color='danger'
																	size='sm'
																	className='float-end'
																	onClick={() => setInvitedUsers(invitedUsers.filter(e => e !== email))}
																>
																	Remove
																</Button>
															</li>
														))}
													</ul>
												) : (
													<p>No users invited yet.</p>
												)}
											</div>
										</div>
									</CardBody>
								</Card>
							</WizardItem>
							<WizardItem id='step3' title='Review and Publish'>
								<Card>
									<CardBody>
										<h4 className='mb-4'>Review Chit Details</h4>
										<div className='row g-4'>
											<div className='col-lg-6'>
												<dl className='row'>
													<dt className='col-sm-5'>Chit Name:</dt>
													<dd className='col-sm-7'>{formik.values.chitName}</dd>
													
													<dt className='col-sm-5'>Chit Type:</dt>
													<dd className='col-sm-7'>{formik.values.chitType}</dd>
													
													<dt className='col-sm-5'>Auction Type:</dt>
													<dd className='col-sm-7'>{formik.values.auctionType}</dd>
													
													<dt className='col-sm-5'>Total Chit Value:</dt>
													<dd className='col-sm-7'>{formik.values.totalChitValue}</dd>
													
													<dt className='col-sm-5'>Contribution Amount:</dt>
													<dd className='col-sm-7'>{formik.values.contributionAmount}</dd>
													
													<dt className='col-sm-5'>Number of Members:</dt>
													<dd className='col-sm-7'>{formik.values.numberOfMembers}</dd>
												</dl>
											</div>
											<div className='col-lg-6'>
												<dl className='row'>
													{formik.values.chitType === 'Commission-Based' && (
														<>
															<dt className='col-sm-5'>Commission Percentage:</dt>
															<dd className='col-sm-7'>{formik.values.commissionPercentage}%</dd>
														</>
													)}
													<dt className='col-sm-5'>Start Date:</dt>
													<dd className='col-sm-7'>{formik.values.startDate}</dd>
													
													<dt className='col-sm-5'>Duration:</dt>
													<dd className='col-sm-7'>{formik.values.duration} months</dd>
													
													<dt className='col-sm-5'>Description:</dt>
													<dd className='col-sm-7'>{formik.values.description}</dd>
													
													<dt className='col-sm-5'>Terms and Conditions:</dt>
													<dd className='col-sm-7'>{formik.values.termsAndConditions}</dd>
												</dl>
											</div>
										</div>
										<div className='mt-5 text-center'>
											{error && <div className="text-danger mb-3">{error}</div>}
											<Button
												color='info'
												type='button'
												size='lg'
												className='me-3'
												onClick={() => {
													formik.setFieldValue('status', 'published');
													formik.submitForm();
												}}
												isDisable={isLoading}
											>
												{isLoading ? 'Publishing...' : 'Publish Chit'}
											</Button>
											<Button
												color='primary'
												size='lg'
												type='button'
												onClick={() => {
													formik.setFieldValue('status', 'draft');
													formik.submitForm();
												}}
												isDisable={isLoading}
											>
												{isLoading ? 'Saving...' : 'Save as Draft'}
											</Button>
										</div>
									</CardBody>
								</Card>
							</WizardItem>
						</Wizard>
					</CardBody>
				</Card>
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

export default CreateChit;
