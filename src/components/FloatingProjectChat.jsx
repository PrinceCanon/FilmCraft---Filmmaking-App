import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMessageCircle, FiSend, FiX, FiTrash2, FiSearch, 
  FiMaximize2, FiMinimize2, FiMessageSquare, FiSmile, FiPaperclip 
} = FiIcons;

const COMMON_EMOJIS = ['🎬', '🎥', '✨', '🔥', '🚀', '👏', '🙌', '💯', '✅', '❌', '💡', '📝', '📸', '📽️'];

const FloatingProjectChat = ({ projectId }) => {
  const { user } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (projectId) {
      loadMessages();
      
      const channel = supabase
        .channel(`project_chat_${projectId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'project_comments_fc2024', filter: `project_id=eq.${projectId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => {
                // Prevent duplicate inserts from local state + subscription
                if (prev.find(m => m.id === payload.new.id)) return prev;
                return [...prev, payload.new];
              });
            } else if (payload.eventType === 'DELETE') {
              setMessages(prev => prev.filter(m => m.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId]);

  useEffect(() => {
    if (!isMinimized && isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, isMinimized, isOpen, scrollToBottom]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_comments_fc2024')
        .select('*')
        .eq('project_id', projectId)
        .is('shot_id', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `chat-media/${projectId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('shot-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('shot-images').getPublicUrl(filePath);
      await sendMessage(null, publicUrl);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e, imageUrl = null) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !imageUrl) return;

    const content = newMessage.trim();
    setNewMessage(''); // Optimistic clear
    setShowEmojiPicker(false);

    try {
      const { error } = await supabase
        .from('project_comments_fc2024')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          content: content,
          image_url: imageUrl,
          message_type: 'general',
          metadata: { author_email: user.email || 'Collaborator' }
        }]);
      if (error) throw error;
    } catch (error) {
      console.error('Send error:', error);
      setNewMessage(content); // Revert on failure
    }
  };

  const filteredMessages = messages.filter(msg => 
    !searchQuery.trim() || msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <motion.button 
        className="fixed bottom-8 right-8 z-[60] group flex items-center space-x-3"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 shadow-2xl">
          Studio Chat
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 animate-pulse-slow rounded-full" />
          <div className="relative bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-full p-5 shadow-2xl border border-white/20">
            <SafeIcon icon={FiMessageSquare} className="text-2xl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full" />
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`fixed z-[110] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] ${isMinimized ? 'bottom-8 right-24 w-72 h-16' : 'bottom-8 right-8 w-[400px] h-[650px]'}`}
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
          >
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <SafeIcon icon={FiMessageCircle} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Studio Hub</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Live Presence</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
                  <SafeIcon icon={isMinimized ? FiMaximize2 : FiMinimize2} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
                  <SafeIcon icon={FiX} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="flex flex-col h-[calc(100%-88px)]">
                <div className="p-4 bg-white/5 border-b border-white/5">
                  <div className="relative">
                    <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search history..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {loading && messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <SafeIcon icon={FiMessageCircle} className="text-5xl mb-4" />
                      <p className="text-sm font-medium">Be the first to brief the crew...</p>
                    </div>
                  ) : (
                    filteredMessages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center space-x-2 mb-1.5 px-1">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            {msg.user_id === user.id ? 'Production' : (msg.metadata?.author_email?.split('@')[0] || 'Member')}
                          </span>
                          <span className="text-[10px] text-gray-600 font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`px-5 py-3.5 rounded-[1.5rem] text-sm max-w-[88%] group relative shadow-sm ${msg.user_id === user.id ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                          {msg.image_url && (
                            <img 
                              src={msg.image_url} 
                              alt="Production media" 
                              className="rounded-xl mb-3 max-w-full h-auto cursor-pointer border border-white/10" 
                              onClick={() => window.open(msg.image_url, '_blank')} 
                            />
                          )}
                          <div className="leading-relaxed">{msg.content}</div>
                          {msg.user_id === user.id && (
                            <button 
                              onClick={() => supabase.from('project_comments_fc2024').delete().eq('id', msg.id)}
                              className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                            >
                              <SafeIcon icon={FiTrash2} className="text-xs" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5">
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="p-4 mb-4 bg-slate-800 border border-white/10 rounded-[1.5rem] grid grid-cols-7 gap-3 shadow-2xl"
                      >
                        {COMMON_EMOJIS.map(e => (
                          <button 
                            key={e} 
                            onClick={() => { setNewMessage(prev => prev + e); }} 
                            className="text-2xl hover:scale-125 transition-transform p-1"
                          >
                            {e}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={(e) => sendMessage(e)} className="flex items-end space-x-3">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                      <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                        placeholder="Type a briefing..."
                        rows={1}
                        className="w-full bg-transparent px-5 py-4 text-sm text-white focus:outline-none resize-none max-h-32 scrollbar-hide"
                      />
                      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'text-purple-400 bg-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}>
                            <SafeIcon icon={FiSmile} />
                          </button>
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-gray-300 rounded-xl transition-all hover:bg-white/5">
                            <SafeIcon icon={FiPaperclip} />
                          </button>
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </div>
                        {uploading && <div className="text-[10px] text-purple-400 font-black animate-pulse tracking-widest">UPLOADING</div>}
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={(!newMessage.trim() && !uploading) || uploading}
                      className="p-5 bg-purple-600 hover:bg-purple-500 text-white rounded-[1.5rem] transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 active:scale-90"
                    >
                      <SafeIcon icon={FiSend} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingProjectChat;