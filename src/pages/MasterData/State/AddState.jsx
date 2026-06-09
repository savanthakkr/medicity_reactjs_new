import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import { API } from '../../../data/apis/endpoints';
import ROUTES from '../../../utils/constants/routes';
import http from '../../../lib/axios/axios';
import FormLayout from '../../../components/common/FormLayout.jsx';
import { validatePlaceName } from '../../../utils/methods/validations.js';

const AddState = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const [stateName, setStateName] = useState('');
	const [nameError, setNameError] = useState('');
	const [loading, setLoading] = useState(false);
	const isEdit = Boolean(id);

	useEffect(() => {
		if (isEdit) {
			const fetchState = async () => {
				try {
					const response = await http.post(API.STATES.GET(id));
					if (response?.data) {
						setStateName(response.data.state_Name || '');
					}
				} catch (error) {
					console.error('Failed to fetch state:', error);
					const apiMessage = error?.response?.data?.msg || error?.response?.data?.message;
					addToast({ type: 'error', message: apiMessage || 'Failed to fetch state details' });
				}
			};
			fetchState();
		}
	}, [id, isEdit, addToast]);

	const onSubmit = async e => {
		e.preventDefault();
		if (loading) return;
		const err = validatePlaceName(stateName, 'State Name');
		if (err) {
			setNameError(err);
			return;
		}
		setNameError('');
		setLoading(true);
		try {
			if (isEdit) {
				const res = await http.post(API.STATES.UPDATE(id), { state_Name: stateName });
				addToast({ type: 'success', message: res?.data?.msg || 'State updated successfully' });
				setTimeout(() => {
					navigate(-1);
				}, 500);
			} else {
				const res = await http.post(API.STATES.CREATE, { state_Name: stateName });
				addToast({ type: 'success', message: res?.data?.msg || 'State created successfully' });
				setStateName(''); // Clear field after success
				setTimeout(() => {
					navigate(-1);
				}, 500);
			}
		} catch (error) {
			console.error('Save failed:', error);
			addToast({
				type: 'error',
				message: error?.response?.data?.msg || error?.response?.data?.message || 'Failed to save state'
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit State' : 'Add State'}
			backTo={ROUTES.STATES}
			subtitle={isEdit ? 'Update state details.' : 'Add a new state to the system.'}
			onSubmit={onSubmit}
			formId="state-form"
			loading={loading}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="State Name"
						id="stateName"
						placeholder="Enter State Name"
						value={stateName}
						onChange={e => {
							setStateName(e.target.value);
							setNameError('');
						}}
						error={nameError}
						required
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddState;
