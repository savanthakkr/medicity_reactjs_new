import { getApiMessage } from './getApiMessage.js';

export function getErrorMessage(error, fallback = 'Something went wrong') {
	return getApiMessage(error, fallback);
}
