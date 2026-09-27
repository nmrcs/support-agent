import { Button } from '@heroui/react'
import { type ReactNode } from 'react'
import {
	Link,
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import { AcmeMark, ChatIcon, InboxIcon } from './components/Icons'
import { UserMenu } from './components/UserMenu'
import { ChatScreen } from './screens/ChatScreen'
import { ConversationsScreen } from './screens/ConversationsScreen'
import { LoginScreen } from './screens/LoginScreen'
import { useSession } from './store/session'

const SECTIONS = [
	{ path: '/chat', label: 'Chat', icon: ChatIcon },
	{ path: '/conversations', label: 'Conversations', icon: InboxIcon },
] as const

export function App() {
	return (
		<Routes>
			<Route path="/auth/login" element={<LoginScreen />} />
			<Route
				path="/*"
				element={
					<PrivateRoute>
						<AppShell />
					</PrivateRoute>
				}
			/>
		</Routes>
	)
}

function PrivateRoute({ children }: { children: ReactNode }) {
	const accessToken = useSession((s) => s.accessToken)
	if (!accessToken) return <Navigate to="/auth/login" replace />
	return <>{children}</>
}

function AppShell() {
	const { pathname } = useLocation()
	const navigate = useNavigate()

	return (
		<div className="flex h-dvh flex-col">
			<header className="h-16 shrink-0 border-b border-separator bg-background">
				<div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
					<Link to="/chat" aria-label="Acme Support">
						<AcmeMark className="size-8" />
					</Link>
					<div className="flex items-center gap-1">
						{SECTIONS.map(({ path, label, icon: Icon }) => {
							const active = pathname.startsWith(path)
							return (
								<Button
									key={path}
									variant={active ? 'secondary' : 'ghost'}
									aria-current={active ? 'page' : undefined}
									aria-label={label}
									onPress={() => navigate(path)}
								>
									<Icon className="size-5" />
									<span className="hidden sm:inline">{label}</span>
								</Button>
							)
						})}
						<span aria-hidden className="mx-2 h-6 w-px bg-separator" />
						<UserMenu />
					</div>
				</div>
			</header>
			<div className="min-h-0 flex-1">
				<Routes>
					<Route path="/" element={<Navigate to="/chat" replace />} />
					<Route path="/chat" element={<ChatScreen />} />
					<Route path="/conversations" element={<ConversationsScreen />} />
					<Route path="*" element={<Navigate to="/chat" replace />} />
				</Routes>
			</div>
		</div>
	)
}
