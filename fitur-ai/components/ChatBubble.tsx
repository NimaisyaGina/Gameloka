
import React from 'react';
import { Message, Role } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const formattedLine = line.replace(boldRegex, '<strong class="text-white font-semibold">$1</strong>');
      return (
        <p key={i} className="mb-2 last:mb-0 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Attachment Preview */}
        {message.attachmentUrl && (
          <div className="mb-2 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            {message.attachmentType?.startsWith('image/') ? (
              <img src={message.attachmentUrl} alt="Attachment" className="max-w-xs md:max-w-sm h-auto object-cover" />
            ) : (
              <div className="bg-zinc-800 p-4 flex items-center gap-3">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.363 2c4.155 0 2.637 6 2.637 6s6-1.518 6 2.638v11.362c0 .552-.448 1-1 1h-13c-.552 0-1-.448-1-1v-19c0-.552.448-1 1-1h6.363zm4.137 17l-4.137-4.137-4.138 4.138 1.414 1.414 2.724-2.724 2.725 2.725 1.412-1.416zm-4.137-6.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z"/></svg>
                <span className="text-xs font-medium text-zinc-300">Dokumen PDF Terlampir</span>
              </div>
            )}
          </div>
        )}

        <div className={`px-5 py-3.5 shadow-sm ${
          isUser ? 'bubble-user text-white' : 'bubble-bot text-zinc-200'
        }`}>
          {renderContent(message.content)}
        </div>
        
        <div className="mt-1.5 flex items-center gap-2 px-1">
          <span className="text-[10px] text-zinc-500 font-medium">
            {isUser ? 'Ente' : 'Bang Buay'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
