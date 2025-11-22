import React from "react";
import Modal from "@/foundation/components/modal/Modal";
import ConversationsList from "./ConversationsList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

interface ModalChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalChat: React.FC<ModalChatProps> = ({ open, onOpenChange }) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="3xl"
      className="!max-w-[1200px] !h-[90vh]"
      contentClassName="!p-0 !h-full flex flex-col"
      hideFooter
    >
      <div className="flex h-full">
        {/* Sidebar - Conversations List */}
        <div className="w-80 border-r border-neutral-3 bg-white flex flex-col">
          <ConversationsList />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow />
          <MessageInput />
        </div>
      </div>
    </Modal>
  );
};

export default ModalChat;

