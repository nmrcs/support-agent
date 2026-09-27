import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			width="1em"
			height="1em"
			{...props}
		>
			{children}
		</svg>
	)
}

export const ChatIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4 3.5v-3.5h-.5a2 2 0 0 1-2-2z" />
		<path d="M8.5 9.5h7M8.5 12.5h4.5" />
	</Icon>
)

export const InboxIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M4.5 13.5 6.8 5.8a1.5 1.5 0 0 1 1.4-1h7.6a1.5 1.5 0 0 1 1.4 1l2.3 7.7v4.2a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5z" />
		<path d="M4.5 13.5h4l1 2h5l1-2h4" />
	</Icon>
)

export const ArrowUpIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M12 19V5M6 11l6-6 6 6" />
	</Icon>
)

export const ChevronRightIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="m9.5 6 6 6-6 6" />
	</Icon>
)

export const RestartIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" />
		<path d="M4.5 4.5V9H9" />
	</Icon>
)

export const LogoutIcon = (p: IconProps) => (
	<Icon {...p}>
		<path d="M9.5 20H6a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 6 4h3.5" />
		<path d="m15.5 16 4-4-4-4M19.5 12h-10" />
	</Icon>
)

// Placeholder mark for the demo shop: a square with the bottom-right corner
// cut at 45°. The stroke in the same colour rounds the corners.
export function AcmeMark({ className = 'size-5' }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			fill="currentColor"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinejoin="round"
			role="img"
			aria-label="Acme"
		>
			<path d="M4 4h16v11l-5 5H4Z" />
		</svg>
	)
}
