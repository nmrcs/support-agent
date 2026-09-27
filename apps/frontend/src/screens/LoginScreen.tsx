import { Alert, Button, Card, Input, Label, TextField } from '@heroui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'
import { AcmeMark } from '../components/Icons'
import { useSession } from '../store/session'

export function LoginScreen() {
	const navigate = useNavigate()
	const setAuth = useSession((s) => s.setAuth)
	const [email, setEmail] = useState(
		import.meta.env.DEV ? 'alice@example.com' : '',
	)
	const [password, setPassword] = useState(import.meta.env.DEV ? 'demo' : '')
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	async function submit(e: React.FormEvent): Promise<void> {
		e.preventDefault()
		if (!email || !password || submitting) return
		setSubmitting(true)
		setError(null)
		try {
			const res = await login(email, password)
			setAuth(res.user, res.accessToken)
			navigate('/', { replace: true })
		} catch {
			setError('Wrong email or password')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="flex min-h-dvh w-full flex-col items-center justify-center gap-8 px-4">
			<AcmeMark className="size-10" />
			<Card className="w-full max-w-sm gap-6 p-7">
				<Card.Header className="gap-2">
					<Card.Title className="font-display text-2xl leading-tight">
						Login to your account
					</Card.Title>
					<Card.Description>
						Enter your email below to login to your account
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<form
						id="login-form"
						onSubmit={submit}
						className="flex flex-col gap-5"
					>
						<TextField
							type="email"
							value={email}
							onChange={setEmail}
							isRequired
						>
							<Label>Email</Label>
							<Input placeholder="alice@example.com" autoComplete="email" />
						</TextField>
						<TextField
							type="password"
							value={password}
							onChange={setPassword}
							isRequired
						>
							<Label>Password</Label>
							<Input autoComplete="current-password" />
						</TextField>
						{error && (
							<Alert status="danger">
								<Alert.Indicator />
								<Alert.Content>
									<Alert.Description>{error}</Alert.Description>
								</Alert.Content>
							</Alert>
						)}
					</form>
				</Card.Content>
				<Card.Footer>
					<Button
						type="submit"
						form="login-form"
						fullWidth
						isPending={submitting}
					>
						Login
					</Button>
				</Card.Footer>
			</Card>
		</div>
	)
}
