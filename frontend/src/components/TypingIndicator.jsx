export default function TypingIndicator() {
  return (
    <div className="msg-appear flex justify-start">
      <div className="flex gap-2.5">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold mt-0.5"
          style={{ background: 'var(--utc-green)' }}
        >
          UT
        </div>
        <div
          className="rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-0.5"
          style={{ background: 'var(--bg-bot-msg)' }}
        >
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}
