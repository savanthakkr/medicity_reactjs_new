import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '../../../data/states/toastAtom';
import Input from '../../../components/common/Input';
import ROUTES from '../../../utils/constants/routes';
import { createZoneApi, updateZoneApi } from '../../../data/apis';
import { API } from '../../../data/apis';
import { getApiMessage, getErrorMessage, unwrapApiData } from '../../../utils/methods';
import { useAutoRevalidate } from '../../../hooks';
import FormLayout from '../../../components/common/FormLayout.jsx';

const AddZone = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const addToast = useSetAtom(addToastAtom);
	const isEdit = Boolean(id);

	const [zoneName, setZoneName] = useState('');
	const [loading, setLoading] = useState(false);

	const {
		data: zoneDetails,
		error: zoneError,
		loading: fetching
	} = useAutoRevalidate(isEdit ? API.ZONES.GET(id) : null);

	useEffect(() => {
		if (!isEdit) return;

		const zone = unwrapApiData(zoneDetails);
		if (zone) {
			// Normalize: trim + collapse internal multiple spaces to single space
			setZoneName((zone.zone_Name || '').trim().replace(/\s+/g, ' '));
		}
	}, [isEdit, zoneDetails]);

	useEffect(() => {
		if (!zoneError) return;

		addToast({
			type: 'error',
			message: getErrorMessage(zoneError, 'Failed to fetch zone details')
		});
	}, [addToast, zoneError]);

	const onSubmit = async event => {
		event.preventDefault();
		if (loading) return;

		const payload = { zone_Name: zoneName.trim().replace(/\s+/g, ' ') };
		setLoading(true);

		try {
			const response = isEdit ? await updateZoneApi(id, payload) : await createZoneApi(payload);

			addToast({
				type: 'success',
				message: getApiMessage(response, isEdit ? 'Zone updated successfully' : 'Zone created successfully')
			});

			setTimeout(() => {
				navigate(-1);
			}, 500);
		} catch (error) {
			addToast({
				type: 'error',
				message: getErrorMessage(error, 'Failed to save zone')
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<FormLayout
			title={isEdit ? 'Edit Zone' : 'Add Zone'}
			backTo={ROUTES.ZONES}
			subtitle={isEdit ? 'Update zone details.' : 'Add a new zone to the system.'}
			onSubmit={onSubmit}
			formId="zone-form"
			loading={loading || fetching}
			isEdit={isEdit}
		>
			<div className="flex flex-col gap-[23px]">
				<div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
					<Input
						label="Zone Name"
						id="zone_Name"
						name="zone_Name"
						placeholder="Enter Zone Name"
						value={zoneName}
						onChange={event => setZoneName(event.target.value)}
						required
					/>
				</div>
			</div>
		</FormLayout>
	);
};

export default AddZone;
