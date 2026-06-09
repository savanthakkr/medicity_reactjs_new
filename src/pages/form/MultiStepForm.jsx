import { useState } from 'react';
import http from '../../lib/axios/axios';

export default function MultiStepForm() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		title: '',
		body: '',
		userId: ''
	});

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const nextStep = () => {
		if (step < 3) setStep(step + 1);
	};

	const prevStep = () => {
		if (step > 1) setStep(step - 1);
	};

	const handleSubmit = async e => {
		e.preventDefault();

		try {
			const payload = {
				title: formData.title,
				body: formData.body,
				userId: parseInt(formData.userId)
			};

			const response = await http.post('/posts', payload);
			console.log('Created post:', response);
			alert('Post submitted successfully!');
		} catch (err) {
			console.error('Submission error:', err);
			alert('Failed to submit post.');
		}
	};

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="max-w-xl mx-auto bg-card rounded-lg shadow-md p-8">
				<h2 className="text-2xl font-bold mb-6">Multi-Step Form</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
					{step === 1 && (
						<div>
							<label className="block text-sm font-medium mb-1">Title</label>
							<input
								type="text"
								name="title"
								value={formData.title}
								onChange={handleChange}
								className="w-full px-3 py-2 border rounded-md shadow-sm"
								required
							/>
						</div>
					)}

					{step === 2 && (
						<div>
							<label className="block text-sm font-medium mb-1">Body</label>
							<textarea
								name="body"
								value={formData.body}
								onChange={handleChange}
								rows={4}
								className="w-full px-3 py-2 border rounded-md shadow-sm"
								required
							/>
						</div>
					)}

					{step === 3 && (
						<div>
							<label className="block text-sm font-medium mb-1">User ID</label>
							<input
								type="number"
								name="userId"
								value={formData.userId}
								onChange={handleChange}
								className="w-full px-3 py-2 border rounded-md shadow-sm"
								required
							/>
						</div>
					)}

					<div className="flex justify-between">
						{step > 1 && (
							<button type="button" onClick={prevStep} className="bg-gray-300 text-black px-4 py-2 rounded">
								Back
							</button>
						)}

						{step < 3 ? (
							<button type="button" onClick={nextStep} className="bg-primary text-white px-4 py-2 rounded">
								Next
							</button>
						) : (
							<button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
								Submit
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
