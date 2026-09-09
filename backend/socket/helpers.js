

export const getChatRoom = (userId1, userId2) => {
    const sortedIds = [userId1.toString(), userId2.toString()].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
}

export const leaveAllRooms = (socket) => {
    const rooms = Array.from(socket?.rooms ?? []);
    rooms.forEach((room) => {
        if (room.startsWith('chat_')) {
            socket.leave(room);
        }
    })
}