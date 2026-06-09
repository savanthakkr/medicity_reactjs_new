import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import ROUTES from '../../../utils/constants/routes';
import { API } from '../../../data/apis/endpoints';
import http from '../../../lib/axios/axios';
import Input from '../../../components/common/Input.jsx';
import TextArea from '../../../components/common/TextArea.jsx';
import Radio from '../../../components/common/Radio.jsx';
import FormLayout from '../../../components/common/FormLayout.jsx';
import { FIELD_LIMITS, charLimitMsg } from '../../../utils/constants/fieldLimits';

const AddLeaveType = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [errors, setErrors] = useState({});

	const [form, setForm] = useState({
		leave_type_Name: '',
		leave_type_Description: '',
		is_paid: 1,
		max_days_allowed: ''
	});

	useEffect(() => {
		if (id) {
			const fetchLeaveType = async () => {
				setFetching(true);
				try {
					const response = await http.post(API.LEAVE_TYPES.GET(id));
					if (response.data) {
						setForm({
							leave_type_Name: response.data.leave_type_Name || '',
							leave_type_Description: response.data.leave_type_Description || '',
							is_paid: response.data.is_paid ?? 1,
							max_days_allowed: response.data.max_days_allowed || ''
						});
					}
				} catch (error) {
					console.error('Fetch failed:', error);
					addToast({ type: 'error', message: 'Failed to fetch details' });
				} finally {
					setFetching(false);
				}
			};
			fetchLeaveType();
		}
	}, [id, addToast]);

	const handleChange = e => {
		const { name, value, type, checked } = e.target;
		setForm(prev => ({
			...prev,
			[name]: type === 'checkbox' ? (checked ? 1 : 0) : value
		}));
		// Clear error for the field being changed
		if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
	};

	const validate = () => {
		const errs = {};
		const name = form.leave_type_Name.trim();
		const desc = form.leave_type_Description.trim();

		if (!name) {
			errs.leave_type_Name = 'Leave type name is required.';
		} else if (name.length > FIELD_LIMITS.LEAVE_TYPE_NAME) {
			errs.leave_type_Name = charLimitMsg(FIELD_LIMITS.LEAVE_TYPE_NAME);
		}

		if (desc.length > FIELD_LIMITS.LEAVE_TYPE_DESCRIPTION) {
			errs.leave_type_Description = charLimitMsg(FIELD_LIMITS.LEAVE_TYPE_DESCRIPTION);
		}

		if (form.max_days_allowed !== '' && form.max_days_allowed !== null) {
			const days = Number(form.max_days_allowed);
			if (isNaN(days) || days <= 0 || !Number.isInteger(days)) {
				errs.max_days_allowed = 'Max days must be a positive whole number.';
			}
		}

		return errs;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		const errs = validate();
		setErrors(errs);
		if (Object.keys(errs).length > 0) return;

		setLoading(true);
		try {
			if (id) {
				const res = await http.post(API.LEAVE_TYPES.UPDATE(id), { inputData: form });
				setLoading(false);
				addToast({ type: 'success', message: res?.data?.msg || 'Leave type updated successfully' });
				setTimeout(() => navigate(-1), 500);
			} else {
				const res = await http.post(API.LEAVE_TYPES.CREATE, { inputData: form });
				addToast({ type: 'success', message: res?.data?.msg || 'Leave type created successfully' });
				setLoading(false);
				setTimeout(() => navigate(-1), 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: error?.response?.data?.message || 'Operation failed' });
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-2 font-medium">Loading leave type details...</div>;

	return (
		<FormLayout
			title={id ? 'Edit Leave Type' : 'Add Leave Type'}
			backTo={ROUTES.LEAVE_TYPE_LIST}
			subtitle={id ? 'Update leave type details.' : 'Add a new leave type to the system.'}
			onSubmit={handleSubmit}
			formId="leave-type-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
					<Input
						label="Leave Type Name"
						name="leave_type_Name"
						id="leave_type_Name"
						value={form.leave_type_Name}
						onChange={handleChange}
						placeholder="e.g. Annual Leave"
						required
						maxLength={FIELD_LIMITS.LEAVE_TYPE_NAME}
						error={errors.leave_type_Name}
					/>
					<Input
						label="Max Days Allowed"
						name="max_days_allowed"
						id="max_days_allowed"
						type="number"
						min="1"
						value={form.max_days_allowed}
						onChange={handleChange}
						placeholder="e.g. 15"
						error={errors.max_days_allowed}
					/>
				</div>

				<div className="flex flex-col gap-[8px]">
					<label className="text-p2 font-semibold text-text-2">Payment Status</label>
					<div className="flex items-center gap-[15px] h-[31px]">
						<Radio
							id="paid-leave"
							name="is_paid"
							value="1"
							checked={Number(form.is_paid) === 1}
							onChange={() => setForm(f => ({ ...f, is_paid: 1 }))}
							label="Paid"
							className="text-p1"
						/>
						<Radio
							id="unpaid-leave"
							name="is_paid"
							value="0"
							checked={Number(form.is_paid) === 0}
							onChange={() => setForm(f => ({ ...f, is_paid: 0 }))}
							label="Unpaid"
							className="text-p1"
						/>
					</div>
				</div>

				<TextArea
					label="Description"
					id="leave_type_Description"
					name="leave_type_Description"
					value={form.leave_type_Description}
					onChange={handleChange}
					placeholder="Provide a brief description..."
					rows={3}
					maxLength={FIELD_LIMITS.LEAVE_TYPE_DESCRIPTION}
					error={errors.leave_type_Description}
				/>
			</div>
		</FormLayout>
	);
};

export default AddLeaveType;
