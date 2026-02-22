import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';

const { FiSettings, FiX, FiLock, FiUnlock, FiArchive, FiTrash2, FiShield, FiEye, FiEyeOff, FiAlertTriangle } = FiIcons;

const ProjectSettings = ({ project, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { updateProject, deleteProject } = useProject();
  const [password, setPassword] = useState(project.password || '');
  const [isPrivate, setIsPrivate] = useState(project.is_private || false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await updateProject(project.id, {
        password: password.trim() || null,
        is_private: isPrivate
      });
      onClose();
    } catch (e) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async () => {
    try {
      await updateProject(project.id, { is_archived: !project.is_archived });
      onClose();
    } catch (e) {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Permanently delete this project? All shots, scripts, and chat history will be lost forever.")) {
      setLoading(true);
      try {
        await deleteProject(project.id);
        onClose();
        navigate('/');
      } catch (e) {
        setError("Could not delete project. There might be active collaborators or media constraints.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <SafeIcon icon={FiSettings} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Studio Config</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <SafeIcon icon={FiX} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm">
              <SafeIcon icon={FiAlertTriangle} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Privacy Hub</h4>
            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                  <SafeIcon icon={isPrivate ? FiLock : FiUnlock} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Private Studio</div>
                  <div className="text-xs text-gray-500">Require access code</div>
                </div>
              </div>
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-14 h-7 rounded-full p-1 transition-all ${isPrivate ? 'bg-purple-600' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-7' : 'translate-x-0'} shadow-lg`} />
              </button>
            </div>

            <AnimatePresence>
              {isPrivate && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Access Password</label>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter studio code"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none pr-14"
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <SafeIcon icon={showPass ? FiEyeOff : FiEye} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Danger Zone</h4>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleToggleArchive}
                className="flex items-center justify-center space-x-3 p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.5rem] text-white transition-all group"
              >
                <SafeIcon icon={FiArchive} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">{project.is_archived ? 'Activate' : 'Archive'}</span>
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center justify-center space-x-3 p-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-[1.5rem] text-red-400 transition-all group disabled:opacity-50"
              >
                <SafeIcon icon={FiTrash2} className="group-hover:animate-bounce" />
                <span className="text-sm font-bold">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/5 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-gray-400 font-bold hover:text-white transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-extrabold shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? 'Processing...' : 'Save Studio'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectSettings;