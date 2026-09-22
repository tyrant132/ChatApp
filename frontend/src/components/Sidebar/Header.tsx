import { Contact, Inbox, Settings } from "lucide-react";
import { useState } from "react";
import AddConversationModal from "./AddConversationModal";
import SettingsModal from "./SettingsModal.tsx";
import FriendRequestsModal from "./FriendRequestsModal";
import { useFriendRequestsContext } from "../../contexts/FriendRequestsContext";

const Header: React.FC = () => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);

    const { incoming } = useFriendRequestsContext();

    return <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-paper tracking-tight">Chatty</h1>
        <div className="flex space-x-1">
            <button
                onClick={() => setIsAddOpen(true)}
                className="p-2 rounded-lg text-paper/60 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Add conversation"
            >
                <Contact className="size-[18px]"/>
            </button>
            <button
                onClick={() => setIsRequestsOpen(true)}
                className="relative p-2 rounded-lg text-paper/60 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Friend requests"
            >
                <Inbox className="size-[18px]"/>
                {incoming.length > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-gold rounded-full text-[10px] leading-4 text-ink font-medium text-center">
                        {incoming.length}
                    </span>
                )}
            </button>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg text-paper/60 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Settings"
            >
                <Settings className="size-[18px]"/>
            </button>
        </div>
        <AddConversationModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
        />
        <FriendRequestsModal
            isOpen={isRequestsOpen}
            onClose={() => setIsRequestsOpen(false)}
        />
        <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
        />
    </div>
}

export default Header;
