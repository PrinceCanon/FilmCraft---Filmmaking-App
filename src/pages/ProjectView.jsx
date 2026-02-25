import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import ProjectSettings from '../components/ProjectSettings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiTrash2, FiPlay, FiLayers, FiVideo, FiInfo, FiChevronRight, FiSettings, FiShare2, FiLock, FiCheck, FiUsers, FiMessageSquare, FiTrendingUp, FiClock, FiGrid } = FiIcons;

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, checkAccess } = useProject();
  const [project, setProject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const data = getProject(projectId);
    if (data) {
      if (!checkAccess(data)) {
        navigate(`/join/${projectId}`);
        return;
      }
      setProject(data);
    } else {
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
    }
  };

  if (!project) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'ideation', label: 'Ideation', icon: FiEdit, path: `/ideation/${projectId}` },
    { id: 'planning', label: 'Planning', icon: FiLayers, path: `/planning/${projectId}` },
    { id: 'shooting', label: 'Production', icon: FiVideo, path: `/shooting/${projectId}` },
  ];

  const stats = [
    { label: 'Scenes', value: (project.story_structure || []).length, icon: FiLayers, color: 'text-blue-400' },
    { label: 'Phase', value: project.phase.charAt(0).toUpperCase() + project.phase.slice(1), icon: FiTrendingUp, color: 'text-purple-400' },
    { label: 'Type', value: project.type, icon: FiInfo, color: 'text-pink-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <ProjectBreadcrumb project={project} currentPhase="overview" className="mb-4" />
          <div className="flex items-center space-x-3">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">{project.title}</h1>
            {project.is_private && <SafeIcon icon={FiLock} className="text-yellow-500 text-2xl" />}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleShare}
            className={`px-6 py-4 rounded-2xl transition-all flex items-center space-x-2 font-bold text-sm shadow-xl ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
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

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-12 bg-white/5 p-2 rounded-[2rem] border border-white/10 max-w-2xl">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => tab.path ? navigate(tab.path) : setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-3xl font-bold transition-all ${activeTab === tab.id ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <SafeIcon icon={tab.icon} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Creative Glance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />
            
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-10">Creative Glance</h3>
            
            <div className="space-y-12 relative z-10">
              <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
                <p className="text-2xl md:text-3xl text-white/90 leading-tight font-medium italic">
                  "{project.concept || "Defining the creative vision..."}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={stat.icon} className={`${stat.color} text-sm`} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Storyboard Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center">
                <SafeIcon icon={FiLayers} className="mr-2 text-blue-400" />
                Script Status
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-white">
                  {Array.isArray(project.script_json) ? project.script_json.length : 0} Blocks
                </div>
                <button onClick={() => navigate(`/ideation/${projectId}`)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
                  <SafeIcon icon={FiChevronRight} />
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center">
                <SafeIcon icon={FiVideo} className="mr-2 text-red-400" />
                Production Depth
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-white">
                  {project.phase.toUpperCase()}
                </div>
                <button onClick={() => navigate(`/shooting/${projectId}`)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
                  <SafeIcon icon={FiChevronRight} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center">
              <SafeIcon icon={FiTrendingUp} className="mr-2 text-purple-400" />
              Production Progress
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Concept', progress: 100, active: true },
                { label: 'Story Structure', progress: (project.story_structure || []).length > 0 ? 100 : 0, active: true },
                { label: 'Script', progress: (project.script_json || []).length > 0 ? 100 : 0, active: project.phase !== 'ideation' },
                { label: 'Production', progress: project.phase === 'completed' ? 100 : 0, active: project.phase === 'shooting' || project.phase === 'completed' }
              ].map((step, i) => (
                <div key={i} className={`space-y-2 ${!step.active ? 'opacity-30' : ''}`}>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">{step.label}</span>
                    <span className="text-white">{step.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${step.progress}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-[2rem] p-8">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <SafeIcon icon={FiMessageSquare} className="mr-2 text-purple-400" /> 
              Team Briefing
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Invite your crew to this project hub. They can access the script, storyboard, and production schedule in real-time.
            </p>
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                  Crew
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                +
              </div>
            </div>
          </div>
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