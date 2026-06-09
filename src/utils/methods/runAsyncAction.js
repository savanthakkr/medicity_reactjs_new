export async function runAsyncAction({ action, setLoading, onSuccess, onError, onFinally }) {
	try {
		setLoading?.(true);

		const result = await action();

		await onSuccess?.(result);
		return { result, error: null };
	} catch (error) {
		await onError?.(error);
		return { result: null, error };
	} finally {
		setLoading?.(false);
		await onFinally?.();
	}
}
