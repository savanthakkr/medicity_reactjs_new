import http from './axios.js';

// ✅ Set global configuration: recommended at app init
http.setConfig({
	baseURL: 'https://api.example.com',
	headers: { Authorization: 'Bearer token' },
	cacheTTLinMs: 3000 // Cache GETs for 3 seconds globally
});

/**
 * GET - Fetch data that can be cached (e.g., dashboard stats, lists)
 */
async function fetchUsers() {
	const users = await http.get('/users');
	console.log('Fetched users:', users);
}

/**
 * GET with custom cache TTL - override global setting for real-time needs
 */
async function fetchNotifications() {
	const notifications = await http.get('/notifications', { cacheTTLinMs: 10000 }); // 10s cache
	console.log('Fetched notifications:', notifications);
}

/**
 * POST - Create new resources (e.g., user, product, comment)
 */
async function createUser() {
	const user = await http.post('/users', { name: 'Alice' });
	console.log('Created user:', user);
}

/**
 * PUT - Completely update existing resources (e.g., full user profile)
 */
async function updateUser() {
	const updated = await http.put('/users/42', { name: 'Updated User' });
	console.log('Updated user:', updated);
}

/**
 * PATCH - Partially update resources (e.g., change user role)
 */
async function patchUser() {
	const patched = await http.patch('/users/42', { role: 'editor' });
	console.log('Patched user:', patched);
}

/**
 * DELETE - Remove resources permanently (e.g., delete a user or item)
 */
async function deleteUser() {
	const res = await http.delete('/users/42');
	console.log('Deleted user response:', res);
}

/**
 * UPLOAD - Upload files with FormData (e.g., profile picture, attachments)
 */
async function uploadProfilePic(file) {
	const formData = new FormData();
	formData.append('avatar', file);
	const res = await http.upload('/users/42/avatar', formData);
	console.log('Uploaded avatar:', res);
}

/**
 * clearCache - Use after mutations to remove outdated GET cache
 */
function clearUsersCache() {
	http.clearCache('/users');
}

/**
 * revalidate - Re-fetch fresh data and update GET cache manually (useful after POST/PUT/DELETE)
 */
async function refreshUsers() {
	const fresh = await http.revalidate('/users');
	console.log('Refreshed users:', fresh);
}
