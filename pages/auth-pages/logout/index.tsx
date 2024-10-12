import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../../../context/authContext';

const Logout = () => {
	const router = useRouter();
	const { logout } = useContext(AuthContext) as { logout?: () => Promise<void> };

	useEffect(() => {
		const performLogout = async () => {
			if (logout) {
				await logout();
				router.push('/auth-pages/login');
			} else {
				console.error('Logout function is undefined');
				router.push('/auth-pages/login');
			}
		};

		performLogout();
	}, [logout, router]);

	return null;
};

export default Logout;
