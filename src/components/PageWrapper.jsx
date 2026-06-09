export default function PageWrapper({ children }) {
	return (
		<div className="min-h-full bg-background">
			<div className="mx-auto px-6 py-4">{children}</div>
		</div>
	);
}
