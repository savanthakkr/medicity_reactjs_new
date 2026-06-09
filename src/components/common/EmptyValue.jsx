/**
 * Renders a consistent placeholder for blank/empty field values.
 * Use this everywhere a field has no data instead of "—", "N/A", or leaving blank.
 */
const EmptyValue = () => <span className="italic text-text-3">—</span>;

export default EmptyValue;
