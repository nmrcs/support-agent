import { Tabs } from '@heroui/react'
import { type ReactNode } from 'react'
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import { UserMenu } from './components/UserMenu'
import { ChatScreen } from './screens/ChatScreen'
import { ConversationsScreen } from './screens/ConversationsScreen'
import { LoginScreen } from './screens/LoginScreen'
import { useSession } from './store/session'

const TABS = [
	{ id: 'chat', label: 'Chat' },
	{ id: 'conversations', label: 'Conversations' },
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
	const location = useLocation()
	const navigate = useNavigate()
	const currentTab =
		TABS.find((t) => location.pathname.startsWith(`/${t.id}`))?.id ?? 'chat'

	return (
		<div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
			<header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800">
				<div className="flex items-center gap-2.5">
					<AcmeMark className="size-5" />
					<span className="text-sm font-medium">Acme Support</span>
				</div>
				<UserMenu />
			</header>
			<nav className="px-6 border-b border-neutral-800">
				<Tabs
					variant="secondary"
					selectedKey={currentTab}
					onSelectionChange={(key) => navigate(`/${key}`)}
				>
					<Tabs.ListContainer className="border-0">
						<Tabs.List>
							{TABS.map((t) => (
								<Tabs.Tab key={t.id} id={t.id} className="py-5">
									{t.label}
									<Tabs.Indicator />
								</Tabs.Tab>
							))}
						</Tabs.List>
					</Tabs.ListContainer>
				</Tabs>
			</nav>
			<div className="flex-1 min-h-0">
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

// Placeholder mark for the demo store: a square with the bottom-right corner
// chamfered. Stroking it in the same colour with round joins softens the
// corners without a radius per vertex, and keeps the cut 45°.
export function AcmeMark({ className = 'size-11' }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			className={`text-neutral-100 ${className}`}
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
