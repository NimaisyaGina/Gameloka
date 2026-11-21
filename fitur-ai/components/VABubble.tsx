import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Role, Message } from '../types';
import { geminiService, FileData } from '../geminiService';
import ChatBubble from './ChatBubble';
import Sidebar from './Sidebar';

interface VABubbleProps {
  isAuthenticated: boolean;
}

const VABubble: React.FC<VABubbleProps> = ({ isAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Must run after all hooks to obey React Rules of Hooks
  if (!isAuthenticated) {
    return null;
  }

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
    setInputText('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      let response: string;
      if (attachedFile) {
        const fileData: FileData = {
          data: attachedFile.data,
          mimeType: attachedFile.mimeType as FileData['mimeType']
        };
        response = await geminiService.sendMessageWithFile(inputText || "Tolong analisis file ini", fileData);
      } else {
        response = await geminiService.sendMessage(inputText);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.ASSISTANT,
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: Role.ASSISTANT,
        content: "Maaf, terjadi kesalahan. Coba lagi nanti ya.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: Role.ASSISTANT,
        content: "Assalamualaikum! Halo Abang/None! Kenalin, Ane **Bang Buay**.",
        timestamp: new Date()
      }
    ]);
    setIsSidebarOpen(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            background: '#F8C662',
            color: '#2C263F',
            border: '3px solid #2C263F',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 #1B1729',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
          title="Chat dengan Bang Buay"
        >
          💬
        </button>
      ) : (
        <div
          style={{
            width: '440px',
            height: '580px',
            background: '#2C263F',
            border: '4px solid #F8C662',
            boxShadow: '6px 6px 0 #1B1729',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#595082',
              color: '#FFF7E0',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #F8C662'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>🐊</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#F8C662' }}>Bang Buay</div>
                <div style={{ fontSize: '12px', color: '#C7C0DE' }}>Virtual Assistant Betawi</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: '#2C263F',
                  border: '2px solid #F8C662',
                  color: '#F8C662',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                title="Topik Cepat"
              >
                ≡
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#2C263F',
                  border: '2px solid #F8C662',
                  color: '#F8C662',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                title="Tutup chat"
              >
                ×
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div style={{ color: '#F8C662', fontSize: '13px' }}>⏳ Bang Buay lagi mikir...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '2px solid #595082', background: '#1B1729' }}>
            {attachedFile && (
              <div
                style={{
                  marginBottom: '10px',
                  padding: '8px',
                  background: '#213722',
                  border: '2px solid #41644A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#FFF7E0'
                }}
              >
                <span>📎 File attached</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#F8C662' }}
                >
                  ×
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: '#595082', border: '2px solid #F8C662', color: '#FFF7E0', padding: '8px 10px', cursor: 'pointer' }}
                title="Upload file"
              >
                📎
              </button>
              <button
                type="button"
                onClick={toggleRecording}
                style={{
                  background: isRecording ? '#E05A5A' : '#595082',
                  border: '2px solid #F8C662',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  color: '#FFF7E0'
                }}
                title={isRecording ? 'Stop recording' : 'Record voice'}
              >
                🎤
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik pesan..."
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  border: '2px solid #595082',
                  background: '#2C263F',
                  color: '#FFF7E0',
                  fontSize: '14px',
                  outline: 'none'
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !attachedFile)}
                style={{
                  background: '#F8C662',
                  color: '#2C263F',
                  border: '2px solid #C9932E',
                  padding: '9px 14px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                {isLoading ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <Sidebar onNewChat={handleNewChat} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
    </div>
  );
};

export default VABubble;
