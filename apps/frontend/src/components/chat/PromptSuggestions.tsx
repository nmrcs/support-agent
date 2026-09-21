import { Button } from '@heroui/react'

const SUGGESTIONS = [
	'Hi! What can you do?',
	'Where is my order 1001?',
	'How much is delivery?',
	'I want to talk to a human',
]

export function PromptSuggestions({
	onPick,
}: {
	onPick: (text: string) => void
}) {
	return (
		<div className="pt-16">
			<h2 className="text-xl font-semibold text-neutral-100">
				What do you want to check?
			</h2>
			<p className="mt-1 text-sm text-neutral-500">
				Ask a question or start from one of the suggestions below.
			</p>
			<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
				{SUGGESTIONS.map((text) => (
					<Button
						key={text}
						variant="outline"
						onPress={() => onPick(text)}
						className="group h-auto w-full justify-between rounded-2xl px-4 py-4 text-left text-sm font-normal text-neutral-200"
					>
						{text}
						<ArrowIcon />
					</Button>
				))}
			</div>
		</div>
	)
}

function ArrowIcon() {
	return (
		<svg
			fill="none"
			height="16"
			viewBox="0 0 16 16"
			width="16"
			xmlns="http://www.w3.org/2000/svg"
			className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
			aria-hidden
		>
			<path
				clipRule="evenodd"
				d="M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0"
				fill="currentColor"
				fillRule="evenodd"
			/>
		</svg>
	)
}
