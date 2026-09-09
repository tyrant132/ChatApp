import RedisService from "./services/RedisService.js";
import { leaveAllRooms } from "./socket/helpers.js";
import { 
    conversationMarkAsRead, 
    conversationRequest, 
    conversationSendMessage, 
    conversationTyping, 
    notifyConversationOnlineStatus 
} from "./socket/socketConversation.js";


export const initializeSocket = async (io) => {
    io.on("connection", async (socket) => {
        try {
            const user = socket.user;
            console.log("User connected", user.id);
            socket.join(user._id.toString());

            await RedisService.addUserSession(user.id, socket.id);
            await notifyConversationOnlineStatus(io, socket, true);

            socket.on("conversation:request", (data) => conversationRequest(io, socket, data))

            socket.on("conversation:mark-as-read", (data) => conversationMarkAsRead(io, socket, data));

            socket.on("conversation:send-message", (data) => conversationSendMessage(io, socket, data))

            socket.on("conversation:typing", (data) => conversationTyping(io, socket, data));

            socket.on('disconnect', async () => {


                await RedisService.removeUserSession(user.id, socket.id);

                const isOnline = await RedisService.isUserOnline(user.id);

                if (!isOnline) {
                    await notifyConversationOnlineStatus(io, socket, false);
                    leaveAllRooms(socket);
                }
            })

        } catch (error) {
            console.error("Socket connection error", error);
            socket.emit("internal_error", {error: "Internal server error"});
        }
    })
}