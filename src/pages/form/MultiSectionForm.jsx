import { useState } from 'react';
import http from '../../lib/axios/axios';

export default function MultiSectionForm() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		title: '',
		body: '',
		userId: '',
		tags: ''
	});

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async e => {
		e.preventDefault();

		const payload = {
			name: formData.name,
			email: formData.email,
			title: formData.title,
			body: formData.body,
			userId: parseInt(formData.userId),
			tags: formData.tags.split(',').map(tag => tag.trim())
		};

		try {
			const res = await http.post('/posts', payload);
			console.log('Submitted:', res);
			alert('Form submitted successfully!');
		} catch (err) {
			console.error('Error submitting form:', err);
			alert('Submission failed.');
		}
	};

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-md">
				<h2 className="text-2xl font-bold mb-6">Multi-Section Form</h2>

				<form onSubmit={handleSubmit} className="space-y-8">
					{/* Section 1: User Info */}
					<section>
						<h3 className="text-lg font-semibold mb-4">User Info</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Name</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="w-full px-3 py-2 border rounded-md"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Email</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									className="w-full px-3 py-2 border rounded-md"
									required
								/>
							</div>
						</div>
					</section>

					{/* Section 2: Post Details */}
					<section>
						<h3 className="text-lg font-semibold mb-4">Post Details</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Title</label>
								<input
									type="text"
									name="title"
									value={formData.title}
									onChange={handleChange}
									className="w-full px-3 py-2 border rounded-md"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Body</label>
								<textarea
									name="body"
									value={formData.body}
									onChange={handleChange}
									rows={4}
									className="w-full px-3 py-2 border rounded-md"
									required
								/>
							</div>
						</div>
					</section>

					{/* Section 3: Meta Info */}
					<section>
						<h3 className="text-lg font-semibold mb-4">Meta Info</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">User ID</label>
								<input
									type="number"
									name="userId"
									value={formData.userId}
									onChange={handleChange}
									className="w-full px-3 py-2 border rounded-md"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
								<input
									type="text"
									name="tags"
									value={formData.tags}
									onChange={handleChange}
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
						</div>
					</section>

					{/* Submit Button */}
					<div>
						<button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition">
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
