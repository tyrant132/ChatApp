import type React from "react";
import { EllipsisVertical, X } from "lucide-react";
import { useConversationStore } from "../../stores/conversationStore";

const ChatHeader: React.FC = () => {
    const { selectedConversation, setSelectedConversation } = useConversationStore();

    return <div className="px-6 py-4 border-b border-paper-line bg-paper flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <img src="https://avatar.iran.liara.run/public" alt="User image" className="size-10 rounded-full object-cover ring-1 ring-ink/10"/>
            <div>
                <h2 className="font-medium text-ink">{selectedConversation?.friend?.username}</h2>
                <p className={`text-xs ${selectedConversation?.friend.online ? 'text-teal' : 'text-ink/40'}`}>
                    {selectedConversation?.friend.online ? 'Online' : 'Offline'}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 cursor-pointer transition-colors">
                <EllipsisVertical className="size-[16px]"/>
            </button>
            <button onClick={() => setSelectedConversation(null)} className="sm:hidden p-2 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 cursor-pointer transition-colors">
                <X className="size-4"/>
            </button>
        </div>
    </div>
}

export default ChatHeader;
