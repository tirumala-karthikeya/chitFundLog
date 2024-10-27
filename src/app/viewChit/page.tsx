'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation'; 
import "bootstrap/dist/css/bootstrap.min.css";

type Chit = {
	id: number;
	chit_name: string;
	chit_type: string;
	total_chit_value: number;
	commission_percentage: number;
	status: string;
	start_date: string;
	number_of_members: number;
};

const AllChits = () => {
	const [chits, setChits] = useState<Chit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter(); 

	useEffect(() => {
		const fetchChits = async () => {
			try {
				setIsLoading(true);
				const { data, error } = await supabase
					.from('chits')
					.select('id, chit_name, chit_type, total_chit_value, commission_percentage, status, start_date, number_of_members')
					.order('created_at', { ascending: false });

				if (error) throw error;
				setChits(data);
			} catch (err) {
				console.error('Error fetching chits:', err);
				setError('Error fetching chits');
			} finally {
				setIsLoading(false);
			}
		};

		fetchChits();
	}, []);

	const renderChitCard = (chit: Chit) => (
		<div key={chit.id} className="col-md-4 mb-4">
			<div className="card h-100 shadow-sm">
				<div className="card-body">
					<h5 className="card-title">{chit.chit_name}</h5>
					<p className="card-text">Chit Type: {chit.chit_type}</p>
					<p className="card-text">
						Total Chit Value: {chit.total_chit_value?.toFixed(2) ?? 'Not available'}
					</p>
					<p className="card-text">
						Commission: {chit.commission_percentage?.toFixed(2) ?? 'Not available'}%
					</p>
					<div className="d-flex justify-content-between">
						<span className="text-muted">Members</span>
						<span className="fw-bold">{chit.number_of_members}</span>
					</div>
					<div className="d-flex justify-content-between mt-2">
						<span className="text-muted">Start Date</span>
						<span className="fw-bold">
							{new Date(chit.start_date).toLocaleDateString()}
						</span>
					</div>
					<button
						className="btn btn-warning mt-3 w-100"
						onClick={() => router.push(`/viewChit/singleChit/${chit.id}`)}
					>
						View Chit
					</button>
				</div>
			</div>
		</div>
	);

	return (
		<div style={{ padding: '20px' }}>
			<h2>All Chits</h2>
			{isLoading ? (
				<p>Loading...</p>
			) : error ? (
				<p className='text-danger'>{error}</p>
			) : chits.length > 0 ? (
				<div className="row">
					{chits.map(renderChitCard)}
				</div>
			) : (
				<p>No chits found</p>
			)}
		</div>
	);
};

export default AllChits;
