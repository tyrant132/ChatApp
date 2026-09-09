import Message from "../models/Message.js"

class MessageController {
    static async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { cursor } = req.query;
            const limit = 20;

            const query = {conversation: conversationId};

            if (cursor) {
                query.createdAt = {$lt: new Date(cursor)};
            }

            let messages = await Message.find(query)
                .sort({createdAt: -1})
                .limit(limit)
                .populate("sender", "username")
                .lean();

            const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt.toISOString() : null;

            messages = messages.reverse();

            res.json({
                messages,
                nextCursor,
                hasNext: messages.length === limit
            })

            
        } catch (error) {
            console.error("Error fetching messages", error);
            res.status(500).json({message: "Internal server error"});
        }
    }
}

export default MessageController;