import { Avatar, Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../store/session'
import { LogoutIcon } from './Icons'

export function UserMenu() {
	const navigate = useNavigate()
	const user = useSession((s) => s.user)
	const clearAuth = useSession((s) => s.clearAuth)

	if (!user) return null

	const initial = (user.name[0] ?? user.email[0] ?? '?').toUpperCase()

	return (
		<Button
			isIconOnly
			variant="ghost"
			aria-label={`Logout (${user.email})`}
			onPress={() => {
				clearAuth()
				navigate('/auth/login', { replace: true })
			}}
			className="group relative rounded-full"
		>
			<Avatar className="size-8">
				<Avatar.Fallback className="text-xs">{initial}</Avatar.Fallback>
			</Avatar>
			<span
				aria-hidden
				className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/70 text-background opacity-0 transition group-hover:opacity-100"
			>
				<LogoutIcon className="size-4" />
			</span>
		</Button>
	)
}
