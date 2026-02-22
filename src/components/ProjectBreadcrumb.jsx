import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLightbulb, FiLayers, FiVideo, FiCheck, FiChevronRight, FiHome } = FiIcons;

const ProjectBreadcrumb = ({ project, currentPhase, className = '' }) => {
  const navigate = useNavigate();

  const phases = [
    { id: 'ideation', title: 'Ideation', icon: FiLightbulb, path: `/ideation/${project.id}`, color: 'text-blue-400' },
    { id: 'planning', title: 'Planning', icon: FiLayers, path: `/planning/${project.id}`, color: 'text-purple-400' },
    { id: 'shooting', title: 'Shooting', icon: FiVideo, path: `/shooting/${project.id}`, color: 'text-red-400' }
  ];

  const handlePhaseClick = (phase) => {
    // Always accessible in this flexible workflow update
    navigate(phase.path);
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-center space-x-2 text-sm">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
        >
          <SafeIcon icon={FiHome} />
          <span className="hidden md:inline">Dashboard</span>
        </motion.button>
        
        <SafeIcon icon={FiChevronRight} className="text-gray-600" />
        
        <div className="flex items-center bg-white/5 rounded-xl px-1 py-1">
          {phases.map((phase, idx) => {
            const isCurrent = phase.id === currentPhase;
            return (
              <React.Fragment key={phase.id}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePhaseClick(phase)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-white/10 text-white font-bold' 
                      : `${phase.color} hover:bg-white/5`
                  }`}
                >
                  <SafeIcon icon={phase.icon} />
                  <span className="hidden sm:inline">{phase.title}</span>
                </motion.button>
                {idx < phases.length - 1 && (
                  <div className="w-4 h-px bg-white/10 mx-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectBreadcrumb;