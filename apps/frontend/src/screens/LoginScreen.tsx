import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Label, Spinner, TextField } from '@heroui/react'
import { AcmeMark } from '../App'
import { login } from '../api/client'
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
		<div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 bg-neutral-950 px-4">
			<AcmeMark />
			<Card className="w-full max-w-md bg-transparent border border-neutral-800 shadow-none">
				<Card.Header className="px-5 pt-5 pb-4">
					<Card.Title className="text-xl/7 font-semibold tracking-tight text-neutral-50">
						Login to your account
					</Card.Title>
					<Card.Description className="text-sm/6 text-neutral-400 text-pretty">
						Enter your email below to login to your account
					</Card.Description>
				</Card.Header>
				<Card.Content className="px-5 py-4">
					<form
						id="login-form"
						onSubmit={submit}
						className="flex flex-col gap-5"
					>
						<TextField
							variant="secondary"
							type="email"
							value={email}
							onChange={setEmail}
							isRequired
						>
							<Label className="text-sm/6 font-medium text-neutral-200">
								Email
							</Label>
							<Input placeholder="alice@example.com" autoComplete="email" />
						</TextField>
						<TextField
							variant="secondary"
							type="password"
							value={password}
							onChange={setPassword}
							isRequired
						>
							<Label className="text-sm/6 font-medium text-neutral-200">
								Password
							</Label>
							<Input autoComplete="current-password" />
						</TextField>
						{error && (
							<div className="text-sm/6 text-red-400" role="alert">
								{error}
							</div>
						)}
					</form>
				</Card.Content>
				<Card.Footer className="px-5 pt-4 pb-5">
					<Button
						type="submit"
						form="login-form"
						variant="primary"
						isPending={submitting}
						className="w-full"
					>
						{({ isPending }) =>
							isPending ? <Spinner color="current" size="sm" /> : 'Login'
						}
					</Button>
				</Card.Footer>
			</Card>
		</div>
	)
}
