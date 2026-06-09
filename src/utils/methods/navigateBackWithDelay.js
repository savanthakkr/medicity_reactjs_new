export function navigateBackWithDelay(navigate, delay = 500, target = -1) {
	return setTimeout(() => {
		navigate(target);
	}, delay);
}
