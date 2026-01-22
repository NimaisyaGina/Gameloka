
import React from 'react';

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, isOpen, setIsOpen }) => {
  const quickActions = [
    { label: 'Pantun Betawi', icon: '🎤' },
    { label: 'Kamus Logat', icon: '📖' },
    { label: 'Kuliner', icon: '🥘' },
    { label: 'Tradisi', icon: '🎭' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#121214] border-r border-white/5 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
                BB
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white">Bang Buay</h1>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Gameloka Intelligence</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-zinc-500 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <button
            onClick={() => { onNewChat(); if(window.innerWidth < 768) setIsOpen(false); }}
            className="flex items-center justify-center gap-2 w-full py-3 mb-8 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 rounded-2xl transition-all font-semibold text-xs text-white"
          >
            <span>Obrolan Baru</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2 mb-4">Topik Jawara</h3>
              <div className="space-y-1">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-xs text-zinc-400 hover:bg-white/5 hover:text-white transition-all text-left group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-bold text-indigo-400">
                NA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-white">Nabil Akbar</p>
                <p className="text-[10px] text-zinc-500">Free Tier</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
