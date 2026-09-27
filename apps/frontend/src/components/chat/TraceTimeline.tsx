import { Disclosure } from '@heroui/react'
import type { TraceStep, TurnTrace } from '@support-agent/contracts'

export function TraceTimeline({ trace }: { trace: TurnTrace }) {
	if (trace.steps.length === 0 && !trace.escalationReason) return null

	const totalMs = trace.steps.reduce((sum, s) => sum + s.latencyMs, 0)

	return (
		<Disclosure>
			<Disclosure.Heading>
				<Disclosure.Trigger className="tabular inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-foreground">
					Trace · {trace.steps.length}{' '}
					{trace.steps.length === 1 ? 'step' : 'steps'} ·{' '}
					{formatElapsed(totalMs)}
					<Disclosure.Indicator className="size-3.5" />
				</Disclosure.Trigger>
			</Disclosure.Heading>
			<Disclosure.Content>
				<Disclosure.Body>
					<ol className="mt-3 flex flex-col gap-3 border-l border-separator pl-4">
						{trace.steps.map((step, i) => (
							<Step key={i} step={step} />
						))}
						{trace.escalationReason && (
							<li className="relative">
								<span
									aria-hidden
									className="absolute top-1.5 -left-5.25 size-2 rounded-full bg-warning"
								/>
								<div className="text-xs text-muted">Escalation</div>
								<div className="mt-0.5 text-sm text-warning">
									{trace.escalationReason}
								</div>
							</li>
						)}
						<li className="relative">
							<span
								aria-hidden
								className="absolute top-1.5 -left-5.25 size-2 rounded-full bg-default"
							/>
							<div className="text-xs text-muted">Tokens</div>
							<div className="tabular mt-0.5 font-mono text-xs">
								{trace.usage.promptTokens} in · {trace.usage.completionTokens}{' '}
								out
							</div>
						</li>
					</ol>
				</Disclosure.Body>
			</Disclosure.Content>
		</Disclosure>
	)
}

function Step({ step }: { step: TraceStep }) {
	return (
		<li className="relative">
			<span
				aria-hidden
				className={`absolute top-1.5 -left-5.25 size-2 rounded-full ${step.ok ? 'bg-success' : 'bg-danger'}`}
			/>
			<div className="flex items-baseline justify-between gap-2 text-xs text-muted">
				<span>
					{step.kind === 'llm' ? 'Model' : 'Tool'}
					{step.kind === 'tool' && (
						<span className="ml-1 font-mono text-foreground">{step.name}</span>
					)}
				</span>
				<span className="tabular font-mono">
					{formatElapsed(step.latencyMs)}
				</span>
			</div>
			{step.detail && (
				<div className="mt-0.5 font-mono text-xs break-all text-muted">
					{step.detail}
				</div>
			)}
		</li>
	)
}

function formatElapsed(ms: number): string {
	return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}
