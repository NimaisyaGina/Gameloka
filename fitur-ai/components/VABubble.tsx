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

  // Jika tidak authenticated, jangan render
  if (!isAuthenticated) {
    return null;
  }

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
    setInputText('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      let response;
      if (attachedFile) {
        const fileData: FileData = {
          data: attachedFile.data,
          mimeType: attachedFile.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'text/plain'
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const loadConversation = (id: string) => {
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
      {/* Chat Bubble Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF9D3D 0%, #FFB366 100%)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 157, 61, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 157, 61, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 157, 61, 0.3)';
          }}
          title="Chat dengan Bang Buay"
        >
          💬
        </button>
      ) : (
        /* Chat Window */
        <div
          style={{
            width: '450px',
            height: '600px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 30px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FF9D3D 0%, #FFB366 100%)',
              color: 'white',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 157, 61, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>💬</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>Bang Buay</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>Virtual Assistant Betawi</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={toggleSidebar}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                title="Riwayat chat"
              >
                ≡
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                title="Tutup chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
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
              <ChatBubble
                key={msg.id}
                message={msg}
                isUser={msg.role === Role.USER}
              />
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#FF9D3D',
                    animation: 'bounce 1.4s infinite'
                  }}
                ></div>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#FF9D3D',
                    animation: 'bounce 1.4s infinite',
                    animationDelay: '0.2s'
                  }}
                ></div>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#FF9D3D',
                    animation: 'bounce 1.4s infinite',
                    animationDelay: '0.4s'
                  }}
                ></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0' }}>
            {attachedFile && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '8px',
                  background: '#f0f0f0',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}
              >
                <span>📎 File attached</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>
            )}
            <form
              onSubmit={handleSendMessage}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end'
              }}
            >
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
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e0e0e0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f0f0f0'}
                title="Upload file"
              >
                📎
              </button>
              <button
                type="button"
                onClick={toggleRecording}
                style={{
                  background: isRecording ? '#FF6B6B' : '#f0f0f0',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: isRecording ? 'white' : 'inherit',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isRecording) e.currentTarget.style.background = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                  if (!isRecording) e.currentTarget.style.background = '#f0f0f0';
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
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#FF9D3D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !attachedFile)}
                style={{
                  background: isLoading || (!inputText.trim() && !attachedFile) ? '#ccc' : '#FF9D3D',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: isLoading || (!inputText.trim() && !attachedFile) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && (inputText.trim() || attachedFile)) {
                    e.currentTarget.style.background = '#FF8C1A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && (inputText.trim() || attachedFile)) {
                    e.currentTarget.style.background = '#FF9D3D';
                  }
                }}
              >
                {isLoading ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar onSelectConversation={loadConversation} onClose={toggleSidebar} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.5;
          }
          40% {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VABubble;
