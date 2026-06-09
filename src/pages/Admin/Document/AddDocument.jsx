import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddDocument = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		document_Name: '',
		document_Description: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchDocument = async () => {
				try {
					const response = await http.post(API.DOCUMENTS.GET(id));
					if (response?.data) {
						setForm({
							document_Name: response.data.document_Name || '',
							document_Description: response.data.document_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch document:', error);
					addToast({ type: 'error', message: 'Failed to fetch document details' });
				}
			};
			fetchDocument();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.DOCUMENTS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Document updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.DOCUMENTS.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Document created successfully' });
				setForm({ document_Name: '', document_Description: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save document' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Document' : 'Add Document'}
			backTo={ROUTES.DOCUMENTS}
			subtitle={isEdit ? 'Update document details.' : 'Add a new document to the system.'}
			onSubmit={onSubmit}
			formId="document-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Document Name"
						id="document_Name"
						placeholder="Enter Name"
						value={form.document_Name}
						onChange={set('document_Name')}
						required
					/>
					<Input
						label="Description"
						id="document_Description"
						placeholder="Enter Description"
						value={form.document_Description}
						onChange={set('document_Description')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddDocument;
