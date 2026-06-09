/**Add commentMore actions
 * Util functions to set and get DataInBrowsers expired set for 3 days
 * Example of use:
 *
 * setDataInBrowser("user_email","bobthegreat@gmail.com",30); //set "user_email" DataInBrowser, expires in 30 days
 * var userEmail=getDataInBrowser("user_email");//"bobthegreat@gmail.com"
 */

export const setDataInBrowser = (name, value, days = Number.MAX_SAFE_INTEGER, persist = true) => {
	const timestamp = new Date().getTime();
	const twoDaysInMilliseconds = days * 24 * 60 * 60 * 1000;
	const expiration = timestamp + twoDaysInMilliseconds;
	const dataWithExpiration = {
		value,
		expiration
	};
	const storage = persist ? localStorage : sessionStorage;
	storage.setItem(name, JSON.stringify(dataWithExpiration));
};

/**
 *
 * @param {String} name
 * @returns
 */

export const getDataInBrowser = name => {
	const item = localStorage.getItem(name) || sessionStorage.getItem(name);
	if (!item) return null;

	const dataWithExpiration = JSON.parse(item);
	if (dataWithExpiration && dataWithExpiration.expiration > new Date().getTime()) {
		return dataWithExpiration.value;
	} else {
		localStorage.removeItem(name);
		sessionStorage.removeItem(name);
		return null;
	}
};

export const removeDataInBrowser = name => {
	localStorage.removeItem(name);
	sessionStorage.removeItem(name);
};
