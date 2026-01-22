
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Role, Message } from './types';
import { geminiService, FileData } from './geminiService';
import Sidebar from './components/Sidebar';
import ChatBubble from './components/ChatBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.ASSISTANT,
      content: "Assalamualaikum! Halo Abang/None! Kenalin, Ane **Bang Buay**. \n\nNyok kite belajar bareng biar makin jago bahasa ama budaya Betawi. Ente bise kirim gambar, dokumen, ato ngobrol pake suara juga ama Ane. Mau nanya ape hari ini?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; data: string; mimeType: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachedFile({
          url: URL.createObjectURL(file),
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: inputText,
      timestamp: new Date(),
      attachmentUrl: attachedFile?.url,
      attachmentType: attachedFile?.mimeType
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Backup file data for the API call then clear
    const fileToUpload = attachedFile ? { data: attachedFile.data, mimeType: attachedFile.mimeType } : undefined;
    
    setInputText('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = '';
      
      const assistantMessagePlaceholder: Message = {
        id: assistantMessageId,
        role: Role.ASSISTANT,
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessagePlaceholder]);

      const stream = await geminiService.sendMessageStream(userMessage.content, fileToUpload);
      
      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: assistantContent } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: 'error',
          role: Role.ASSISTANT,
          content: "Waduh, maapin Ane yak, Bang Buay lagi pusing nih. Coba kirim ulang pertanyaannye!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: Role.ASSISTANT,
        content: "Nyok kite mulai dari awal lagi! Ape yang pengen Abang/None tau soal Betawi?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex h-screen bg-[#121214] text-zinc-100 overflow-hidden">
      <Sidebar onNewChat={startNewChat} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col relative min-w-0 bg-[#121214]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 glass-header border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-zinc-800 rounded-xl transition-colors md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 border border-white/10 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-400">BB</div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">Bang Buay Assistant</span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Online
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-[10px] text-zinc-400 font-bold px-4 py-1.5 bg-zinc-800/50 rounded-full border border-white/5">
               GEMINI 3 PRO MULTIMODAL
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1].content === '' && (
              <div className="flex justify-start mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-zinc-800/50 border border-white/5 px-6 py-4 rounded-2xl rounded-tl-none flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Container */}
        <div className="p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Attachment Preview UI */}
            {attachedFile && (
              <div className="mb-4 p-2 bg-zinc-800 rounded-2xl border border-white/10 flex items-center gap-3 w-fit animate-in zoom-in-95 duration-200">
                {attachedFile.mimeType.startsWith('image/') ? (
                  <img src={attachedFile.url} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  </div>
                )}
                <div className="flex flex-col pr-4">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Terlampir</span>
                  <span className="text-[11px] text-white font-medium max-w-[150px] truncate">File siap dikirim</span>
                </div>
                <button onClick={() => setAttachedFile(null)} className="p-1.5 hover:bg-zinc-700 rounded-full text-zinc-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-center gap-3"
            >
              <div className="relative flex-1 group">
                {/* File Upload Trigger */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isRecording ? "Lagi dengerin..." : "Kirim pesan ke Bang Buay..."}
                  className={`w-full bg-zinc-800/80 border ${isRecording ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-white/5'} hover:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-[28px] py-4 pl-14 pr-24 transition-all outline-none text-[15px] text-white placeholder:text-zinc-500 shadow-2xl backdrop-blur-sm`}
                  disabled={isLoading}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`p-2.5 rounded-xl transition-all ${
                      isRecording 
                        ? 'bg-red-500/10 text-red-500 animate-pulse-mic' 
                        : 'text-zinc-500 hover:bg-zinc-800 hover:text-indigo-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-8m4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !attachedFile) || isLoading}
                    className={`p-2.5 rounded-2xl transition-all ${
                      (!inputText.trim() && !attachedFile) || isLoading
                        ? 'text-zinc-700 bg-transparent'
                        : 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>
              </div>
            </form>
            <p className="text-[10px] text-center mt-4 text-zinc-600 font-bold tracking-widest uppercase">
              Bang Buay: Asisten Budaye Betawi Jawara • 2025
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
