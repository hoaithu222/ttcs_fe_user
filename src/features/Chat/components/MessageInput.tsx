import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, X, Image as ImageIcon, Mic, Square } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { useAppSelector } from "@/app/store";
import { selectCurrentConversation } from "@/app/store/slices/chat/chat.selector";
import { socketClients, SOCKET_EVENTS } from "@/core/socket";
import { imagesApi } from "@/core/api/images";
import Button from "@/foundation/components/buttons/Button";
import TextArea from "@/foundation/components/input/TextArea";
import Image from "@/foundation/components/icons/Image";
import Spinner from "@/foundation/components/feedback/Spinner";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import Popover from "@/foundation/components/popover/Popever";

interface MessageInputProps {
  onSend?: () => void;
  onVoiceMessageSent?: () => void;
}

interface ImageAttachment {
  url: string;
  type: string;
  name?: string;
  file?: File; // Keep file reference for preview
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onVoiceMessageSent }) => {
  const currentConversation = useAppSelector(selectCurrentConversation);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmitRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasVoiceMessageRef = useRef(false);
  const isRecordingRef = useRef(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    // Check file size (max 5MB per image)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = imageFiles.filter((file) => {
      if (file.size > maxSize) {
        alert(`File ${file.name} vượt quá 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const result = await imagesApi.uploadImage(file);
        return {
          url: result.url,
          type: file.type,
          name: file.name,
          file: file, // Keep for preview
        };
      });

      const uploadedAttachments = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...uploadedAttachments]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    const messageText = message.trim();
    const attachmentsToSend = attachments.map((att) => ({
      url: att.url,
      type: att.type,
      name: att.name,
    }));

    const wasVoice = wasVoiceMessageRef.current;
    wasVoiceMessageRef.current = false;

    // Clear state
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Notify if voice message was sent
    if (wasVoice && onVoiceMessageSent) {
      onVoiceMessageSent();
    }

    // Determine channel and socket client
    let socketClient;
    let channel: "admin" | "shop" | "ai" = "shop";
    let conversationId = currentConversation?._id;
    let type: "admin" | "shop" | undefined;
    let targetId: string | undefined;
    const storedContext = sessionStorage.getItem("chatContext");

    if (currentConversation) {
      // Use existing conversation
      conversationId = currentConversation._id;
      channel = (currentConversation.channel as "admin" | "shop" | "ai") || "shop";
    } else {
      // No conversation - determine type from metadata or default to admin
      // This should be set by CreateConversationButton or ChatTypeSelector
      if (storedContext) {
        try {
          const context = JSON.parse(storedContext);
          type = context.type || "admin";
          targetId = context.targetId;
          // Set channel based on type
          channel = type === "admin" ? "admin" : "shop";
        } catch (e) {
          // Default to admin chat
          type = "admin";
          channel = "admin";
        }
      } else {
        // Default to admin chat
        type = "admin";
        channel = "admin";
      }
    }

    // Get appropriate socket client based on channel
    switch (channel) {
      case "admin":
        socketClient = socketClients.adminChat;
        break;
      case "shop":
        socketClient = socketClients.shopChat;
        break;
      case "ai":
        socketClient = socketClients.aiChat;
        break;
      default:
        socketClient = socketClients.adminChat;
    }

    if (!socketClient) {
      console.error("Socket client not available");
      return;
    }

    // Connect and get socket instance
    const socket = socketClient.connect();
    if (!socket || !socket.connected) {
      console.error("Socket not connected");
      return;
    }

    // Determine message type based on content
    let messageType: "text" | "image" | "file" = "text";
    if (attachmentsToSend.length > 0) {
      const hasImages = attachmentsToSend.some((att) => att.type.startsWith("image/"));
      const hasAudio = attachmentsToSend.some((att) => att.type.startsWith("audio/"));
      messageType = hasImages ? "image" : hasAudio ? "file" : "file";
    }

    // Send message via socket without product metadata
    // Product metadata should only be sent in the initial product message (from DetailProduct)
    // For regular messages, don't send any metadata to avoid showing product card in shop replies
    socket.emit(SOCKET_EVENTS.CHAT_MESSAGE_SEND, {
      conversationId,
      message: messageText || "", // Allow empty message if only images
      type: messageType,
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      conversationType: type, // Conversation type for creating new conversation
      targetId,
      // Don't send metadata for regular messages - only the first auto-sent product message has metadata
    });

    // Clear stored context after first message
    if (!currentConversation && storedContext) {
      sessionStorage.removeItem("chatContext");
    }

    onSend?.();
  };

  const emitTyping = (isTyping: boolean) => {
    if (!currentConversation) return;

    const now = Date.now();
    // Throttle typing events (max once per 2 seconds)
    if (isTyping && now - lastTypingEmitRef.current < 2000) {
      return;
    }
    lastTypingEmitRef.current = now;

    const channel = (currentConversation.channel as "admin" | "shop" | "ai") || "shop";
    let socketClient;

    switch (channel) {
      case "admin":
        socketClient = socketClients.adminChat;
        break;
      case "shop":
        socketClient = socketClients.shopChat;
        break;
      case "ai":
        socketClient = socketClients.aiChat;
        break;
      default:
        socketClient = socketClients.adminChat;
    }

    if (socketClient) {
      const socket = socketClient.connect();
      if (socket && socket.connected) {
        socket.emit(SOCKET_EVENTS.CHAT_TYPING, {
          conversationId: currentConversation._id,
          isTyping,
        });
      }
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Emit typing start
    if (e.target.value.trim() && currentConversation) {
      emitTyping(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing stop after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
      }, 2000);
    } else {
      // Stop typing if message is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Stop typing when sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTyping(false);
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBefore = message.substring(0, cursorPosition);
    const textAfter = message.substring(cursorPosition);
    setMessage(textBefore + emojiData.emoji + textAfter);

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + emojiData.emoji.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  useEffect(() => {
    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTyping(false);
    };
  }, [currentConversation?._id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Reset audio chunks
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg")
            ? "audio/ogg"
            : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        // Create audio file
        const audioFile = new File(
          [audioBlob],
          `voice-message-${Date.now()}.${mediaRecorder.mimeType?.split("/")[1] || "webm"}`,
          { type: audioBlob.type }
        );

        // Upload audio file
        setIsUploading(true);
        try {
          const result = await imagesApi.uploadImage(audioFile);
          const audioAttachment = {
            url: result.url,
            type: audioBlob.type || "audio/webm",
            name: audioFile.name,
          };

          // Add to attachments
          setAttachments((prev) => [...prev, audioAttachment]);
          wasVoiceMessageRef.current = true;
        } catch (error) {
          console.error("Error uploading audio:", error);
          alert("Lỗi khi upload file audio. Vui lòng thử lại.");
        } finally {
          setIsUploading(false);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Không thể bắt đầu ghi âm. Vui lòng kiểm tra quyền microphone.");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  if (!currentConversation) {
    return null;
  }

  return (
    <div className="bg-background-2 border-t border-neutral-3 relative">
      <div className="p-4">
        <Form.Root onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isRecording}
                className="p-2 text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Đính kèm ảnh"
              >
                {isUploading ? <Spinner size="sm" /> : <ImageIcon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording
                    ? "text-red-6 hover:text-red-7 hover:bg-red-1 bg-red-1"
                    : "text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isRecording ? "Dừng ghi âm" : "Ghi âm giọng nói"}
              >
                {isRecording ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              <Popover
                open={isEmojiPickerOpen}
                onOpenChange={setIsEmojiPickerOpen}
                side="top"
                align="start"
                contentClassName="!p-0 border border-neutral-3 rounded-lg shadow-lg overflow-hidden"
                content={
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={350}
                    height={400}
                    previewConfig={{ showPreview: false }}
                    skinTonesDisabled
                  />
                }
              >
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  disabled={isRecording}
                  className="p-2 text-neutral-6 hover:text-neutral-10 hover:bg-neutral-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </Popover>
            </div>

            <div className="flex-1 relative">
              {/* Image previews - absolute positioned above input */}
              {attachments.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-background-2 rounded-lg border border-neutral-3 shadow-lg z-10">
                  <div className="flex gap-2 overflow-x-auto">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-neutral-3 group"
                      >
                        {attachment.file ? (
                          <img
                            src={URL.createObjectURL(attachment.file)}
                            alt={attachment.name || "Preview"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={attachment.url}
                            alt={attachment.name || "Preview"}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-neutral-9/80 hover:bg-neutral-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa ảnh"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-red-1 rounded-lg border border-red-3 shadow-lg z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-6 rounded-full animate-pulse" />
                    <span className="text-sm text-red-7 font-medium flex-1">
                      Đang ghi âm... {formatTime(recordingTime)}
                    </span>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1 text-xs bg-red-6 text-white rounded hover:bg-red-7 transition-colors"
                    >
                      Dừng
                    </button>
                  </div>
                </div>
              )}
              <TextArea
                name="message"
                ref={textareaRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyPress}
                placeholder={isRecording ? "Đang ghi âm..." : "Nhập tin nhắn..."}
                rows={1}
                className={`resize-none min-h-[44px] max-h-[120px] pr-12`}
                textSize="large"
                disabled={isRecording}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || isUploading}
              size="md"
              rounded="full"
              icon={<Send className="w-4 h-4" />}
              className="flex-shrink-0"
            >
              Gửi
            </Button>
          </div>
        </Form.Root>
      </div>
    </div>
  );
};

export default MessageInput;
