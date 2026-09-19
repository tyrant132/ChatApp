import { useConversationsContext } from "../../contexts/ConversationsContext";
import ConversationItem from "./ConversationItem";

const Conversations: React.FC = () => {
    const {filteredConversations, isLoading, isError} = useConversationsContext();

    if (isLoading) {
        return <div className="flex-1 h-full flex items-center justify-center py-6">
            <div className="size-8 bg-white/10 rounded-full animate-pulse"></div>
        </div>
    }

    if (isError) {
        return <div className="px-5 py-4 text-sm text-paper/50">Something went wrong</div>
    }

    if (filteredConversations.length === 0) {
        return <div className="px-5 py-6 text-sm text-paper/35">No conversations yet</div>
    }

    return <div className="flex-1 overflow-y-auto py-1">
        {filteredConversations.map((conversation) => <ConversationItem key={conversation.conversationId} {...conversation} />)}
    </div>
}

export default Conversations;
