import NotFound from '@/components/pages/errors/not-found';
import GetUser from '@/helper/GetUser';
import Users from './Users';
import Button from '@/components/base/button';
import TabContent, { Tab } from './TabContent';
import Comics from './Comics';

const TABS: Tab[] = [
	{
		hash: 'users',
		title: 'Users',
		component: <Users />,
	},
	{
		hash: 'comics',
		title: 'Comics',
		component: <Comics />,
	},
];

export default async function Admin() {
	const user = await GetUser();

	if (!user || !user.admin) {
		return <NotFound />;
	}

	return (
		<>
			<div className='mb-3 flex flex-row gap-2'>
				{TABS.map((element) => (
					<a key={element.hash} href={`#${element.hash}`}>
						<Button>{element.title}</Button>
					</a>
				))}
			</div>
			<TabContent tabs={TABS} />
		</>
	);
}
