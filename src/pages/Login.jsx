import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import ROUTES from '../utils/constants/routes';
import { loginApi, myPermissionsApi } from '../data/apis';
import { BROWSER_STORAGE_KEYS } from '../utils/constants/browserStorageKeys';
import { setDataInBrowser } from '../utils/methods/DataInBrowser';
import { permissionsAtom } from '../data/states/permissionsAtom';
import MailIcon from '../assets/icons/MailIcon.jsx';
import LockIcon from '../assets/icons/LockIcon.jsx';
import EyeIcon from '../assets/icons/EyeIcon.jsx';
import EyeOffIcon from '../assets/icons/EyeOffIcon.jsx';

const Login = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const setPermissions = useSetAtom(permissionsAtom);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPwd, setShowPwd] = useState(false);
	const [error, setError] = useState('');
	const [sessionMsg, setSessionMsg] = useState('');
	const [loading, setLoading] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	// Show reason if redirected due to deactivation / session expiry
	useEffect(() => {
		const reason = searchParams.get('reason');
		if (reason) setSessionMsg(decodeURIComponent(reason));
	}, [searchParams]);

	const handleSubmit = async e => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const res = await loginApi({
				user_Email: email,
				user_Password: password
			});

			// Support both response shapes:
			// 1) { status, msg, data: { token, user } }
			// 2) { data: { token, user } } / { token, user }
			const loginData = res?.data?.data ?? res?.data ?? res;
			const token = loginData?.token;
			const user = loginData?.user ?? null;

			if (!token) {
				throw { data: { message: 'Login failed: token missing in response' } };
			}

			setDataInBrowser(BROWSER_STORAGE_KEYS.authToken, token, Number.MAX_SAFE_INTEGER, rememberMe);
			setDataInBrowser(BROWSER_STORAGE_KEYS.authUser, user, Number.MAX_SAFE_INTEGER, rememberMe);

			// Fetch and store the user's permissions (token is now in storage so axios will attach it)
			try {
				const permRes = await myPermissionsApi();
				// http.post already returns response.data, so permRes = { status, msg, data: { is_super_admin, urls } }
				const permData = permRes?.data ?? permRes;
				console.log('[Login] permissions response:', permData);
				setPermissions({
					isSuperAdmin: permData?.is_super_admin ?? false,
					urls: Array.isArray(permData?.urls) ? permData.urls : [],
					keys: Array.isArray(permData?.keys) ? permData.keys : []
				});
			} catch (permErr) {
				// Non-fatal — leave permissions as null so the safe fallback applies
				console.warn('[Login] could not load permissions:', permErr);
			}

			// Authorization header is attached automatically from storage by the axios interceptor.
			// The success toast is raised centrally by the axios response interceptor.
			navigate(ROUTES.ROOT);
		} catch (err) {
			console.log(err);

			setError(err?.data?.message || err?.data?.msg || err?.message || 'Invalid email or password');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex bg-[#EBF1F7]">
			{/* Left brand panel */}
			<div className="hidden lg:flex flex-col justify-between flex-1 bg-[#002F50] text-white p-12 relative overflow-hidden">
				<div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10" />
				<div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-cyan-400/10" />

				<div className="flex items-center gap-3 relative">
					<img src="/logo.png" alt="Medicity" className="h-12 w-auto" />
				</div>

				<div className="relative">
					<h1 className="text-4xl font-extrabold leading-tight mb-4">
						Welcome to <span className="text-cyan-400">Medicity</span>
					</h1>
					<p className="text-slate-300 text-base max-w-md">
						Speciality Laboratory management — sign in to manage patients, bookings, reports, franchises and employees
						from one dashboard.
					</p>
				</div>

				<div className="text-xs text-slate-400 relative">
					{'©'} {new Date().getFullYear()} Medicity Speciality Laboratory
				</div>
			</div>

			{/* Right form panel */}
			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
					<div className="flex lg:hidden justify-center mb-6">
						<img src="/medicity-login-logo.png" alt="Medicity" className="h-10 w-auto" />
					</div>

					<h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
					<p className="text-sm text-slate-500 mt-1 mb-6">Enter your credentials to access your dashboard.</p>

					{sessionMsg && (
						<div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
							<svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
									clipRule="evenodd"
								/>
							</svg>
							<span>{sessionMsg}</span>
						</div>
					)}
					{error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">{error}</div>}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1.5">Email or Username</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
									<MailIcon />
								</span>
								<input
									type="text"
									required
									value={email}
									onChange={e => setEmail(e.target.value)}
									placeholder="you@medicity.com or your username"
									className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-sm"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
									<LockIcon />
								</span>
								<input
									type={showPwd ? 'text' : 'password'}
									required
									value={password}
									onChange={e => setPassword(e.target.value)}
									placeholder="Enter password"
									className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowPwd(p => !p)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
									aria-label={showPwd ? 'Hide password' : 'Show password'}
								>
									{showPwd ? <EyeIcon /> : <EyeOffIcon />}
									{/* {showPwd ? <EyeIcon /> : <EyeOffIcon />} */}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="flex items-center gap-2 text-slate-600">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={e => setRememberMe(e.target.checked)}
									className="rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
								/>
								Remember me
							</label>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full py-2.5 rounded-lg bg-[#055185] hover:bg-[#003E68] text-white font-semibold shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{loading ? 'Signing in...' : 'Sign in'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
