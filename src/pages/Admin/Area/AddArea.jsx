import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import AutoComplete from '../../../components/dropdown/AutoComplete';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddArea = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState({
		area_Name: '',
		collection_Charge: '',
		delivery_Charge: '',
		state_Id: '',
		zone_Id: ''
	});
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const { data: statesData } = useAutoRevalidate(API.STATES.LIST, { limit: 1000, is_active: 1 });
	const stateOptions = (statesData?.list || []).map(s => ({ value: s.state_Id, label: s.state_Name }));

	const { data: zonesData } = useAutoRevalidate(API.ZONES.LIST, { limit: 1000, is_active: 1 });
	const zoneOptions = (zonesData?.list || []).map(z => ({ value: z.zone_Id, label: z.zone_Name }));

	useEffect(() => {
		if (isEdit) {
			const fetchArea = async () => {
				try {
					const response = await http.post(API.AREAS.GET(id));
					if (response?.data) {
						setForm({
							area_Name: response.data.area_Name || '',
							collection_Charge: response.data.collection_Charge || '',
							delivery_Charge: response.data.delivery_Charge || '',
							state_Id: response.data.state_Id || '',
							zone_Id: response.data.zone_Id || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch area:', error);
					addToast({ type: 'error', message: 'Failed to fetch area details' });
				}
			};
			fetchArea();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.AREAS.UPDATE(id), form);
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Area updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.AREAS.CREATE, form);
				addToast({ type: 'success', message: res?.data?.msg || 'Area created successfully' });
				setForm({ area_Name: '', collection_Charge: '', delivery_Charge: '', state_Id: '', zone_Id: '' }); // Clear form
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Failed to save area' });
			setLoading(false);
		}
	};

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	return (
		<FormLayout
			title={isEdit ? 'Edit Area' : 'Add Area'}
			backTo={ROUTES.AREAS}
			subtitle={isEdit ? 'Update area details.' : 'Add a new area to the system.'}
			onSubmit={onSubmit}
			formId="area-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Area Name"
						id="area_Name"
						placeholder="Enter Area Name"
						value={form.area_Name}
						onChange={set('area_Name')}
						required
					/>
					<Input
						label="Collection Charge"
						id="collection_Charge"
						type="number"
						placeholder="0.00"
						value={form.collection_Charge}
						onChange={set('collection_Charge')}
					/>
					<Input
						label="Delivery Charge"
						id="delivery_Charge"
						type="number"
						placeholder="0.00"
						value={form.delivery_Charge}
						onChange={set('delivery_Charge')}
					/>
					<div className="flex flex-col">
						<label className="form-label">
							State <span className="text-red-500 ml-0.5">*</span>
						</label>
						<AutoComplete
							options={stateOptions}
							value={stateOptions.find(o => o.value === form.state_Id) || null}
							placeholder="Select State"
							onChange={(_, selectedOption) => {
								setForm(prev => ({ ...prev, state_Id: selectedOption?.value || '' }));
							}}
						/>
					</div>
					<div className="flex flex-col">
						<label className="form-label">Zone</label>
						<AutoComplete
							options={zoneOptions}
							value={zoneOptions.find(o => o.value === form.zone_Id) || null}
							placeholder="Select Zone"
							onChange={(_, selectedOption) => {
								setForm(prev => ({ ...prev, zone_Id: selectedOption?.value || '' }));
							}}
						/>
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddArea;
