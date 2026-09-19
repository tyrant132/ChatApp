import type { Message } from "../../services/messageService";
import { useAuthStore } from "../../stores/authStore";


const MessageItem: React.FC<Message> = ({
    _id,
    sender,
    content,
    read,
    createdAt
}) => {
    const { user } = useAuthStore();
    const userIsSender = sender._id === user?.id;

    const created = new Date(createdAt);
    const now = new Date();

    const diffInMs = now.getTime() - created.getTime();
    const diffInDays = diffInMs /  (1000 * 60 * 60 * 24);

    const time = created.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })

    const date = created.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric"
    })

    const displayTime = diffInDays > 1 ? `${date} ${time}` : time;

    if (userIsSender) {
        return <div className="flex justify-end mb-3">
            <div className="bg-ink text-paper p-3 max-w-xs lg:max-w-md rounded-2xl rounded-br-md">
                <p className="text-sm leading-relaxed">{content}</p>
                <span className="text-[11px] text-paper/40 mt-1 block">{displayTime}</span>
            </div>
        </div>
    }

    return <div className="flex mb-3">
        <img
            src="https://avatar.iran.liara.run/public"
            alt={sender.username}
            className="size-8 rounded-full object-cover mr-2 ring-1 ring-ink/10 self-end"
        />
        <div className="bg-white border border-paper-line p-3 max-w-xs lg:max-w-md rounded-2xl rounded-bl-md">
            <p className="text-sm text-ink leading-relaxed">{content}</p>
            <span className="text-[11px] text-ink/35 mt-1 block">{displayTime}</span>
        </div>
    </div>
}

export default MessageItem;
