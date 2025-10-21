// Component con: InteractionButtons
const InteractionButtons = ({
    targetType,
    parentId,
    targetId,
    currentReaction,
    setShowReactions,
    showReactions,
    handleSelectReaction,
    reactionsList,
    setShowReplies
}: any) => (
    <div className="flex items-center space-x-4 mt-2">
        {/* Nút thả cảm xúc */}
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowReactions({ type: targetType, id: targetId })}
            onMouseLeave={() => setShowReactions(null)}
        >
            <button
                className={`px-3 py-1 rounded-lg transition flex items-center space-x-1
                    ${currentReaction 
                        ? "text-blue-600 font-semibold"  // đã thả cảm xúc
                        : "text-gray-600 hover:bg-gray-100"}          // chưa thả
                `}
                onClick={() => {
                    if (currentReaction) {
                        // Nếu đã có reaction thì toggle lại (xóa hoặc reset về like)
                        handleSelectReaction(targetType, parentId, targetId, currentReaction.type);
                    } else {
                        handleSelectReaction(targetType, parentId, targetId, "like");
                    }
                }}
            >
                <span>{currentReaction ? currentReaction.icon : "👍"}</span>
                <span>{currentReaction ? currentReaction.label : "Thích"}</span>
            </button>

            {showReactions?.id === targetId && showReactions.type === targetType && (
                <div className="absolute -top-12 left-0 flex space-x-2 bg-white p-2 rounded-full shadow-lg border">
                    {reactionsList.map((r: any) => (
                        <button
                            key={r.type}
                            onClick={() => handleSelectReaction(targetType, parentId, targetId, r.type)}
                            className="text-2xl hover:scale-125 transition-transform"
                        >
                            {r.icon}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Nút phản hồi */}
        <button
            className="text-gray-600 hover:underline"
            onClick={() =>
                setShowReplies((prev: any) => ({
                    ...prev,
                    [`${targetType}-${targetId}`]: !prev[`${targetType}-${targetId}`]
                }))
            }
        >
            💬 Phản hồi
        </button>
    </div>
);

export default InteractionButtons;
