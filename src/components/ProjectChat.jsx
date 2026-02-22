import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMessageCircle, FiSend, FiX, FiUsers, FiTrash2, 
  FiCheck, FiSmile, FiPaperclip, FiAlertCircle, FiInfo 
} = FiIcons;

const COMMON_EMOJIS = ['🎬', '🎥', '✨', '🔥', '🚀', '👏', '🙌', '💯', '✅', '❌', '💡', '📝', '📸', '📽️'];

const ProjectChat = ({ projectId, isOpen, onClose }) => {
  const { user } = useProject();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadMessages();
      
      const channel = supabase
        .channel(`project_chat_side_${projectId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'project_comments_fc2024', filter: `project_id=eq.${projectId}` },
          (payload) => {
            if (payload.eventType === 'INSERT') setMessages(prev => [...prev, payload.new]);
            else if (payload.eventType === 'DELETE') setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const filePath = `chat-media/${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('shot-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('shot-images').getPublicUrl(filePath);
      await sendMessage(null, publicUrl);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e, imageUrl = null) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !imageUrl) return;

    try {
      await supabase.from('project_comments_fc2024').insert([{
        project_id: projectId,
        user_id: user.id,
        content: newMessage.trim(),
        image_url: imageUrl,
        metadata: { author_email: user.email }
      }]);
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-lg border-l border-white/10 z-50 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiMessageCircle} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Studio Chat</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><SafeIcon icon={FiX} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.user_id === user.id ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-500 mb-1 px-1">
              {message.user_id === user.id ? 'You' : (message.metadata?.author_email || 'Team')}
            </span>
            <div className={`p-3 rounded-xl text-sm max-w-[90%] ${message.user_id === user.id ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10'}`}>
              {message.image_url && <img src={message.image_url} className="rounded-lg mb-2 max-w-full" alt="upload" />}
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div className="grid grid-cols-7 gap-1 mb-3 p-2 bg-white/5 rounded-xl">
              {COMMON_EMOJIS.map(e => <button key={e} onClick={() => setNewMessage(p => p + e)} className="text-lg hover:scale-125 transition-transform">{e}</button>)}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={sendMessage} className="space-y-3">
          <div className="flex items-end space-x-2">
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message team..."
                className="w-full bg-transparent p-3 text-sm text-white outline-none resize-none"
                rows={1}
              />
              <div className="px-2 py-1 flex items-center space-x-2">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 text-gray-500 hover:text-white"><SafeIcon icon={FiSmile} /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1 text-gray-500 hover:text-white"><SafeIcon icon={FiPaperclip} /></button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
              </div>
            </div>
            <button type="submit" className="p-3 bg-purple-600 rounded-xl text-white"><SafeIcon icon={FiSend} /></button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ProjectChat;