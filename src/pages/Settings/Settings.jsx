import { useAtom } from 'jotai';
import { LineBreaker } from '../../components/LineBreaker';
import { AlignmentOption } from './components/AlignmentOption';
import { ITEM_ALIGNMENTS } from '../../utils/constants/itemsAlignment';
import MenuIcon from '../../assets/icons/MenuIcon';
import MoonIcon from '../../assets/icons/MoonIcon';
import FastForward from '../../assets/icons/FastForward';
import { THEME_OPTIONS } from '../../utils/constants/themeOptions';
import { languageAtom, navItemsAlignmentAtom, sidebarAlignmentAtom, themeAtom } from '../../data/states/appAtoms';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_OPTIONS, LANGUAGE_LABELS } from '../../utils/constants/languageOptions';
import ChevronDown from '../../assets/icons/ChevronDown';
import Globe from '../../assets/icons/Globe';

export default function Settings() {
	const { t, i18n } = useTranslation('settings');

	const [sidebarAlignment, setSidebarAlignment] = useAtom(sidebarAlignmentAtom);
	const [navitemAlignments, setNavitemAlignments] = useAtom(navItemsAlignmentAtom);
	const [theme, setTheme] = useAtom(themeAtom);
	const [language, setLanguage] = useAtom(languageAtom);

	const handleSidebarChange = alignment => {
		setSidebarAlignment(alignment);
	};

	const handleNavitemChange = alignment => {
		setNavitemAlignments(alignment);
	};

	const handleThemeChange = selectedTheme => {
		setTheme(selectedTheme);
	};

	const handleLanguageChange = selectedLanguage => {
		setLanguage(selectedLanguage);
		i18n.changeLanguage(selectedLanguage);
	};

	return (
		<>
			{t('learn')}
			<h1 className="text-3xl font-bold text-card-foreground mb-2">{t('settings')}</h1>
			<p className="text-muted-foreground mb-8">{t('settingsSubtitle')}</p>

			{/* Preview Section */}
			<div className="p-6 bg-background rounded-lg">
				<h3 className="text-lg font-medium text-card-foreground mb-4">{t('preview')}</h3>
				<div className="flex items-center space-x-4 text-sm text-muted-foreground">
					<div className="flex items-center space-x-2">
						<div className="w-3 h-3 bg-blue-500 rounded"></div>
						<span>
							{t('sidebarLabel')} <strong className="text-card-foreground">{sidebarAlignment}</strong>
						</span>
					</div>
					<div className="flex items-center space-x-2">
						<div className="w-3 h-3 bg-green-500 rounded"></div>
						<span>
							{t('navigationLabel')} <strong className="text-card-foreground">{navitemAlignments}</strong>
						</span>
					</div>
					<div className="flex items-center space-x-2">
						<div className="w-3 h-3 bg-purple-500 rounded"></div>
						<span>
							{t('themeLabel')} <strong className="text-card-foreground">{theme}</strong>
						</span>
					</div>
				</div>
			</div>
			<LineBreaker />

			<div className="space-y-8">
				{/* Language Switcher Section */}
				<div>
					<div className="flex items-center space-x-3 mb-6">
						<div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
							<Globe />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-card-foreground">{t('languageTitle')}</h2>
							<p className="text-muted-foreground">{t('languageDescription')}</p>
						</div>
					</div>

					<div className="relative">
						<select
							value={language}
							onChange={e => handleLanguageChange(e.target.value)}
							className="appearance-none w-full px-4 py-3 pr-10 rounded-lg border border-border bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
						>
							{Object.entries(LANGUAGE_OPTIONS).map(([key, value]) => (
								<option key={value} value={value}>
									{LANGUAGE_LABELS[value]}
								</option>
							))}
						</select>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
							<ChevronDown />
						</div>
					</div>
				</div>

				{/* Theme Section */}
				<div>
					<div className="flex items-center space-x-3 mb-6">
						<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
							<MoonIcon />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-card-foreground">{t('themeTitle')}</h2>
							<p className="text-muted-foreground">{t('themeDescription')}</p>
						</div>
					</div>

					<div className="grid gap-3">
						<AlignmentOption
							label="theme"
							value={THEME_OPTIONS.LIGHT}
							currentValue={theme}
							onChange={handleThemeChange}
							description={t('lightThemeDescription')}
						/>
						<AlignmentOption
							label="theme"
							value={THEME_OPTIONS.DARK}
							currentValue={theme}
							onChange={handleThemeChange}
							description={t('darkThemeDescription')}
						/>
					</div>
				</div>

				{/* Sidebar Alignment Section */}
				<div>
					<div className="flex items-center space-x-3 mb-6">
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<MenuIcon className="w-6 h-6 text-blue-500" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-card-foreground">{t('sidebarAlignmentTitle')}</h2>
							<p className="text-muted-foreground">{t('sidebarAlignmentDescription')}</p>
						</div>
					</div>

					<div className="grid gap-3">
						<AlignmentOption
							label="sidebar"
							value={ITEM_ALIGNMENTS.LEFT}
							currentValue={sidebarAlignment}
							onChange={handleSidebarChange}
							description={t('leftSidebarDescription')}
						/>
						<AlignmentOption
							label="sidebar"
							value={ITEM_ALIGNMENTS.RIGHT}
							currentValue={sidebarAlignment}
							onChange={handleSidebarChange}
							description={t('rightSidebarDescription')}
						/>
					</div>
				</div>

				{/* Navigation Items Alignment Section */}
				<div>
					<div className="flex items-center space-x-3 mb-6">
						<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<FastForward />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-card-foreground">{t('navbarAlignmentTitle')}</h2>
							<p className="text-muted-foreground">{t('navbarAlignmentDescription')}</p>
						</div>
					</div>

					<div className="grid gap-3">
						<AlignmentOption
							label="navitem"
							value={ITEM_ALIGNMENTS.LEFT}
							currentValue={navitemAlignments}
							onChange={handleNavitemChange}
							description={t('leftNavItemsDescription')}
						/>
						<AlignmentOption
							label="navitem"
							value={ITEM_ALIGNMENTS.RIGHT}
							currentValue={navitemAlignments}
							onChange={handleNavitemChange}
							description={t('rightNavItemsDescription')}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
