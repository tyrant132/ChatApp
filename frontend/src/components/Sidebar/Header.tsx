import { Contact, Settings } from "lucide-react";
import { useState } from "react";
import AddConversationModal from "./AddConversationModal";

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-paper tracking-tight">Chatty</h1>
        <div className="flex space-x-1">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg text-paper/60 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Add conversation"
            >
                <Contact className="size-[18px]"/>
            </button>
            <button
                className="p-2 rounded-lg text-paper/60 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Settings"
            >
                <Settings className="size-[18px]"/>
            </button>
        </div>
        <AddConversationModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        />
    </div>
}

export default Header;
