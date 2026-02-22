import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import ProjectSettings from '../components/ProjectSettings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiTrash2, FiPlay, FiLayers, FiVideo, FiInfo, FiChevronRight, FiSettings, FiShare2, FiLock, FiUnlock, FiCheck, FiUsers, FiMessageSquare } = FiIcons;

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, checkAccess } = useProject();
  const [project, setProject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = getProject(projectId);
    if (data) {
      if (!checkAccess(data)) {
        navigate(`/join/${projectId}`);
        return;
      }
      setProject(data);
    } else {
      // Small timeout to allow context to load if landing directly
      const timer = setTimeout(() => {
        const retryData = getProject(projectId);
        if (!retryData) navigate(`/join/${projectId}`);
        else setProject(retryData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projectId, getProject, checkAccess, navigate]);

  const handleShare = async () => {
    const url = `${window.location.origin}/#/join/${projectId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!project) return null;

  const quickActions = [
    { label: 'Refine Idea', icon: FiEdit, path: `/ideation/${projectId}`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Planning', icon: FiLayers, path: `/planning/${projectId}`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Production', icon: FiVideo, path: `/shooting/${projectId}`, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <ProjectBreadcrumb project={project} currentPhase="overview" className="mb-8" />
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 relative z-10 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{project.title}</h1>
                  {project.is_private && (
                    <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-xl border border-yellow-500/20">
                      <SafeIcon icon={FiLock} className="text-lg" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-xl text-xs font-black uppercase tracking-widest border border-purple-500/30">
                    {project.phase}
                  </span>
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <span className="text-gray-400 text-sm font-medium">{project.type} • {project.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleShare}
                  className={`px-6 py-4 rounded-2xl transition-all flex items-center space-x-2 font-bold text-sm shadow-lg ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                >
                  <SafeIcon icon={copied ? FiCheck : FiShare2} className="text-lg" />
                  <span>{copied ? 'Link Copied' : 'Share Project'}</span>
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all border border-white/10"
                >
                  <SafeIcon icon={FiSettings} className="text-xl" />
                </button>
              </div>
            </div>

            <div className="space-y-10 relative z-10">
              <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Production Concept</h3>
                <p className="text-2xl text-white/90 leading-relaxed font-medium">
                  {project.concept || "The creative vision for this project is still being developed."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Key Message</h3>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-white/80 text-sm leading-relaxed">
                    {project.key_message || 'Defining the core message...'}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Target Audience</h3>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-white/80 text-sm leading-relaxed">
                    {project.target_audience || 'Identifying the audience...'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-xl"
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <SafeIcon icon={FiPlay} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Project Flow</h3>
            </div>
            
            <div className="space-y-4">
              {quickActions.map((action) => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[1.5rem] transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${action.bg}`}>
                      <SafeIcon icon={action.icon} className={action.color} />
                    </div>
                    <span className="font-bold text-white">{action.label}</span>
                  </div>
                  <SafeIcon icon={FiChevronRight} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/10">
                <h4 className="text-white font-bold text-sm mb-3 flex items-center">
                  <SafeIcon icon={FiMessageSquare} className="mr-2 text-purple-400" /> 
                  Collaboration Hub
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  External collaborators can use the <strong>Studio Chat</strong> (bottom right) to talk with the production team in real-time.
                </p>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                      {i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                    +
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ProjectSettings 
        project={project} 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default ProjectView;