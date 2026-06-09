import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import DateInput from '../../../components/common/DateInput.jsx';
import FormLayout from '../../../components/common/FormLayout.jsx';

const INITIAL = {
	employee_Id: '',
	branch_Id: '',
	designation_Id: '',
	share_type_Id: '',
	max_discount_percentage: '',
	max_discount_per_month: '',
	max_discount_per_bill: '',
	effective_from: '',
	effective_to: ''
};

const FieldError = ({ msg }) => (msg ? <p className="mt-1 text-[11px] text-red-600">{msg}</p> : null);

const AddEmployeeDiscount = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);

	const [form, setForm] = useState(INITIAL);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);

	const [employees, setEmployees] = useState([]); // dropdown options
	const [employeeMap, setEmployeeMap] = useState({}); // id → full employee object
	const [shareTypes, setShareTypes] = useState([]);

	// Load all dropdowns
	useEffect(() => {
		Promise.all([
			http.post(API.EMPLOYEES.LIST, { page: 1, limit: 500, is_active: 1 }),
			http.post(API.SHARE_TYPES.LIST, { page: 1, limit: 200, is_active: 1 })
		])
			.then(([empRes, stRes]) => {
				const empList = empRes?.data?.list || [];
				setEmployees(
					empList.map(e => ({
						value: String(e.employee_Id),
						label: `${e.employee_Name}${e.employee_Code ? ` (${e.employee_Code})` : ''}`
					}))
				);
				// Build id → employee map for auto-fill branch/designation silently
				const map = {};
				empList.forEach(e => {
					map[String(e.employee_Id)] = e;
				});
				setEmployeeMap(map);
				setShareTypes(
					(stRes?.data?.list || []).map(s => ({
						value: String(s.share_type_Id),
						label: s.share_type_Name
					}))
				);
			})
			.catch(() => {});
	}, []);

	// Load existing record in edit mode
	useEffect(() => {
		if (!id) return;
		setFetching(true);
		http
			.post(API.EMPLOYEE_DISCOUNTS.GET(id))
			.then(res => {
				const d = res?.data;
				if (d) {
					setForm({
						employee_Id: d.employee_Id ? String(d.employee_Id) : '',
						branch_Id: d.branch_Id ? String(d.branch_Id) : '',
						designation_Id: d.designation_Id ? String(d.designation_Id) : '',
						share_type_Id: d.share_type_Id ? String(d.share_type_Id) : '',
						max_discount_percentage: d.max_discount_percentage ?? '',
						max_discount_per_month: d.max_discount_per_month ?? '',
						max_discount_per_bill: d.max_discount_per_bill ?? '',
						effective_from: d.effective_from ? d.effective_from.split('T')[0] : '',
						effective_to: d.effective_to ? d.effective_to.split('T')[0] : ''
					});
				}
			})
			.catch(() => addToast({ type: 'error', message: 'Failed to load discount' }))
			.finally(() => setFetching(false));
	}, [id]);

	const handleChange = e => {
		const { name, value } = e.target;

		// When employee changes, auto-fill branch and designation from their profile
		if (name === 'employee_Id' && value) {
			const emp = employeeMap[value];
			if (emp) {
				setForm(f => ({
					...f,
					employee_Id: value,
					branch_Id: emp.branch_Id ? String(emp.branch_Id) : f.branch_Id,
					designation_Id: emp.designation_Id ? String(emp.designation_Id) : f.designation_Id
				}));
				setErrors(p => ({ ...p, employee_Id: '' }));
				return;
			}
		}

		setForm(f => ({ ...f, [name]: value }));
		setErrors(p => ({ ...p, [name]: '' }));
	};

	const validate = () => {
		const errs = {};
		if (!form.employee_Id) errs.employee_Id = 'Employee is required.';
		if (form.max_discount_percentage !== '' && isNaN(Number(form.max_discount_percentage)))
			errs.max_discount_percentage = 'Must be a valid number.';
		if (form.max_discount_per_month !== '' && isNaN(Number(form.max_discount_per_month)))
			errs.max_discount_per_month = 'Must be a valid number.';
		if (form.max_discount_per_bill !== '' && isNaN(Number(form.max_discount_per_bill)))
			errs.max_discount_per_bill = 'Must be a valid number.';
		if (form.effective_from && form.effective_to && new Date(form.effective_to) < new Date(form.effective_from))
			errs.effective_to = 'Effective To cannot be before Effective From.';
		return errs;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		const errs = validate();
		setErrors(errs);
		if (Object.keys(errs).length > 0) return;

		setLoading(true);
		try {
			const payload = {
				employee_Id: Number(form.employee_Id),
				branch_Id: form.branch_Id ? Number(form.branch_Id) : null,
				designation_Id: form.designation_Id ? Number(form.designation_Id) : null,
				share_type_Id: form.share_type_Id ? Number(form.share_type_Id) : null,
				max_discount_percentage: form.max_discount_percentage !== '' ? Number(form.max_discount_percentage) : 0,
				max_discount_per_month: form.max_discount_per_month !== '' ? Number(form.max_discount_per_month) : null,
				max_discount_per_bill: form.max_discount_per_bill !== '' ? Number(form.max_discount_per_bill) : null,
				effective_from: form.effective_from || null,
				effective_to: form.effective_to || null
			};

			if (id) {
				await http.post(API.EMPLOYEE_DISCOUNTS.UPDATE(id), payload);
				addToast({ type: 'success', message: 'Discount updated successfully' });
			} else {
				await http.post(API.EMPLOYEE_DISCOUNTS.CREATE, payload);
				addToast({ type: 'success', message: 'Discount created successfully' });
			}
			navigate(ROUTES.EMPLOYEE_DISCOUNTS);
		} catch (err) {
			addToast({ type: 'error', message: err?.response?.data?.message || 'Operation failed' });
		} finally {
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-3 text-[13px]">Loading…</div>;

	return (
		<FormLayout
			title={id ? 'Edit Discount Allowed' : 'Add Discount Allowed'}
			backTo={ROUTES.EMPLOYEE_DISCOUNTS}
			subtitle={id ? 'Update discount configuration.' : 'Set discount limits for an employee.'}
			onSubmit={handleSubmit}
			formId="employee-discount-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<div>
						<Select
							label="Employee"
							name="employee_Id"
							id="employee_Id"
							value={form.employee_Id}
							onChange={handleChange}
							placeholder="Select Employee..."
							options={employees}
							required
						/>
						<FieldError msg={errors.employee_Id} />
					</div>

					<div>
						<Select
							label="Share Type"
							name="share_type_Id"
							id="share_type_Id"
							value={form.share_type_Id}
							onChange={handleChange}
							placeholder="Select Share Type..."
							options={shareTypes}
						/>
					</div>

					<div>
						<Input
							label="Add Discount (%)"
							name="max_discount_percentage"
							id="max_discount_percentage"
							type="number"
							min="0"
							max="100"
							step="0.01"
							value={form.max_discount_percentage}
							onChange={handleChange}
							placeholder="Enter discount %..."
							error={errors.max_discount_percentage}
						/>
					</div>

					<div>
						<Input
							label="Max Discount Per Month (₹)"
							name="max_discount_per_month"
							id="max_discount_per_month"
							type="number"
							min="0"
							step="0.01"
							value={form.max_discount_per_month}
							onChange={handleChange}
							placeholder="Enter max monthly discount..."
							error={errors.max_discount_per_month}
						/>
					</div>

					<div>
						<Input
							label="Max Discount Per Bill (₹)"
							name="max_discount_per_bill"
							id="max_discount_per_bill"
							type="number"
							min="0"
							step="0.01"
							value={form.max_discount_per_bill}
							onChange={handleChange}
							placeholder="Enter max per-bill discount..."
							error={errors.max_discount_per_bill}
						/>
					</div>

					<div>
						<DateInput
							label="Effective From"
							name="effective_from"
							id="effective_from"
							value={form.effective_from}
							onChange={handleChange}
						/>
						<FieldError msg={errors.effective_from} />
					</div>

					<div>
						<DateInput
							label="Effective To"
							name="effective_to"
							id="effective_to"
							value={form.effective_to}
							onChange={handleChange}
						/>
						<FieldError msg={errors.effective_to} />
					</div>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddEmployeeDiscount;
