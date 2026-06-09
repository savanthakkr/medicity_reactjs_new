import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddCircular = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		circular_Name: '',
		subject: '',
		document_No: '',
		message: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchCircular = async () => {
				try {
					const response = await http.post(API.CIRCULARS.GET(id));
					if (response?.data) {
						setForm({
							circular_Name: response.data.circular_Name || '',
							subject: response.data.subject || '',
							document_No: response.data.document_No || '',
							message: response.data.message || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch circular:', error);
					addToast({ type: 'error', message: 'Failed to fetch circular details' });
				}
			};
			fetchCircular();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.CIRCULARS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Circular updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.CIRCULARS.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Circular created successfully' });
				setForm({ circular_Name: '', subject: '', document_No: '', message: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save circular' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Circular' : 'Add Circular'}
			backTo={ROUTES.CIRCULARS}
			subtitle={isEdit ? 'Update circular details.' : 'Add a new circular to the system.'}
			onSubmit={onSubmit}
			formId="circular-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Circular Name"
						id="circular_Name"
						placeholder="Enter Circular Name"
						value={form.circular_Name}
						onChange={set('circular_Name')}
						required
					/>
					<Input
						label="Subject"
						id="subject"
						placeholder="Enter Subject"
						value={form.subject}
						onChange={set('subject')}
					/>
					<Input
						label="Document No"
						id="document_No"
						placeholder="Enter Document No"
						value={form.document_No}
						onChange={set('document_No')}
					/>
					<div className="col-span-1 xl:col-span-2 flex flex-col">
						<label htmlFor="message" className="form-label mb-1">
							Message
						</label>
						<textarea
							id="message"
							placeholder="Enter Message"
							className="form-input"
							rows={4}
							value={form.message}
							onChange={set('message')}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddCircular;
