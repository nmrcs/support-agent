import { Avatar, Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/session'

export function UserMenu() {
	const navigate = useNavigate()
	const user = useSession((s) => s.user)
	const clearAuth = useSession((s) => s.clearAuth)

	function onLogout(): void {
		clearAuth()
		navigate('/auth/login', { replace: true })
	}

	if (!user) return null

	const initial = (user.name[0] ?? user.email[0] ?? '?').toUpperCase()

	return (
		<Button
			isIconOnly
			variant="ghost"
			onPress={onLogout}
			aria-label={`Logout (${user.email})`}
			className="group relative rounded-full"
		>
			<Avatar className="size-full">
				<Avatar.Fallback>{initial}</Avatar.Fallback>
			</Avatar>
			<span
				aria-hidden
				className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition"
			>
				<LogoutIcon />
			</span>
		</Button>
	)
}

function LogoutIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-neutral-100"
		>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	)
}
