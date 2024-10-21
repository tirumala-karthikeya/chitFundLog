import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Breadcrumb from '../../../components/bootstrap/Breadcrumb';
import { supabase } from '../../../lib/supabase';

interface Chit {
	id: number;
	chit_name: string;
	chit_type: string;
	total_chit_value: number;
	commission_percentage: number;
}

const AllChits = () => {
	const { t } = useTranslation(['common', 'chits']);
	const [chits, setChits] = useState<Chit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchChits = async () => {
			try {
				setIsLoading(true);
				const { data, error } = await supabase
					.from('chits')
					.select('id, chit_name, chit_type, total_chit_value, commission_percentage')
					.order('created_at', { ascending: false });

				if (error) throw error;
				setChits(data);
			} catch (err) {
				console.error('Error fetching chits:', err);
				setError(t('chits:Error fetching chits'));
			} finally {
				setIsLoading(false);
			}
		};

		fetchChits();
	}, [t]);

	const renderChitCard = (chit: Chit) => (
		<div key={chit.id} className='col-12 col-md-6 col-lg-4'>
			<Link href={`/viewsChit/allChits/${chit.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
				<Card>
					<CardBody>
						<h5>{chit.chit_name}</h5>
						<p>{t('Chit Type')}: {chit.chit_type}</p>
						<p>{t('Total Chit Value')}: {chit.total_chit_value?.toFixed(2) ?? t('Not available')}</p>
						<p>{t('Commission Percentage')}: {chit.commission_percentage?.toFixed(2) ?? t('Not available')}%</p>
					</CardBody>
				</Card>
			</Link>
		</div>
	);

	return (
		<PageWrapper>
			<SubHeader>
				<SubHeaderLeft>
					<Breadcrumb
						list={[
								{ title: t('Chits'), to: '/chits' },
								{ title: t('All Chits'), to: '/viewsChit/allChits' },
						]}
					/>
				</SubHeaderLeft>
			</SubHeader>
			<Page container='fluid'>
				<div className='row'>
					<div className='col-12'>
						<Card>
							<CardBody>
								<h2>{t('All Chits')}</h2>
								{isLoading ? (
									<p>{t('common:Loading...')}</p>
								) : error ? (
									<p className="text-danger">{error}</p>
								) : chits.length > 0 ? (
									<div className='row g-4'>
										{chits.map(renderChitCard)}
									</div>
								) : (
									<p>{t('No chits found')}</p>
								)}
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'chits'])),
	},
});

export default AllChits;
