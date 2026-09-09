import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true})

messageSchema.index({conversation: 1, createdAt: -1});
messageSchema.index({sender: 1, createdAt: -1});

messageSchema.post("save", async function (doc) {
    try {
        const Conversation = mongoose.model("Conversation");

        const preview = {
            content: doc.content,
            timestamp: doc.createdAt,
        }

        await Conversation.findByIdAndUpdate(doc.conversation, {
            lastMessage: doc._id,
            lastMessagePreview: preview
        })
    } catch (error) {
        console.error("Eror updating conversation after message save", error);
    }
});

export default mongoose.model("Message", messageSchema)