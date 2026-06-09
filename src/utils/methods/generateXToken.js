export const generateXToken = async postData => {
	const secret = import.meta.env.VITE_X_TOKEN_SECRET?.trim() || '';
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);
	const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
	const message = encoder.encode(JSON.stringify(postData));
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
	return Array.from(new Uint8Array(signature))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
};
