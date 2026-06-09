import http from './../../lib/axios/axios';

export const downloadExcel = async ({ url, fileName = 'download.xlsx', payload = {} }) => {
	try {
		const response = await http.post(
			url,
			{
				inputData: payload
			},
			{
				responseType: 'arraybuffer'
			}
		);

		const blob = new Blob([response], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});

		const downloadUrl = window.URL.createObjectURL(blob);

		const link = document.createElement('a');

		link.href = downloadUrl;

		link.download = fileName;

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);

		window.URL.revokeObjectURL(downloadUrl);
	} catch (error) {
		console.error('Excel download failed:', error);
	}
};
