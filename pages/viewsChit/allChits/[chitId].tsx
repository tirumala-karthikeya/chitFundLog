import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import Button from '../../../components/bootstrap/Button';
import { supabase } from '../../../lib/supabase';

interface Chit {
	id: number;
	chit_name: string;
	chit_type: string;
	auction_type: string;
	total_chit_value: number;
	contribution_amount: number;
	number_of_members: number;
	commission_percentage: number;
	start_date: string;
	duration: number;
	description: string;
	terms_and_conditions: string;
	status: string;
	created_at: string;
	updated_at: string;
}

const ChitDetails = () => {
	const router = useRouter();
	const { chitId } = router.query;
	const { t } = useTranslation(['common', 'chits']);
	const [chit, setChit] = useState<Chit | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedChit, setEditedChit] = useState<Chit | null>(null);

	useEffect(() => {
		const fetchChit = async () => {
			if (chitId) {
				const { data, error } = await supabase
					.from('chits')
					.select('*')
					.eq('id', chitId)
					.single();

				if (error) {
					console.error('Error fetching chit:', error);
				} else {
					setChit(data);
				}
			}
		};

		fetchChit();
	}, [chitId]);

	const handleEdit = () => {
		setIsEditing(true);
		setEditedChit(chit);
	};

	const handleSave = async () => {
		if (editedChit) {
			const updatedChit = {
				...editedChit,
				updated_at: new Date().toISOString()
			};

			const { data, error } = await supabase
				.from('chits')
				.update(updatedChit)
				.eq('id', chitId)
				.single();

			if (error) {
				console.error('Error updating chit:', error);
				setChit(editedChit);
			} else {
				setChit(updatedChit);
				setIsEditing(false);
			}
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setEditedChit(prev => prev ? { ...prev, [name]: value } : null);
	};

	if (!chit) {
		return <div>Loading...</div>;
	}

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
							{ title: 'Chits', to: '/chits' },
							{ title: 'All Chits', to: '/viewsChit/allChits' },
							{ title: chit.chit_name, to: `/viewsChit/allChits/${chit.id}` },
						]}
					/>
				</SubHeaderLeft>
			</SubHeader>
			<Page container='fluid'>
				<div className='row'>
					<div className='col-12'>
						<Card>
							<CardBody>
								<h2 className="mb-4">{chit.chit_name}</h2>
								{isEditing ? (
									<div className="edit-form">
										{Object.entries(chit).map(([key, value]) => (
											<div key={key} className="mb-3">
												<label htmlFor={key} className="form-label">{t(key)}: </label>
												<input
													type={typeof value === 'number' ? 'number' : 'text'}
													id={key}
													name={key}
													value={editedChit?.[key as keyof Chit] || ''}
													onChange={handleInputChange}
													className="form-control"
												/>
											</div>
										))}
										<div className="mt-4">
											<Button color='primary' onClick={handleSave} className="me-2">{t('Save')}</Button>
											<Button color='secondary' onClick={() => setIsEditing(false)}>{t('Cancel')}</Button>
										</div>
									</div>
								) : (
									<div className="view-details">
										{Object.entries(chit).map(([key, value]) => (
											<div key={key} className="mb-2">
												<strong>{t(key)}:</strong> {
													key === 'created_at' || key === 'updated_at'
														? new Date(value as string).toLocaleDateString()
														: value
												}
											</div>
										))}
										<div className="mt-4">
											<Button color='primary' onClick={handleEdit} className="me-2">{t('Edit')}</Button>
											<Link href="/viewsChit/allChits" className="btn btn-secondary">{t('Back to All Chits')}</Link>
										</div>
									</div>
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'chits'])),
	},
});

export default ChitDetails;
