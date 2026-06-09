import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
			<div className="text-6xl font-extrabold text-slate-200 select-none mb-2">403</div>
			<h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
			<p className="text-slate-500 mb-6 max-w-sm">
				You don&apos;t have permission to view this page. Contact your administrator to request access.
			</p>
			<button
				onClick={() => navigate(-1)}
				className="px-5 py-2 rounded-lg bg-[#055185] hover:bg-[#003E68] text-white font-semibold text-sm transition"
			>
				Go Back
			</button>
		</div>
	);
};

export default Unauthorized;
