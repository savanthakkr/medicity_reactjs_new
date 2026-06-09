/**
 * UI Scaling & Font Constants
 * Centralizes all custom scale properties for small, medium, and large text preferences
 */

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, 20, 50, 100];
export const DEFAULT_COMPACT_PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, 20, 50];

export const DASHBOARD_SCALES = {
	small: {
		'--dash-page-title': '20px',
		'--dash-section-title': '16px',
		'--dash-kpi-label': '12px',
		'--dash-kpi-value': '28px',
		'--dash-body': '10px',
		'--dash-caption': '10px',
		'--dash-pill': '10px',
		'--dash-big-percent': '38px',
		'--dash-donut-percent': '20px',
		'--dash-card-stat': '85px',
		'--dash-card-row1': '335px',
		'--dash-card-revtest': '270px',
		'--dash-card-members': '350px',
		'--dash-card-sample': '440px',
		'--dash-card-revover': '180px',
		'--dash-member-head': '33px',
		'--dash-donut-size': '96px',
		'--dash-rev-bar': '42px',
		'--dash-revover-value': '40px',
		'--dash-revover-label': '11px'
	},
	medium: {
		'--dash-page-title': '22px',
		'--dash-section-title': '18px',
		'--dash-kpi-label': '14px',
		'--dash-kpi-value': '30px',
		'--dash-body': '12px',
		'--dash-caption': '12px',
		'--dash-pill': '12px',
		'--dash-big-percent': '40px',
		'--dash-donut-percent': '22px',
		'--dash-card-stat': '97px',
		'--dash-card-row1': '370px',
		'--dash-card-revtest': '300px',
		'--dash-card-members': '390px',
		'--dash-card-sample': '491px',
		'--dash-card-revover': '199px',
		'--dash-member-head': '37px',
		'--dash-donut-size': '106px',
		'--dash-rev-bar': '47px',
		'--dash-revover-value': '44px',
		'--dash-revover-label': '12px'
	},
	large: {
		'--dash-page-title': '24px',
		'--dash-section-title': '20px',
		'--dash-kpi-label': '16px',
		'--dash-kpi-value': '32px',
		'--dash-body': '14px',
		'--dash-caption': '14px',
		'--dash-pill': '14px',
		'--dash-big-percent': '42px',
		'--dash-donut-percent': '24px',
		'--dash-card-stat': '110px',
		'--dash-card-row1': '410px',
		'--dash-card-revtest': '335px',
		'--dash-card-members': '440px',
		'--dash-card-sample': '550px',
		'--dash-card-revover': '225px',
		'--dash-member-head': '42px',
		'--dash-donut-size': '116px',
		'--dash-rev-bar': '53px',
		'--dash-revover-value': '48px',
		'--dash-revover-label': '13px'
	}
};

export const DOCTOR_PAGE_SCALES = {
	small: {
		'--doctor-title': '14px',
		'--doctor-filter-label': '9px',
		'--doctor-filter-text': '10px',
		'--doctor-table-text': '10px',
		'--doctor-footer-text': '10px',
		'--doctor-add-text': '10px'
	},
	medium: {
		'--doctor-title': '16px',
		'--doctor-filter-label': '10px',
		'--doctor-filter-text': '12px',
		'--doctor-table-text': '12px',
		'--doctor-footer-text': '12px',
		'--doctor-add-text': '12px'
	},
	large: {
		'--doctor-title': '18px',
		'--doctor-filter-label': '11px',
		'--doctor-filter-text': '14px',
		'--doctor-table-text': '14px',
		'--doctor-footer-text': '14px',
		'--doctor-add-text': '14px'
	}
};

export const ENTITY_PAGE_SCALES = {
	small: {
		'--entity-title': '14px',
		'--entity-table-text': '10px',
		'--entity-add-text': '10px',
		'--doctor-title': '14px',
		'--doctor-filter-label': '9px',
		'--doctor-filter-text': '10px',
		'--doctor-table-text': '10px',
		'--doctor-footer-text': '10px',
		'--doctor-add-text': '10px'
	},
	medium: {
		'--entity-title': '16px',
		'--entity-table-text': '12px',
		'--entity-add-text': '12px',
		'--doctor-title': '16px',
		'--doctor-filter-label': '10px',
		'--doctor-filter-text': '12px',
		'--doctor-table-text': '12px',
		'--doctor-footer-text': '12px',
		'--doctor-add-text': '12px'
	},
	large: {
		'--entity-title': '18px',
		'--entity-table-text': '14px',
		'--entity-add-text': '14px',
		'--doctor-title': '18px',
		'--doctor-filter-label': '11px',
		'--doctor-filter-text': '14px',
		'--doctor-table-text': '14px',
		'--doctor-footer-text': '14px',
		'--doctor-add-text': '14px'
	}
};

export const SHARE_TYPE_SCALES = {
	small: {
		'--entity-title': '14px',
		'--entity-add-text': '10px',
		'--entity-table-header': '10px',
		'--entity-table-row': '10px'
	},
	medium: {
		'--entity-title': '16px',
		'--entity-add-text': '12px',
		'--entity-table-header': '12px',
		'--entity-table-row': '12px'
	},
	large: {
		'--entity-title': '18px',
		'--entity-add-text': '14px',
		'--entity-table-header': '14px',
		'--entity-table-row': '14px'
	}
};

export const FORM_SCALES = {
	small: { '--form-title': '14px', '--form-label': '10px', '--form-input': '11px', '--form-btn': '11px' },
	medium: { '--form-title': '16px', '--form-label': '12px', '--form-input': '13px', '--form-btn': '13px' },
	large: { '--form-title': '18px', '--form-label': '14px', '--form-input': '15px', '--form-btn': '15px' }
};
