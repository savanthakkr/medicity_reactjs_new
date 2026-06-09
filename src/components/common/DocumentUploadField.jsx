import React, { useRef } from 'react';

const DocumentUploadField = ({
	id,
	label,
	hint,
	required = false,
	file,
	progress = null,
	error = null,
	fileDataUrl = null,
	onFileChange,
	onRemove,
	onPreview
}) => {
	const fileInputRef = useRef();

	const handleFileSelect = e => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			onFileChange(selectedFile);
		}
	};

	const triggerUpload = () => {
		fileInputRef.current.click();
	};

	const hasFile = !!file;
	const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
	const fileKind = isPdf ? 'PDF' : hasFile ? 'IMG' : 'DOC';

	const displayPreviewUrl = fileDataUrl || file?.url || file?.fileKey;

	return (
		<div
			className={`rounded-[8px] border bg-card p-[14px] transition-all ${
				error
					? 'border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
					: hasFile
						? 'border-brand-light/40 shadow-sm'
						: 'border-divider hover:border-brand-light/60'
			}`}
		>
			{/* Hidden file input */}
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileSelect}
				className="hidden"
				accept=".pdf,.jpg,.jpeg,.png"
			/>

			{/* Top Row: Icon + Title & Badge */}
			<div className="flex items-start gap-[12px]">
				<button
					type="button"
					onClick={triggerUpload}
					className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[8px] border transition ${
						hasFile
							? 'border-brand-light/30 bg-brand-light/10 text-brand-light'
							: 'border-dashed border-divider bg-field text-text-3 hover:border-brand-light hover:text-brand-light'
					}`}
					aria-label={`Upload ${label}`}
				>
					{hasFile ? (
						<span className="text-[11px] font-bold leading-none">{fileKind}</span>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-[21px] w-[21px]"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="1.8"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
							/>
						</svg>
					)}
				</button>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-[10px]">
						<div className="min-w-0">
							<p className="text-[13px] font-semibold leading-tight text-text-1">
								{label} {required && <span className="text-red-500">*</span>}
							</p>
							{hint && <p className="mt-1 text-[10.5px] leading-snug text-text-3">{hint}</p>}
						</div>
						<span
							className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
								hasFile ? 'bg-green-500/10 text-green-600' : 'bg-field text-text-3'
							}`}
						>
							{hasFile ? 'Uploaded' : 'Required'}
						</span>
					</div>
				</div>
			</div>

			{/* Bottom Row: Progress, Uploaded File details, or Choose File button (Takes full width of card) */}
			{progress !== null && progress !== undefined ? (
				<div className="mt-[12px] flex items-center gap-2">
					<div className="h-[6px] flex-1 overflow-hidden rounded-full bg-field">
						<div
							className="h-full rounded-full bg-brand-light transition-all duration-100"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<span className="w-[34px] text-right text-[10px] font-medium text-text-3">{progress}%</span>
				</div>
			) : hasFile ? (
				<div className="mt-[12px] rounded-[6px] border border-divider/70 bg-field/60 px-3 py-2">
					<div className="flex min-w-0 items-center justify-between gap-3">
						<div className="min-w-0 flex-1">
							<p className="truncate text-[12px] font-medium text-text-1" title={file.name || label || 'Uploaded file'}>
								{file.name || label || 'Uploaded file'}
							</p>
							<p className="mt-0.5 text-[10px] text-text-3">{file.size || 'Uploaded file'}</p>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							{displayPreviewUrl && (
								<button
									type="button"
									onClick={onPreview}
									className="rounded-[5px] border border-divider bg-card px-2.5 py-1 text-[11px] font-semibold text-text-2 transition hover:border-brand-light hover:text-brand-light cursor-pointer"
								>
									View
								</button>
							)}
							<button
								type="button"
								onClick={onRemove}
								className="rounded-[5px] border border-red-200 bg-red-50/5 px-2.5 py-1 text-[11px] font-semibold text-red-500 transition hover:bg-red-50/10 cursor-pointer"
							>
								Remove
							</button>
						</div>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={triggerUpload}
					className="mt-[12px] flex w-full items-center justify-center rounded-[6px] border border-dashed border-divider bg-field/50 px-3 py-2 text-[11px] font-semibold text-text-3 transition hover:border-brand-light hover:bg-brand-light/5 hover:text-brand-light cursor-pointer"
				>
					Choose file to upload
				</button>
			)}

			{error && <p className="mt-2 text-[11px] font-medium text-red-600">{error}</p>}
		</div>
	);
};

export default DocumentUploadField;
