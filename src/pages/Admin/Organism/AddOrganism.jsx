import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddOrganism = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		organism_Name: '',
		organism_Description: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchOrganism = async () => {
				try {
					const response = await http.post(API.ORGANISMS.GET(id));
					if (response?.data) {
						setForm({
							organism_Name: response.data.organism_Name || '',
							organism_Description: response.data.organism_Description || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch organism:', error);
					addToast({ type: 'error', message: 'Failed to fetch organism details' });
				}
			};
			fetchOrganism();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.ORGANISMS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Organism updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.ORGANISMS.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Organism created successfully' });
				setForm({ organism_Name: '', organism_Description: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save organism' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Organism' : 'Add Organism'}
			backTo={ROUTES.ORGANISMS}
			subtitle={isEdit ? 'Update organism details.' : 'Add a new organism to the system.'}
			onSubmit={onSubmit}
			formId="organism-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Organism Name"
						id="organism_Name"
						placeholder="Enter Organism Name"
						value={form.organism_Name}
						onChange={set('organism_Name')}
						required
					/>
					<div className="col-span-1 xl:col-span-2 flex flex-col">
						<label htmlFor="organism_Description" className="form-label mb-1">
							Description
						</label>
						<textarea
							id="organism_Description"
							placeholder="Enter Description"
							className="form-input"
							rows={4}
							value={form.organism_Description}
							onChange={set('organism_Description')}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddOrganism;
