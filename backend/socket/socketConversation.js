import Friendship from "../models/Friendship.js"
import User from "../models/User.js"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"

import { getChatRoom } from "./helpers.js"
import RedisService from "../services/RedisService.js"


export const notifyConversationOnlineStatus = async (io, socket, online) => {
    try {
        const userId = socket.userId;
        const user = socket.user;

        const friendships = await Friendship.find({
            status: "accepted",
            $or: [
                {requester: userId},
                {recipient: userId}
            ],
        })

        friendships.forEach((friendship) => {
            const isRequester = friendship.requester._id.toString() === userId.toString();
            const friendId = isRequester ? friendship.recipient._id : friendship.requester._id;

            const room = getChatRoom(userId.toString(), friendId.toString());
            socket.join(room);

            console.log("emit:conversation:online-status");
            io.to(friendId.toString())
                .emit('conversation:online-status', {
                    friendId: userId,
                    username: user.username,
                    online,
                })
        })


    } catch (error) {
        console.error("notifyConversationOnlineStatus", error);
    }
}

export const conversationRequest = async (io, socket, data) => {
    try {
        const userId = socket.userId;
        const user = socket.user;
        const { connectCode } = data;

        const friend = await User.findOne({ connectCode });
        if (!friend) {
            socket.emit("conversation:request:error", {error: "Unable to find conversation"});
            return;
        }

        if (friend._id.toString() === userId.toString()) {
            socket.emit("conversation:request:error", {error: "Can not add yourself as a friend"});
            return;
        }

        const existingFriendship = await Friendship.findOne({
            $or: [
                {requester: userId, recipient: friend._id},
                {requester: friend._id, recipient: userId}
            ],
        })
        if (existingFriendship) {
            const message = existingFriendship.status === "pending"
                ? "A request with this user is already pending"
                : "Friendship already exists";
            socket.emit("conversation:request:error", {error: message});
            return;
        }

        // Requests start pending; the conversation and 'accepted' friendship
        // are only created once the recipient responds via conversationRequestRespond.
        const friendship = await Friendship.create({
            requester: userId,
            recipient: friend._id,
            status: "pending",
        })

        // Let the sender know their request went out.
        socket.emit('conversation:request:sent', {
            requestId: friendship._id.toString(),
            friend: {
                id: friend.id,
                fullName: friend.fullName,
                username: friend.username,
                connectCode: friend.connectCode,
            }
        })

        // Notify the recipient in real time, if they're online, so they can accept/decline.
        io.to(friend._id.toString()).emit('conversation:request:incoming', {
            requestId: friendship._id.toString(),
            requester: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                connectCode: user.connectCode,
            }
        })

    } catch (error) {
        console.error("Error conversation:request", error);
        socket.emit("conversation:request:error", {error: "Error conversation:request"})
    }
}

export const conversationRequestRespond = async (io, socket, data) => {
    try {
        const userId = socket.userId;
        const user = socket.user;
        const { requestId, accept } = data;

        const friendship = await Friendship.findById(requestId);
        if (!friendship) {
            socket.emit("conversation:request:respond:error", {error: "Request not found"});
            return;
        }

        if (friendship.recipient.toString() !== userId.toString()) {
            socket.emit("conversation:request:respond:error", {error: "Not authorized to respond to this request"});
            return;
        }

        if (friendship.status !== "pending") {
            socket.emit("conversation:request:respond:error", {error: "This request has already been handled"});
            return;
        }

        const requester = await User.findById(friendship.requester);
        if (!requester) {
            socket.emit("conversation:request:respond:error", {error: "Requesting user no longer exists"});
            return;
        }

        if (!accept) {
            await friendship.deleteOne();

            socket.emit('conversation:request:responded', { requestId });
            io.to(requester._id.toString()).emit('conversation:request:declined', {
                requestId,
                username: user.username,
            })
            return;
        }

        friendship.status = "accepted";
        await friendship.save();

        const conversation = await Conversation.create({
            participants: [userId, requester._id.toString()]
        });

        socket.join(getChatRoom(userId, requester._id.toString()));

        const conversationData = {
            conversationId: conversation._id.toString(),
            lastMessage: null,
            unreadCounts: {
                [userId.toString()]: 0,
                [requester._id.toString()]: 0,
            },
        };

        socket.emit('conversation:request:responded', { requestId });

        io.to(userId.toString()).emit('conversation:accept', {
            ...conversationData,
            friend: {
                id: requester.id,
                fullName: requester.fullName,
                username: requester.username,
                connectCode: requester.connectCode,
                online: await RedisService.isUserOnline(requester._id.toString()),
            }
        })

        io.to(requester._id.toString()).emit('conversation:accept', {
            ...conversationData,
            friend: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                connectCode: user.connectCode,
                online: await RedisService.isUserOnline(user._id.toString()),
            }
        })

    } catch (error) {
        console.error("Error conversation:request:respond", error);
        socket.emit("conversation:request:respond:error", {error: "Error conversation:request:respond"})
    }
}

export const conversationMarkAsRead = async (io, socket, data) => {
    try {
        const {conversationId, friendId} = data;
        const userId = socket.userId;

        const friendship = await Friendship.findOne({
            status: "accepted",
            $or: [
                {requester: userId, recipient: friendId},
                {requester: friendId, recipient: userId}
            ],
        })

        if (!friendship) {
            socket.emit("conversation:mark-as-read:error", {error: "No friendship found"})
            return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            socket.emit("conversation:mark-as-read:error", {error: "No conversation found"})
            return;
        }        

        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();

        const room = getChatRoom(userId.toString(), friendId);
        io.to(room).emit('conversation:update-unread-counts', {
            conversationId: conversation._id.toString(),
            unreadCounts: {
                [userId.toString()]: 0,
                [friendId]: conversation.unreadCounts.get(friendId) || 0,
            }
        })

    } catch (error) {
        console.error("Error marking conversation as read", error);
        socket.emit("conversation:mark-as-read:error", {error: "Error: conversation:mark-as-read:error"})
    }
}

export const conversationSendMessage = async (io, socket, data) => {
    try {
        const { conversationId, friendId, content, attachment } = data;
        const userId = socket.userId;
        const user = socket.user;

        const hasContent = typeof content === "string" && content.trim() !== "";
        const hasAttachment = attachment && attachment.url && ["image", "audio"].includes(attachment.type);

        if (!hasContent && !hasAttachment) {
            socket.emit("conversation:send-message:error", {error: "Message cannot be empty"})
            return;
        }

        const friendship = await Friendship.findOne({
            status: "accepted",
            $or: [
                {requester: userId, recipient: friendId},
                {requester: friendId, recipient: userId}
            ],
        })

        if (!friendship) {
            socket.emit("conversation:send-message:error", {error: "No friendship found"})
            return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            socket.emit("conversation:send-message:error", {error: "No conversation found"})
            return;
        }  

        const message = new Message({
            conversation: conversation.id,
            sender: userId,
            content: hasContent ? content.trim() : undefined,
            attachment: hasAttachment ? {
                url: attachment.url,
                type: attachment.type,
                mimeType: attachment.mimeType,
                size: attachment.size,
            } : undefined,
        })
        await message.save();

        const currentUnreadCount = conversation.unreadCounts.get(friendId) || 0;
        conversation.unreadCounts.set(friendId, currentUnreadCount + 1);
        await conversation.save();  
        
        const messageData = {
            _id: message.id,
            sender: {
                _id: userId.toString(),
                username: user.username,
            },
            content: message.content,
            attachment: message.attachment?.url ? message.attachment : undefined,
            createdAt: message.createdAt,
            read: message.read,
        }

        const updatedConversation = await Conversation.findById(conversationId);

        const room = getChatRoom(userId, friendId);

        io.to(room).emit("conversation:new-message", {
            conversationId: conversation.id,
            message: messageData,
        });

        io.to(room).emit("conversation:update-conversation", {
            conversationId: conversation.id,
            lastMessage: updatedConversation.lastMessagePreview,
            unreadCounts: {
                [userId.toString()]: updatedConversation.unreadCounts.get(userId.toString()),
                [friendId]: updatedConversation.unreadCounts.get(friendId)
            },
        });        

    } catch (error) {
        console.error("Error sending message", error);
        socket.emit("conversation:send-message:error", {error: "Error: conversation:send-message:error"})
    }
}

export const conversationReactToMessage = async (io, socket, data) => {
    try {
        const { conversationId, messageId, emoji } = data;
        const userId = socket.userId;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.toString() === userId.toString())) {
            socket.emit("conversation:react-to-message:error", {error: "Not authorized for this conversation"});
            return;
        }

        const message = await Message.findById(messageId);
        if (!message || message.conversation.toString() !== conversationId) {
            socket.emit("conversation:react-to-message:error", {error: "Message not found"});
            return;
        }

        const existingIndex = message.reactions.findIndex(
            (reaction) => reaction.user.toString() === userId.toString()
        );

        if (existingIndex !== -1 && message.reactions[existingIndex].emoji === emoji) {
            // Same emoji tapped again -> remove (un-react)
            message.reactions.splice(existingIndex, 1);
        } else if (existingIndex !== -1) {
            // Different emoji -> replace this user's reaction (one reaction per user per message)
            message.reactions[existingIndex].emoji = emoji;
        } else {
            message.reactions.push({ user: userId, emoji });
        }

        await message.save();

        const friendId = conversation.participants.find(p => p.toString() !== userId.toString());
        const room = getChatRoom(userId.toString(), friendId.toString());

        io.to(room).emit("conversation:message-reaction", {
            conversationId,
            messageId,
            reactions: message.reactions.map((reaction) => ({
                user: reaction.user.toString(),
                emoji: reaction.emoji,
            })),
        });

    } catch (error) {
        console.error("Error reacting to message", error);
        socket.emit("conversation:react-to-message:error", {error: "Error: conversation:react-to-message:error"})
    }
}

export const conversationTyping = async (io, socket, data) => {
    try {
        const {friendId, isTyping} = data;
        const userId = socket.userId;

        if (userId.toString() === friendId) return;

        socket.to(friendId).emit("conversation:update-typing", {
            userId: userId.toString(),
            isTyping,
        })

    } catch (error) {
        console.error("Error sending conversation typing state", error);
    }
}