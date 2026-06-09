import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddSection = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [fetching, setFetching] = useState(false);
	const [loading, setLoading] = useState(false);
	const [departments, setDepartments] = useState([]);

	const [form, setForm] = useState({
		section_Name: '',
		department_Id: '',
		section_Description: ''
	});

	useEffect(() => {
		const fetchDepartments = async () => {
			try {
				const response = await http.post(API.DEPARTMENTS.LIST, { page: 1, limit: 1000, is_active: 1 });
				const list = response?.data?.list ?? response?.list ?? [];
				setDepartments(list);
			} catch (error) {
				console.error('Failed to fetch departments:', error);
			}
		};
		fetchDepartments();

		if (id) {
			const fetchSection = async () => {
				setFetching(true);
				try {
					const response = await http.post(API.SECTIONS.GET(id));
					const section = response?.data ?? response;
					if (section) {
						setForm({
							section_Name: section.section_Name || '',
							department_Id: section.department_Id || '',
							section_Description: section.section_Description || ''
						});
					}
				} catch (error) {
					console.error('Fetch failed:', error);
					addToast({ type: 'error', message: 'Failed to fetch details' });
				} finally {
					setFetching(false);
				}
			};
			fetchSection();
		}
	}, [id, addToast]);

	const handleChange = e => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async e => {
		e.preventDefault();

		if (!form.section_Name.trim()) {
			addToast({ type: 'error', message: 'Section name is required' });
			return;
		}
		if (!form.department_Id) {
			addToast({ type: 'error', message: 'Please select a department' });
			return;
		}

		setLoading(true);
		try {
			const payload = {
				section_Name: form.section_Name.trim(),
				department_Id: Number(form.department_Id),
				section_Description: form.section_Description.trim() || null
			};

			if (id) {
				await http.post(API.SECTIONS.UPDATE(id), payload);
				addToast({ type: 'success', message: 'Section updated successfully' });
				setTimeout(() => navigate(-1), 500);
			} else {
				await http.post(API.SECTIONS.CREATE, payload);
				addToast({ type: 'success', message: 'Section created successfully' });
				navigate(ROUTES.SECTIONS);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({ type: 'error', message: 'Operation failed. Please try again.' });
		} finally {
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-10 text-center text-text-2 font-medium">Loading details...</div>;

	const departmentOptions = departments.map(dept => ({
		value: dept.department_Id,
		label: dept.department_Name
	}));

	return (
		<FormLayout
			title={id ? 'Edit Section' : 'Add Section'}
			backTo={ROUTES.SECTIONS}
			subtitle={id ? 'Update section details.' : 'Add a new section to the system.'}
			onSubmit={handleSubmit}
			formId="section-form"
			loading={loading}
			isEdit={Boolean(id)}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
					<Input
						label="Section Name"
						name="section_Name"
						id="section_Name"
						value={form.section_Name}
						onChange={handleChange}
						placeholder="e.g. Quality Control"
						required
					/>

					<Select
						label="Department"
						id="department_Id"
						name="department_Id"
						value={form.department_Id}
						onChange={handleChange}
						options={departmentOptions}
						placeholder="Select Department"
						required
					/>
				</div>

				<div className="flex flex-col gap-[8px]">
					<label htmlFor="section_Description" className="text-p2 font-semibold text-text-2">
						Description
					</label>
					<textarea
						id="section_Description"
						name="section_Description"
						value={form.section_Description}
						onChange={handleChange}
						rows={4}
						className="w-full rounded-[6px] border border-divider bg-card p-[10px] text-p1 text-text-1 outline-none focus:border-brand-light placeholder:text-text-disabled"
						placeholder="Provide a brief description..."
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddSection;
