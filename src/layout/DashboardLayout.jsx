import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { useAtomValue } from 'jotai';
import { sidebarAlignmentAtom } from '../data/states/appAtoms';
import { ITEM_ALIGNMENTS } from '../utils/constants/itemsAlignment';
import PageWrapper from '../components/PageWrapper';
import ConfirmationModal from '../components/common/ConfirmationModal';
import SidebarEnvironmentBadge from './components/Sidebar/components/SidebarEnvironmentBadge.jsx';

const DashboardLayout = () => {
	const sidebarAlignment = useAtomValue(sidebarAlignmentAtom);
	const isLeft = sidebarAlignment === ITEM_ALIGNMENTS.LEFT;

	return (
		<div className="flex h-screen flex-row bg-brand-gradient-deep">
			{isLeft && <Sidebar />}
			<div
				className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-background ${
					isLeft ? 'rounded-tl-3xl rounded-bl-3xl' : 'rounded-tr-3xl rounded-br-3xl'
				}`}
			>
				<Navbar isLeft={isLeft} />
				<main className="flex-1 bg-background text-foreground overflow-auto custom-scrollbar">
					<PageWrapper>
						<Outlet />
						<div className="flex justify-end px-4 pb-3 pt-6">
							<SidebarEnvironmentBadge isOpen />
						</div>
					</PageWrapper>
				</main>
			</div>
			{!isLeft && <Sidebar />}
			<ConfirmationModal />
		</div>
	);
};

export default DashboardLayout;
