const TypingIndicator: React.FC = () => {
    return <div className="flex">
        <img
            src="https://avatar.iran.liara.run/public"
            alt="User"
            className="size-8 rounded-full object-cover mr-2 ring-1 ring-ink/10 self-end"
        />
        <div className="bg-white border border-paper-line p-3 rounded-2xl rounded-bl-md flex items-center gap-1">
            <div className="size-1.5 bg-ink/30 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
            <div className="size-1.5 bg-ink/30 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="size-1.5 bg-ink/30 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
    </div>
}

export default TypingIndicator;
