import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiClock, FiPlay, FiCheck, FiLayers, FiVideo, FiArrowRight } = FiIcons;

const ProjectCard = ({ project, index }) => {
  const navigate = useNavigate();

  const getPhaseConfig = (phase) => {
    switch (phase) {
      case 'ideation': return { icon: FiEdit, color: 'bg-blue-500/20 text-blue-400', label: 'Idea' };
      case 'planning': return { icon: FiLayers, color: 'bg-purple-500/20 text-purple-400', label: 'Planning' };
      case 'shooting': return { icon: FiVideo, color: 'bg-red-500/20 text-red-400', label: 'Shooting' };
      case 'completed': return { icon: FiCheck, color: 'bg-green-500/20 text-green-400', label: 'Done' };
      default: return { icon: FiClock, color: 'bg-gray-500/20 text-gray-400', label: 'Draft' };
    }
  };

  const config = getPhaseConfig(project.phase);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/project/${project.id}`)}
      className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all backdrop-blur-sm relative overflow-hidden"
    >
      {/* Accent Background */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 ${config.color.split(' ')[1]}`} />

      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-xl ${config.color}`}>
          <SafeIcon icon={config.icon} className="text-xl" />
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.color} border border-current opacity-70`}>
          {config.label}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors truncate">
        {project.title}
      </h3>
      <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
        {project.concept || 'No concept description provided yet.'}
      </p>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
          <span>{project.type}</span>
          <span>•</span>
          <span>{project.duration}</span>
        </div>
        <div className="flex items-center text-purple-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Open</span>
          <SafeIcon icon={FiArrowRight} className="ml-1" />
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;