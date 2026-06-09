import React, { useState, useCallback } from 'react';
import DocumentUploadField from './DocumentUploadField';
import DocumentPreviewModal from './DocumentPreviewModal';
import { uploadToFileServer } from '../../utils/methods/uploadToFileServer';

let _rid = 0;
const nextRowId = () => ++_rid;
const emptyRow = () => ({
	rowId: nextRowId(),
	document_Id: '',
	file: null,
	uploading: false,
	url: null,
	name: null,
	fileDataUrl: null,
	error: null
});

/**
 * Manages a list of file uploads (new rows) + display of already-saved docs.
 *
 * Props:
 *   documentMasters   - [{ value, label }] for doc-type select; omit or [] to hide
 *   showDocumentType  - boolean (default true). Set false for leave docs.
 *   onChange(docs)    - called whenever the uploaded-but-not-yet-saved list changes.
 *                       docs = [{ document_Id, document_url, document_name }]
 *   existingDocs      - already-saved docs from DB
 *   onRemoveExisting  - called with (doc) when user removes a saved doc
 */
const DocumentManager = ({
	documentMasters = [],
	showDocumentType = true,
	onChange,
	existingDocs = [],
	onRemoveExisting
}) => {
	const [rows, setRows] = useState([emptyRow()]);
	const [preview, setPreview] = useState({ open: false, row: null });

	const notifyParent = useCallback(
		currentRows => {
			if (onChange) {
				onChange(
					currentRows
						.filter(r => r.url)
						.map(r => ({ document_Id: r.document_Id || null, document_url: r.url, document_name: r.name }))
				);
			}
		},
		[onChange]
	);

	const handleFileChange = async (rowId, file) => {
		setRows(prev =>
			prev.map(r =>
				r.rowId === rowId
					? { ...r, file: { name: file.name, size: file.size, type: file.type }, uploading: true, error: null }
					: r
			)
		);
		try {
			const { url, name } = await uploadToFileServer(file);
			setRows(prev => {
				const updated = prev.map(r =>
					r.rowId === rowId ? { ...r, uploading: false, url, name: name || file.name, fileDataUrl: url } : r
				);
				notifyParent(updated);
				return updated;
			});
		} catch {
			setRows(prev =>
				prev.map(r => (r.rowId === rowId ? { ...r, uploading: false, error: 'Upload failed. Try again.' } : r))
			);
		}
	};

	const handleRemove = rowId => {
		setRows(prev => {
			const filtered = prev.filter(r => r.rowId !== rowId);
			const updated = filtered.length === 0 ? [emptyRow()] : filtered;
			notifyParent(updated);
			return updated;
		});
	};

	const handleDocTypeChange = (rowId, docId) => {
		setRows(prev => {
			const updated = prev.map(r => (r.rowId === rowId ? { ...r, document_Id: docId } : r));
			notifyParent(updated);
			return updated;
		});
	};

	const addRow = () => setRows(prev => [...prev, emptyRow()]);

	const previewRow = rows.find(r => r.rowId === preview.row);

	return (
		<div className="flex flex-col gap-3">
			{/* ── Already-saved documents ────────────────────────────────────────── */}
			{existingDocs.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-[11px] font-semibold uppercase tracking-wide text-text-3">Saved Documents</p>
					{existingDocs.map(doc => {
						const docId = doc.employee_document_Id ?? doc.employee_leave_document_Id;
						const fileKey = doc.employee_document_File_Key ?? doc.employee_leave_document_File_Key;
						const fileName = doc.employee_document_File_Name ?? doc.employee_leave_document_File_Name ?? fileKey;
						return (
							<div
								key={docId}
								className="flex items-center gap-3 rounded-[6px] border border-divider bg-field px-3 py-2.5"
							>
								<svg
									className="h-4 w-4 shrink-0 text-brand-light"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
								</svg>
								<div className="min-w-0 flex-1">
									{doc.document_Name && <p className="text-[10px] font-semibold text-text-3">{doc.document_Name}</p>}
									<p className="truncate text-[12px] font-medium text-text-1">{fileName}</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<a
										href={fileKey}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-[5px] border border-divider bg-card px-2.5 py-1 text-[11px] font-semibold text-text-2 transition hover:border-brand-light hover:text-brand-light"
									>
										View
									</a>
									{onRemoveExisting && (
										<button
											type="button"
											onClick={() => onRemoveExisting(doc)}
											className="rounded-[5px] border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-500 transition hover:bg-red-50/10"
										>
											Remove
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* ── New upload rows ────────────────────────────────────────────────── */}
			{rows.map((row, idx) => (
				<div key={row.rowId} className="flex flex-col gap-2">
					{showDocumentType && documentMasters.length > 0 && (
						<select
							value={row.document_Id}
							onChange={e => handleDocTypeChange(row.rowId, e.target.value)}
							className="h-[36px] w-full rounded-[6px] border border-divider bg-field px-3 text-[12px] text-text-1 focus:border-brand-light focus:outline-none"
						>
							<option value="">— Select document type —</option>
							{documentMasters.map(d => (
								<option key={d.value} value={d.value}>
									{d.label}
								</option>
							))}
						</select>
					)}
					<div className="flex items-start gap-2">
						<div className="flex-1">
							<DocumentUploadField
								id={`doc-upload-${row.rowId}`}
								label={
									showDocumentType && row.document_Id
										? documentMasters.find(d => String(d.value) === String(row.document_Id))?.label || 'Document'
										: `Document ${idx + 1}`
								}
								file={row.file}
								progress={row.uploading ? 60 : null}
								error={row.error}
								fileDataUrl={row.fileDataUrl}
								onFileChange={file => handleFileChange(row.rowId, file)}
								onRemove={() => handleRemove(row.rowId)}
								onPreview={() => setPreview({ open: true, row: row.rowId })}
							/>
						</div>
						{rows.length > 1 && (
							<button
								type="button"
								onClick={() => handleRemove(row.rowId)}
								className="mt-[2px] text-[18px] leading-none text-red-400 hover:text-red-600"
								title="Remove row"
							>
								×
							</button>
						)}
					</div>
				</div>
			))}

			{/* ── Add another document ───────────────────────────────────────────── */}
			<button
				type="button"
				onClick={addRow}
				className="self-start rounded-[6px] border border-dashed border-brand-light/50 px-4 py-1.5 text-[12px] font-medium text-brand-light transition hover:border-brand-light hover:bg-brand-light/5"
			>
				+ Add Document
			</button>

			{/* ── Preview modal ──────────────────────────────────────────────────── */}
			<DocumentPreviewModal
				open={preview.open}
				file={previewRow?.file}
				fileDataUrl={previewRow?.fileDataUrl}
				label={previewRow?.name || 'Document Preview'}
				onClose={() => setPreview({ open: false, row: null })}
			/>
		</div>
	);
};

export default DocumentManager;
