export function UserMessage({ text }: { text: string }) {
	return (
		<div className="flex justify-end">
			<div className="max-w-[85%] rounded-2xl bg-neutral-800/70 px-4 py-2.5 text-sm text-neutral-100">
				<p className="whitespace-pre-wrap">{text}</p>
			</div>
		</div>
	)
}
