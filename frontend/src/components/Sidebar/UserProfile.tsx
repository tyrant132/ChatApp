import { LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router";
import { useConversationStore } from "../../stores/conversationStore";

const UserProfile: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const {selectedConversation, setSelectedConversation} = useConversationStore();

    const queryClient = useQueryClient();

    const logoutUser = async () => {
        await authService.logout();
        logout();
        await queryClient.removeQueries();

        if (selectedConversation) {
            setSelectedConversation(null);
        }

        return navigate('/auth');
    }

    return <div className="px-5 py-4 border-t border-ink-line flex items-center space-x-3">
        <img src="https://avatar.iran.liara.run/public" alt="User" className="size-10 rounded-full object-cover ring-1 ring-white/10" />
        <div className="flex-1 min-w-0">
            <h2 className="font-medium truncate text-sm text-paper">{user?.username} <span className="text-paper/35 font-normal">({user?.connectCode})</span></h2>
            <p className="text-xs text-teal">Online</p>
        </div>
        <button onClick={() => logoutUser()} className="p-2 rounded-lg text-paper/45 hover:text-paper hover:bg-white/5 cursor-pointer transition-colors">
            <LogOut className="size-[16px]"/>
        </button>
    </div>
}

export default UserProfile;
