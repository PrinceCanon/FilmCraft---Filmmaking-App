import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiFilm, FiLayers, FiVideo, FiTrendingUp, FiCheckCircle, FiArchive, FiActivity } = FiIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, loading } = useProject();
  const [activeTab, setActiveTab] = useState('active'); // active, completed, archived

  const stats = [
    { label: 'Total Stories', value: projects.length, icon: FiFilm, color: 'text-blue-400' },
    { label: 'In Production', value: projects.filter(p => p.phase === 'shooting' && !p.is_archived).length, icon: FiVideo, color: 'text-red-400' },
    { label: 'Planning', value: projects.filter(p => (p.phase === 'planning' || p.phase === 'ideation') && !p.is_archived).length, icon: FiLayers, color: 'text-purple-400' },
    { label: 'Archived', value: projects.filter(p => p.is_archived).length, icon: FiArchive, color: 'text-gray-400' },
  ];

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'archived') return p.is_archived;
    if (p.is_archived) return false;
    if (activeTab === 'completed') return p.phase === 'completed';
    return p.phase !== 'completed';
  });

  if (loading) return null;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Creative Studio</h1>
          <p className="text-gray-400">Welcome back. Ready for your next production?</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <stat.icon className={`${stat.color} text-xl mb-2`} />
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${activeTab === 'active' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <SafeIcon icon={FiActivity} className="text-sm" />
              <span>Active</span>
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${activeTab === 'completed' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <SafeIcon icon={FiCheckCircle} className="text-sm" />
              <span>Completed</span>
            </button>
            <button 
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center space-x-2 ${activeTab === 'archived' ? 'bg-gray-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <SafeIcon icon={FiArchive} className="text-sm" />
              <span>Archived</span>
            </button>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => navigate('/ideation')} 
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20"
          >
            <SafeIcon icon={FiPlus} />
            <span>New Video Project</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-white/5 border border-white/10 rounded-3xl">
                <SafeIcon icon={activeTab === 'completed' ? FiCheckCircle : activeTab === 'archived' ? FiArchive : FiFilm} className="text-6xl text-gray-700 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No {activeTab} projects</h3>
                <p className="text-gray-400">Your cinematic masterpieces will appear here.</p>
              </div>
            ) : (
              filteredProjects.map((project, idx) => (
                <ProjectCard key={project.id} project={project} index={idx} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;