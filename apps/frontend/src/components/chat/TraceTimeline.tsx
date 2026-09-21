import { Disclosure } from '@heroui/react'
import type { TraceStep, TurnTrace } from '@support-agent/contracts'

export function TraceTimeline({ trace }: { trace: TurnTrace }) {
	if (trace.steps.length === 0 && !trace.escalationReason) return null

	const totalMs = trace.steps.reduce((sum, s) => sum + s.latencyMs, 0)

	return (
		<Disclosure>
			<Disclosure.Heading>
				<Disclosure.Trigger className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition">
					Trace · {trace.steps.length}{' '}
					{trace.steps.length === 1 ? 'step' : 'steps'} ·{' '}
					{formatElapsed(totalMs)}
					<Disclosure.Indicator className="size-3.5" />
				</Disclosure.Trigger>
			</Disclosure.Heading>
			<Disclosure.Content>
				<Disclosure.Body>
					<ol className="mt-2 flex flex-col gap-3 border-l border-neutral-800 pl-4">
						{trace.steps.map((step, i) => (
							<Step key={i} step={step} />
						))}
						{trace.escalationReason && (
							<li className="relative">
								<span
									aria-hidden
									className="absolute -left-5.25 top-1.5 size-2 rounded-full bg-amber-500"
								/>
								<div className="text-xs text-neutral-400">Escalation</div>
								<div className="mt-0.5 text-sm text-amber-400">
									{trace.escalationReason}
								</div>
							</li>
						)}
						<li className="relative">
							<span
								aria-hidden
								className="absolute -left-5.25 top-1.5 size-2 rounded-full bg-neutral-600"
							/>
							<div className="text-xs text-neutral-400">Tokens</div>
							<div className="mt-0.5 font-mono text-xs text-neutral-200">
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
				className={`absolute -left-5.25 top-1.5 size-2 rounded-full ${step.ok ? 'bg-emerald-500' : 'bg-red-500'}`}
			/>
			<div className="flex items-baseline justify-between gap-2 text-xs text-neutral-400">
				<span>
					{step.kind === 'llm' ? 'Model' : 'Tool'}
					{step.kind === 'tool' && (
						<span className="ml-1 font-mono text-neutral-300">{step.name}</span>
					)}
				</span>
				<span className="font-mono text-neutral-500">
					{formatElapsed(step.latencyMs)}
				</span>
			</div>
			{step.detail && (
				<div className="mt-0.5 font-mono text-xs text-neutral-500 break-all">
					{step.detail}
				</div>
			)}
		</li>
	)
}

function formatElapsed(ms: number): string {
	return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}
