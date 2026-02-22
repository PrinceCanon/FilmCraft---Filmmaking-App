import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLock, FiArrowRight, FiShield, FiAlertTriangle, FiArrowLeft, FiEye, FiEyeOff } = FiIcons;

const JoinProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects_fc2024')
        .select('id, title, is_private, password')
        .eq('id', projectId)
        .single();

      if (error || !data) {
        setError('Project not found or link has expired.');
      } else {
        setProject(data);
        // If the project is NOT private, grant access immediately and redirect
        if (!data.is_private) {
          localStorage.setItem(`access_${projectId}`, 'granted');
          navigate(`/project/${projectId}`);
        }
      }
    } catch (err) {
      setError('Failed to connect to the studio.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (password === project.password) {
      // Grant local access session
      localStorage.setItem(`access_${projectId}`, 'granted');
      // Take them to the Project View as requested
      navigate(`/project/${projectId}`);
    } else {
      setError('Incorrect password. Please verify with the project owner.');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
        <p className="text-gray-400 font-medium">Opening Studio Gates...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 rounded-[2.5rem] w-full max-w-md p-10 backdrop-blur-2xl relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner">
            <SafeIcon icon={FiShield} className="text-5xl text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Secure Production</h1>
          <p className="text-gray-400 leading-relaxed px-4">
            You've been invited to collaborate on <br/>
            <span className="text-purple-400 font-bold">"{project?.title || 'a new production'}"</span>
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-400 text-sm"
          >
            <SafeIcon icon={FiAlertTriangle} className="flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {project && project.is_private && (
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Project Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <SafeIcon icon={FiLock} />
                </div>
                <input 
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white focus:ring-2 focus:ring-purple-500 outline-none text-lg transition-all"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <SafeIcon icon={showPass ? FiEyeOff : FiEye} />
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting || !password}
              className="w-full py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3 group"
            >
              <span>Enter Production Hub</span>
              <SafeIcon icon={FiArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-8 py-2 text-gray-500 hover:text-white transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Return to Dashboard</span>
        </button>
      </motion.div>
    </div>
  );
};

export default JoinProject;