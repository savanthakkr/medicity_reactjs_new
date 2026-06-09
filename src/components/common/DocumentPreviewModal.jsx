import React from 'react';

const DocumentPreviewModal = ({ open, file, fileDataUrl, label, onClose }) => {
	const resolveUrl = url => {
		if (!url) return '';
		if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
			return url;
		}
		const apiBase = import.meta.env.VITE_API_BASE_URL || '';
		const serverRoot = apiBase.replace(/\/api\/?$/, '');
		const cleanPath = url.startsWith('/') ? url : `/${url}`;
		return `${serverRoot}${cleanPath}`;
	};

	const finalPreviewUrl = resolveUrl(fileDataUrl);

	if (!open || !finalPreviewUrl) return null;

	const isPdf =
		file?.type === 'application/pdf' ||
		file?.name?.toLowerCase().endsWith('.pdf') ||
		finalPreviewUrl.toLowerCase().split('?')[0].endsWith('.pdf') ||
		finalPreviewUrl.startsWith('data:application/pdf');

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

			{/* Modal content */}
			<div
				className="relative z-10 bg-card rounded-lg shadow-2xl border border-divider flex flex-col"
				style={{ width: '95vw', maxWidth: '650px', height: '95vh' }}
				onClick={e => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-divider shrink-0">
					<div className="flex items-center gap-2">
						<span className="text-sm font-semibold text-text-1">{label}</span>
						{file && <span className="text-[10px] text-text-3 bg-field px-2 py-0.5 rounded">{file.name}</span>}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-text-3 hover:text-text-1 transition-colors p-1 rounded hover:bg-field"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Preview body */}
				<div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-field/50">
					{isPdf ? (
						<iframe
							src={finalPreviewUrl}
							title={label}
							className="w-full h-full rounded border border-divider bg-white"
						/>
					) : (
						<img src={finalPreviewUrl} alt={label} className="max-w-full max-h-full object-contain rounded shadow-md" />
					)}
				</div>
			</div>
		</div>
	);
};

export default DocumentPreviewModal;
