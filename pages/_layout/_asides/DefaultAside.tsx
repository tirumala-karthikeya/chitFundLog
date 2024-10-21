import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Brand from '../../../layout/Brand/Brand';
import Navigation, { NavigationLine,INavigationProps } from '../../../layout/Navigation/Navigation';
import User from '../../../layout/User/User';
import {
	componentPagesMenu,
	dashboardPagesMenu,
	demoPagesMenu,
	pageLayoutTypesPagesMenu,
} from '../../../menu';
import ThemeContext from '../../../context/themeContext';
import Card, { CardBody } from '../../../components/bootstrap/Card';

import Hand from '../../../assets/img/hand.png';
import Icon from '../../../components/icon/Icon';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';

const DefaultAside = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);
	const [doc, setDoc] = useState(false);
	const { t } = useTranslation(['common', 'menu']);
	const { darkModeStatus } = useDarkMode();

	const chitsMenu: NonNullable<INavigationProps['menu']> = {
		chits: {
			id: 'chits',
			text: t('menu:Chits'),
			icon: 'Chit', 
			path: '/chits',
			subMenu: {
				'create-chit': { id: 'create-chit', text: t('Create Chit'), path: '/createChit', icon: 'Add' },
				'view-chits': { id: 'view-chits', text: t('View All Chits'), path: '/viewsChit/allChits', icon: 'List' },
			},
		},
	};
	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
				<Navigation menu={dashboardPagesMenu} id='aside-dashboard' />
				<NavigationLine />
				
				{/* Update the Navigation component for Chits */}
				<Navigation menu={chitsMenu} id='aside-chits' />
				<NavigationLine />

				<Navigation menu={demoPagesMenu} id='aside-demo-pages' />
				<NavigationLine />
				<Navigation menu={pageLayoutTypesPagesMenu} id='aside-menu' />
					<NavigationLine />
				<Navigation menu={componentPagesMenu} id='aside-menu-two' />
				<NavigationLine />

				<Card className='m-3 '>
					<CardBody className='pt-0'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={Hand} alt='Hand' width={130} height={130} />
						<p
							className={classNames('h4', {
								'text-dark': !darkModeStatus,
								'text-light': darkModeStatus,
							})}>
							{t('Everything is ready!')}
						</p>
						<Button
							color='info'
							isLight
							className='w-100'
							onClick={() => setDoc(false)}>
							{t('Demo Pages')}
						</Button>
					</CardBody>
				</Card>
			</AsideHead>
			<AsideBody>
				<nav aria-label='aside-bottom-menu'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => setDoc(!doc)}
							data-tour='documentation'>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon
										icon={doc ? 'ToggleOn' : 'ToggleOff'}
										color={doc ? 'success' : undefined}
										className='navigation-icon'
									/>
									<span className='navigation-text'>
										{t('menu:Documentation')}
									</span>
								</span>
								<span className='navigation-link-extra'>
									<Icon
										icon='Circle'
										className={classNames(
											'navigation-notification',
											'text-success',
											'animate__animated animate__heartBeat animate__infinite animate__slower',
										)}
									/>
								</span>
							</span>
						</div>
					</div>
				</nav>
				<User />
			</AsideBody>
		</Aside>
	);
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		// @ts-ignore
		...(await serverSideTranslations(locale, ['common', 'menu'])),
	},
});

export default DefaultAside;
