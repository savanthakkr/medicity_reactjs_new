/**
 * Central place for all field character / word limits.
 * Import these wherever you apply maxLength or validate field length.
 */
export const FIELD_LIMITS = {
	// Name / text fields
	EMPLOYEE_NAME: 150,
	DOCTOR_NAME: 100,
	EMAIL: 150,

	// Leave type
	LEAVE_TYPE_NAME: 150,
	LEAVE_TYPE_DESCRIPTION: 255,

	// Code / identifier fields
	MOBILE: 10,
	PIN_CODE: 6,
	PAN: 10,
	PASSPORT: 8,
	ESI: 17,
	EPF: 20,
	IFSC: 11,

	// Textarea / long-text fields
	COMMENTS: 250,
	REJECT_REASON: 150,
	DESCRIPTION: 500
};

/** "You cannot enter more than X characters." */
export const charLimitMsg = limit => `You cannot enter more than ${limit} characters.`;

/** "Maximum X words allowed." */
export const wordLimitMsg = limit => `Maximum ${limit} words allowed.`;
