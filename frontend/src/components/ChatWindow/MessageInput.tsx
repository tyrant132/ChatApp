import { Send } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useConversationStore } from "../../stores/conversationStore";
import { useSocketContext } from "../../contexts/SocketContext";
import { useRef, useState } from "react";

const MessageInput: React.FC = () => {
    const { user } = useAuthStore();
    const { selectedConversation } = useConversationStore();
    const { socket } = useSocketContext();
    const [message, setMessage] = useState('');

    const typingTimeoutRef = useRef<number | null>(null);
    const isTypingRef = useRef(false);

    const emitTyping = (isTyping: boolean) => {
        if (!socket || !user || !selectedConversation) return;

        socket.emit("conversation:typing", {
            userId: user.id,
            friendId: selectedConversation.friend.id,
            isTyping,
        })
        isTypingRef.current = isTyping;
    }

    if (!selectedConversation) return;

    const handleSendMessage = () => {
        if (message.trim() === '' || !user || !socket) return;

        socket.emit("conversation:send-message", {
            conversationId: selectedConversation.conversationId,
            userId: user.id,
            friendId: selectedConversation.friend.id,
            content: message.trim(),
        })

        setMessage('');

        if (isTypingRef.current) {
            emitTyping(false);
        }
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        if (!isTypingRef.current) {
            emitTyping(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitTyping(false);
        }, 500)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }

    return <div className="p-4 border-t border-paper-line bg-paper">
        <div className="flex items-end gap-3">
            <div className="flex-1">
                <textarea
                    placeholder="Write a message"
                    rows={1}
                    className="w-full text-sm bg-white border border-paper-line rounded-xl py-3 px-4 focus:outline-none focus:border-teal/60 resize-none text-ink placeholder-ink/35"
                    value={message}
                    onChange={(e) => handleOnChange(e)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <button
                onClick={handleSendMessage}
                type="button"
                disabled={message.trim() === ''}
                className="bg-teal text-paper rounded-lg size-11 flex items-center justify-center hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
                aria-label="Send message"
            >
                <Send className="size-[16px]"/>
            </button>
        </div>
    </div>
}

export default MessageInput;
