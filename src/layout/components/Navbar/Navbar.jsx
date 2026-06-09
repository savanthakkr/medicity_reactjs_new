import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronDown from '../../../assets/icons/ChevronDown.jsx';
import ChevronRight from '../../../assets/icons/ChevronRight.jsx';
import UserRoundIcon from '../../../assets/icons/UserRoundIcon.jsx';
import LogoutIcon from '../../../assets/icons/LogoutIcon.jsx';
import TextSizeIcon from '../../../assets/icons/TextSizeIcon.jsx';
import { useAtom, useSetAtom } from 'jotai';
import { fontSizeAtom } from '../../../data/states/appAtoms.js';
import { permissionsAtom } from '../../../data/states/permissionsAtom.js';
import { myPermissionsApi } from '../../../data/apis';
import ThemeToggle from './components/ThemeToggle.jsx';
import ROUTES from '../../../utils/constants/routes';
import { getDataInBrowser } from '../../../utils/methods/DataInBrowser';
import { BROWSER_STORAGE_KEYS } from '../../../utils/constants/browserStorageKeys';
import AutoComplete from '../../../components/dropdown/AutoComplete.jsx';
import Tooltip from '@/components/dropdown/Tooltip.jsx';
import { themeAtom } from '../../../data/states/appAtoms.js';
import CustomSelect from '../../../components/dropdown/Select.jsx';
import { SIDEBAR_ITEMS } from '../Sidebar/components/sidebarConfig.js';

const FONT_SIZE_OPTIONS = ['small', 'medium', 'large'];
const IS_DEV = import.meta.env.DEV;

const formatLabel = value => value.charAt(0).toUpperCase() + value.slice(1);

const Navbar = () => {
	const [fontSize = 'medium', setFontSize] = useAtom(fontSizeAtom);
	const setPermissions = useSetAtom(permissionsAtom);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const profileRef = useRef(null);
	const navigate = useNavigate();

	const authUser = getDataInBrowser(BROWSER_STORAGE_KEYS.authUser);

	const userName = authUser?.name || authUser?.user?.name || 'System Provider';
	const initials =
		userName
			.split(' ')
			.map(namePart => namePart[0])
			.join('')
			.substring(0, 2)
			.toUpperCase() || 'SP';

	const navigationOptions = SIDEBAR_ITEMS.flatMap(item =>
		item.children
			? item.children.map(child => ({
					label: child.name,
					value: child.path
				}))
			: []
	).sort((firstOption, secondOption) => firstOption.label.localeCompare(secondOption.label));

	useEffect(() => {
		const token = getDataInBrowser(BROWSER_STORAGE_KEYS.authToken);
		if (!token) {
			setPermissions(null);
			return;
		}

		let isMounted = true;

		const loadPermissions = async () => {
			try {
				const res = await myPermissionsApi();
				const permData = res?.data ?? res;

				if (!isMounted || !permData) return;

				setPermissions({
					isSuperAdmin: permData?.is_super_admin ?? false,
					urls: Array.isArray(permData?.urls) ? permData.urls : [],
					keys: Array.isArray(permData?.keys) ? permData.keys : []
				});
			} catch (error) {
				if (!isMounted) return;

				if (IS_DEV) {
					console.warn('[Navbar] permission refresh failed', error);
				}
			}
		};

		loadPermissions();

		return () => {
			isMounted = false;
		};
	}, [setPermissions]);

	useEffect(() => {
		const handleClickOutside = event => {
			if (profileRef.current && !profileRef.current.contains(event.target)) {
				setIsProfileOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const [theme] = useAtom(themeAtom);
	const isDark = theme === 'dark';

	const handleFontSizeChange = event => {
		const nextSize = event.target.value;
		setFontSize(nextSize);
	};

	const handleLogout = () => {
		setPermissions(null);
		localStorage.clear();
		sessionStorage.clear();
		location.href = ROUTES.LOGIN;
	};

	const handleProfile = () => {
		navigate(ROUTES.EMPLOYEE_PROFILE);
		setIsProfileOpen(false);
	};

	return (
		<nav className="flex h-16 items-center justify-between border-b border-divider bg-background px-6">
			<div className="relative w-[276px]">
				<AutoComplete
					options={navigationOptions}
					placeholder="Navigation to"
					onChange={(event, value) => {
						if (value?.value) {
							navigate(value.value);
						}
					}}
				/>
			</div>

			<div className="flex items-center gap-5">
				<div className="flex items-center gap-1">
					<TextSizeIcon className="h-4 w-4" />
					<Tooltip describeChild title="Text size" open={tooltipOpen}>
						<div
							className="relative flex items-center"
							onMouseEnter={() => setTooltipOpen(true)}
							onMouseLeave={() => setTooltipOpen(false)}
						>
							<CustomSelect
								value={fontSize}
								onClick={() => setTooltipOpen(false)}
								onFocus={() => setTooltipOpen(false)}
								onChange={handleFontSizeChange}
								options={FONT_SIZE_OPTIONS.map(size => ({
									value: size,
									label: formatLabel(size)
								}))}
								minWidth={110}
								aria-label="Choose app font size"
							/>
						</div>
					</Tooltip>

					<Tooltip describeChild title={isDark ? 'Convert Light mode' : 'Convert Dark mode'}>
						<div className="flex">
							<ThemeToggle />
						</div>
					</Tooltip>
				</div>

				<div className="relative" ref={profileRef}>
					<button
						onClick={() => setIsProfileOpen(!isProfileOpen)}
						className="flex items-center gap-2 focus:outline-none"
					>
						<div className="relative flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full border-[3px] !border-[#0B5B93] bg-[#0B5B93]">
							<div className="absolute inset-[0px] rounded-full border-[2px] !border-[#3591D0]" />

							<span className="relative text-p1 font-medium tracking-wide text-white">{initials}</span>
						</div>
						<span className="text-text-2">
							<ChevronDown />
						</span>
					</button>

					{isProfileOpen && (
						<div className="absolute right-0 top-[calc(100%+14px)] z-50 w-48 rounded-[12px] border border-divider bg-card shadow-lg">
							<div className="absolute -top-[7px] right-[2.3rem] h-3.5 w-3.5 rotate-45 border-l border-t border-divider bg-card"></div>

							<div className="relative z-10 flex flex-col py-2">
								<button
									onClick={handleProfile}
									className="flex items-center justify-between px-4 py-2.5 text-h5 font-medium text-text-1 transition-colors hover:bg-field"
								>
									<div className="flex items-center gap-3">
										<UserRoundIcon className="h-4 w-4" />
										<span>My Profile</span>
									</div>
									<ChevronRight className="h-3.5 w-3.5 text-text-3" />
								</button>
								<button
									onClick={handleLogout}
									className="flex items-center justify-between px-4 py-2.5 text-h5 font-medium text-text-1 transition-colors hover:bg-field"
								>
									<div className="flex items-center gap-3">
										<LogoutIcon className="h-4 w-4" />
										<span>Logout</span>
									</div>
									<ChevronRight className="h-3.5 w-3.5 text-text-3" />
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
