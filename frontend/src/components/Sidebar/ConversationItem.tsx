import type React from "react";
import type { Conversation } from "../../contexts/ConversationsContext";
import { useAuthStore } from "../../stores/authStore";
import { useConversationStore } from "../../stores/conversationStore";

const ConversationItem: React.FC<Conversation> = ({
    conversationId, friend, unreadCounts, lastMessage
}) => {
    const { user } = useAuthStore();
    const {selectedConversation, setSelectedConversation} = useConversationStore();
    const unreadMessages = () => unreadCounts[user?.id ?? ''] > 0 || unreadCounts[friend.id] > 0;
    let displayTime = '';

    const isSelected = selectedConversation?.conversationId === conversationId;

    if (lastMessage?.timestamp) {
        const createdAt = new Date(lastMessage.timestamp);
        const now = new Date();

        const diffInMs = now.getTime() - createdAt.getTime();
        const diffInDays = diffInMs / (60 * 60 * 24 * 1000)

        const time = createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })

        const date = createdAt.toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
        })

        displayTime = diffInDays >= 1 ? `${date} ${time}` : time;
    }

    return <div
        className={`
            mx-3 my-0.5 px-3 py-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors border-l-2
            ${isSelected ? 'bg-white/[0.06] border-teal' : 'border-transparent hover:bg-white/[0.04]'}
        `}
        onClick={() => {
            if (isSelected) {
                setSelectedConversation(null)
            } else {
                setSelectedConversation({conversationId, friend, lastMessage, unreadCounts})
            }
        }}
    >
        <div className="relative shrink-0">
            <img
                src="https://avatar.iran.liara.run/public"
                alt="User"
                className="size-10 rounded-full object-cover ring-1 ring-white/10"
            />
            <div
             className={`
                absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-ink
                ${friend.online ? "bg-teal" : "bg-paper/25"}
            `}
            ></div>
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <h2 className="font-medium truncate text-sm text-paper">{friend.username}</h2>
                {lastMessage?.timestamp && (
                    <span className="text-xs text-paper/35">{displayTime}</span>
                )}
            </div>

            <div className="flex items-center">
                <p
                    className={
                        unreadMessages() ? 'text-sm text-paper/45 truncate min-h-[20px]' : 'text-sm text-paper/70 truncate min-h-[20px]'
                    }
                >
                    {lastMessage?.content ?? ''}
                </p>
                {user && unreadCounts[user.id] > 0 && (
                    <div className="bg-gold ml-2 text-[11px] font-medium text-ink rounded-full size-5 flex items-center justify-center flex-shrink-0">
                        {unreadCounts[user.id]}
                    </div>
                )}
            </div>
        </div>
    </div>
}

export default ConversationItem;
