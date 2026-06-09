import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';
import AutoComplete from '../../../components/dropdown/AutoComplete.jsx';
import { useAutoRevalidate } from '../../../hooks/useAutoRevalidate';
import { validatePlaceName } from '../../../utils/methods/validations.js';

const emptyForm = {
	branch_Name: '',
	branch_Code: '',
	branch_Address: '',
	branch_City: '',
	branch_State: '',
	branch_PinCode: '',
	branch_Area_Name: '',
	branch_Zone: ''
};

const AddBranch = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [form, setForm] = useState(emptyForm);
	const [nameError, setNameError] = useState('');
	const [pinError, setPinError] = useState('');
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	const { data: citiesData } = useAutoRevalidate(API.CITIES.LIST, { inputData: { limit: 1000 } });
	const { data: statesData } = useAutoRevalidate(API.STATES.LIST, { inputData: { limit: 1000 } });
	const { data: zonesData } = useAutoRevalidate(API.ZONES.LIST, { inputData: { limit: 1000 } });
	const { data: areasData } = useAutoRevalidate(API.AREAS.LIST, { inputData: { limit: 1000 } });

	const cityOptions = (citiesData?.list || [])
		.filter(c => c.is_active === 1 || c.city_Name === form.branch_City)
		.map(c => ({ value: c.city_Name, label: c.city_Name }));
	const stateOptions = (statesData?.list || [])
		.filter(s => s.is_active === 1 || s.state_Name === form.branch_State)
		.map(s => ({ value: s.state_Name, label: s.state_Name }));
	const zoneOptions = (zonesData?.list || [])
		.filter(z => z.is_active === 1 || z.zone_Name === form.branch_Zone)
		.map(z => ({ value: z.zone_Name, label: z.zone_Name }));
	const areaOptions = (areasData?.list || [])
		.filter(a => (a.is_active !== undefined ? a.is_active === 1 : true) || a.area_Name === form.branch_Area_Name)
		.map(a => ({ value: a.area_Name, label: a.area_Name }));

	useEffect(() => {
		if (isEdit) {
			const fetchBranch = async () => {
				try {
					const response = await http.post(API.BRANCHES.GET(id));
					if (response?.data) {
						setForm({
							branch_Name: response.data.branch_Name || '',
							branch_Code: response.data.branch_Code || '',
							branch_Address: response.data.branch_Address || '',
							branch_City: response.data.branch_City || '',
							branch_State: response.data.branch_State || '',
							branch_PinCode: response.data.branch_PinCode || '',
							branch_Area_Name: response.data.branch_Area_Name || '',
							branch_Zone: response.data.branch_Zone || ''
						});
					}
				} catch (error) {
					console.error('Failed to fetch branch:', error);
					addToast({ type: 'error', message: 'Failed to fetch branch details' });
				}
			};
			fetchBranch();
		}
	}, [id, isEdit, addToast]);

	const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		const nameErr = validatePlaceName(form.branch_Name, 'Branch Name');
		const pin = form.branch_PinCode.trim();
		const pinErr = pin && !/^\d{6}$/.test(pin) ? 'Pin Code must be exactly 6 digits (numbers only).' : '';
		setNameError(nameErr);
		setPinError(pinErr);
		if (nameErr || pinErr) return;
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.BRANCHES.UPDATE(id), { inputData: form });
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Branch updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.BRANCHES.CREATE, { inputData: form });
				addToast({ type: 'success', message: res?.data?.msg || 'Branch created successfully' });
				setForm(emptyForm);
				setLoading(false);
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to save branch'
			});
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Branch' : 'Add Branch'}
			backTo={ROUTES.BRANCH_LIST}
			subtitle={isEdit ? 'Update branch details.' : 'Add a new branch to the system.'}
			onSubmit={onSubmit}
			formId="branch-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				{/* Row 1 – Name & Code */}
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Branch Name"
						id="branch_Name"
						placeholder="Enter Branch Name"
						value={form.branch_Name}
						onChange={e => {
							setForm(f => ({ ...f, branch_Name: e.target.value }));
							setNameError('');
						}}
						error={nameError}
						required
					/>
					<Input
						label="Branch Code"
						id="branch_Code"
						placeholder="Enter Branch Code (optional)"
						value={form.branch_Code}
						onChange={set('branch_Code')}
					/>
				</div>

				{/* Row 2 – City, State, Pin Code */}
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-3">
					<div className="w-full">
						<label className="form-label">City</label>
						<AutoComplete
							options={cityOptions}
							value={cityOptions.find(o => o.value === form.branch_City) || null}
							placeholder="Select City"
							onChange={(_, selectedOption) => setForm(f => ({ ...f, branch_City: selectedOption?.value || '' }))}
						/>
					</div>
					<div className="w-full">
						<label className="form-label">State</label>
						<AutoComplete
							options={stateOptions}
							value={stateOptions.find(o => o.value === form.branch_State) || null}
							placeholder="Select State"
							onChange={(_, selectedOption) => setForm(f => ({ ...f, branch_State: selectedOption?.value || '' }))}
						/>
					</div>
					<Input
						label="Pin Code"
						id="branch_PinCode"
						placeholder="Enter 6-digit Pin Code"
						value={form.branch_PinCode}
						maxLength={6}
						inputMode="numeric"
						onChange={e => {
							const val = e.target.value.replace(/\D/g, '');
							setForm(f => ({ ...f, branch_PinCode: val }));
							setPinError('');
						}}
						error={pinError}
					/>
				</div>

				{/* Row 3 – Area & Zone */}
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<div className="w-full">
						<label className="form-label">Area Name</label>
						<AutoComplete
							options={areaOptions}
							value={areaOptions.find(o => o.value === form.branch_Area_Name) || null}
							placeholder="Select Area Name"
							onChange={(_, selectedOption) => setForm(f => ({ ...f, branch_Area_Name: selectedOption?.value || '' }))}
						/>
					</div>
					<div className="w-full">
						<label className="form-label">Zone</label>
						<AutoComplete
							options={zoneOptions}
							value={zoneOptions.find(o => o.value === form.branch_Zone) || null}
							placeholder="Select Zone"
							onChange={(_, selectedOption) => setForm(f => ({ ...f, branch_Zone: selectedOption?.value || '' }))}
						/>
					</div>
				</div>

				{/* Row 4 – Address (full width) */}
				<div className="grid grid-cols-1 gap-[10px]">
					<Input
						label="Address"
						id="branch_Address"
						placeholder="Enter Full Address"
						value={form.branch_Address}
						onChange={set('branch_Address')}
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddBranch;
