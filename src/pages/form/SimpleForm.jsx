import { useState } from 'react';
import http from '../../lib/axios/axios';

export default function SimpleForm() {
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

	const handleSubmit = async e => {
		e.preventDefault();

		const payload = {
			title: formData.title,
			body: formData.body,
			userId: parseInt(formData.userId)
		};

		try {
			const post = await http.post('https://jsonplaceholder.typicode.com/post', payload);
			console.log('Created post:', post);
			alert('Post created successfully!');
		} catch (error) {
			console.error('Error creating post:', error);
			alert(error);
		}
	};

	return (
		<div className="min-h-screen bg-background py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-card shadow-sm rounded-lg">
					<div className="px-6 py-8">
						<h1 className="text-3xl font-bold text-card-foreground mb-2">Form</h1>
						<p className="text-muted-foreground mb-8">Customize your application layout and preferences</p>

						<form onSubmit={handleSubmit} className="space-y-6">
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

							<div>
								<label className="block text-sm font-medium mb-1">Body</label>
								<textarea
									name="body"
									value={formData.body}
									onChange={handleChange}
									className="w-full px-3 py-2 border rounded-md shadow-sm"
									rows={4}
									required
								/>
							</div>

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

							<button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">
								Submit Post
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
