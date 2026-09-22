import { useState } from "react";
import { Check, Copy, LogOut, Mail, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import Modal from "../ui/Modal";
import { useAuthStore } from "../../stores/authStore";
import { useConversationStore } from "../../stores/conversationStore";
import { authService } from "../../services/authService";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuthStore();
    const { selectedConversation, setSelectedConversation } = useConversationStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);

    const copyConnectCode = async () => {
        if (!user?.connectCode) return;

        try {
            await navigator.clipboard.writeText(user.connectCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard API can be blocked (permissions, non-secure context); fail silently.
        }
    };

    const logoutUser = async () => {
        await authService.logout();
        logout();
        await queryClient.removeQueries();

        if (selectedConversation) {
            setSelectedConversation(null);
        }

        onClose();
        navigate("/auth");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile & settings">
            <div className="flex items-center gap-4 pb-5 mb-5 border-b border-paper-line">
                <img
                    src="https://avatar.iran.liara.run/public"
                    alt="Your avatar"
                    className="size-14 rounded-full object-cover ring-1 ring-ink/10"
                />
                <div className="min-w-0">
                    <h3 className="font-medium text-ink truncate">{user?.fullName}</h3>
                    <p className="text-sm text-ink/45 truncate">@{user?.username}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-xs text-ink/45 mb-1.5">
                        <Mail className="size-3.5" />
                        Email
                    </label>
                    <p className="text-sm text-ink bg-paper-dim rounded-lg px-3 py-2.5">{user?.email}</p>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-xs text-ink/45 mb-1.5">
                        <UserIcon className="size-3.5" />
                        Connect ID
                    </label>
                    <p className="text-xs text-ink/50 mb-1.5">Share this so friends can add you</p>
                    <div className="flex items-center gap-2">
                        <p className="flex-1 text-sm text-ink bg-paper-dim rounded-lg px-3 py-2.5 font-mono tracking-wide">
                            {user?.connectCode}
                        </p>
                        <button
                            type="button"
                            onClick={copyConnectCode}
                            className="shrink-0 size-10 flex items-center justify-center rounded-lg border border-paper-line text-ink/60 hover:text-teal hover:border-teal/40 transition-colors cursor-pointer"
                            aria-label="Copy connect ID"
                        >
                            {copied ? <Check className="size-4 text-teal" /> : <Copy className="size-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={logoutUser}
                className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-red-600 border border-red-200 rounded-lg py-2.5 hover:bg-red-50 transition-colors cursor-pointer"
            >
                <LogOut className="size-4" />
                Log out
            </button>
        </Modal>
    );
};

export default SettingsModal;
