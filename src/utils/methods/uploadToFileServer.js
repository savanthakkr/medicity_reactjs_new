const FILE_SERVER_URL = 'https://files.medicity.redoq.host/upload';

/**
 * Uploads a single File object to the Medicity file server.
 * Returns { url, name } on success. Throws on failure.
 * @param {File} file
 * @returns {Promise<{ url: string, name: string }>}
 */
export async function uploadToFileServer(file) {
	const formData = new FormData();
	formData.append('file', file);
	const res = await fetch(FILE_SERVER_URL, { method: 'POST', body: formData });
	const json = await res.json();
	if (!json.success || !json.url) throw new Error('Upload failed');
	return { url: json.url, name: file.name };
}
