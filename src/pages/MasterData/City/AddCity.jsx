import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import FormLayout from '../../../components/common/FormLayout.jsx';
import AutoComplete from '@/components/dropdown/AutoComplete';
import { validatePlaceName } from '../../../utils/methods/validations.js';

const AddCity = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({ city_Name: '', state_Id: '' });
	const [nameError, setNameError] = useState('');
	const [stateError, setStateError] = useState('');
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const { data: statesData } = useAutoRevalidate(API.STATES.LIST, { limit: 1000 });
	const stateOptions = (statesData?.list || [])
		.filter(s => s.is_active === 1 || s.state_Id === form.state_Id)
		.map(s => ({ value: s.state_Id, label: s.state_Name }));

	useEffect(() => {
		if (isEdit) {
			const fetchCity = async () => {
				try {
					const response = await http.post(API.CITIES.GET(id));
					if (response?.data) {
						setForm({
							city_Name: response.data.city_Name || '',
							state_Id: response.data.state_Id || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch city:', error);
					addToast({ type: 'error', message: 'Failed to fetch city details' });
				}
			};
			fetchCity();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		const nameErr = validatePlaceName(form.city_Name, 'City Name');
		const stateErr = form.state_Id ? '' : 'State is required.';
		setNameError(nameErr);
		setStateError(stateErr);
		if (nameErr || stateErr) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.CITIES.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'City updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.CITIES.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'City created successfully' });
				setForm({ city_Name: '', state_Id: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to save city'
			});
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit City' : 'Add City'}
			backTo={ROUTES.CITIES}
			subtitle={isEdit ? 'Update city details.' : 'Add a new city to the system.'}
			onSubmit={onSubmit}
			formId="city-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-[10px] items-start">
					<Input
						label="City Name"
						id="city_Name"
						placeholder="Enter City Name"
						value={form.city_Name}
						onChange={e => {
							setForm(f => ({ ...f, city_Name: e.target.value }));
							setNameError('');
						}}
						error={nameError}
						required
					/>

					<div className="flex flex-col">
						<label className="form-label">
							State <span className="text-red-500 ml-0.5">*</span>
						</label>

						<AutoComplete
							options={stateOptions}
							value={stateOptions.find(option => option.value === form.state_Id) || null}
							placeholder="Select State"
							required
							onChange={(_, selectedOption) => {
								setForm(prev => ({
									...prev,
									state_Id: selectedOption?.value || ''
								}));
								setStateError('');
							}}
							error={stateError}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddCity;
