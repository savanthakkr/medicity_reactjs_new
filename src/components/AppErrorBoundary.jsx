import React from 'react';
import ROUTES from '../utils/constants/routes';

class AppErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Unhandled React error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-[#EBF1F7] px-6">
					<div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
						<h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
						<p className="mt-2 text-slate-600">
							The page crashed unexpectedly. You can reload or go back to the dashboard.
						</p>
						<div className="mt-6 flex gap-3">
							<button
								type="button"
								onClick={() => window.location.reload()}
								className="rounded-lg bg-[#055185] px-4 py-2 text-white"
							>
								Reload
							</button>
							<a href={ROUTES.ROOT} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700">
								Go to Dashboard
							</a>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default AppErrorBoundary;
