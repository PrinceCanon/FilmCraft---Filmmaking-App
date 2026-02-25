import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import IdeationPrompts from '../components/IdeationPrompts';
import StoryStructureBuilder from '../components/StoryStructureBuilder';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiZap, FiLayout, FiCheckCircle, FiChevronRight, FiChevronLeft } = FiIcons;

const Ideation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject, checkAccess } = useProject();
  const [project, setProject] = useState(null);
  const [activeStep, setActiveStep] = useState(0); // 0: Creative, 1: Storyboard
  const [creativeSubStep, setCreativeSubStep] = useState(0); // 0, 1, 2 for IdeationPrompts

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

  const handleDataUpdate = (data) => {
    const updatedProject = { ...project, ...data };
    setProject(updatedProject);
    updateProject(projectId, data);
  };

  if (!project) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <ProjectBreadcrumb project={project} currentPhase="ideation" className="mb-4" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Creative Ideation</h1>
        </div>

        <div className="flex space-x-2 mb-12 bg-white/5 p-2 rounded-[2rem] border border-white/10 max-w-lg">
          <button 
            onClick={() => setActiveStep(0)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-3xl font-bold transition-all ${activeStep === 0 ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <SafeIcon icon={FiZap} />
            <span>Creative Concept</span>
          </button>
          <button 
            onClick={() => setActiveStep(1)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-3xl font-bold transition-all ${activeStep === 1 ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <SafeIcon icon={FiLayout} />
            <span>Story Structure</span>
          </button>
        </div>

        <motion.div 
          key={activeStep + (activeStep === 0 ? creativeSubStep : 0)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {activeStep === 0 ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div className="flex space-x-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${creativeSubStep >= i ? 'bg-purple-500' : 'bg-white/10'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Step {creativeSubStep + 1} of 3
                </span>
              </div>
              
              <IdeationPrompts 
                step={creativeSubStep} 
                data={project} 
                onDataUpdate={handleDataUpdate} 
              />

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setCreativeSubStep(Math.max(0, creativeSubStep - 1))}
                  disabled={creativeSubStep === 0}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white disabled:opacity-0 transition-all"
                >
                  <SafeIcon icon={FiChevronLeft} />
                  <span>Previous</span>
                </button>
                <button 
                  onClick={() => creativeSubStep < 2 ? setCreativeSubStep(creativeSubStep + 1) : setActiveStep(1)}
                  className="flex items-center space-x-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all"
                >
                  <span>{creativeSubStep < 2 ? 'Continue' : 'Next: Story Structure'}</span>
                  <SafeIcon icon={FiChevronRight} />
                </button>
              </div>
            </div>
          ) : (
            <StoryStructureBuilder project={project} onDataUpdate={handleDataUpdate} />
          )}
        </motion.div>

        <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <button 
            onClick={() => activeStep === 1 ? setActiveStep(0) : navigate(`/project/${projectId}`)}
            className="flex items-center space-x-2 px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] font-bold border border-white/10 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>{activeStep === 1 ? 'Back to Concept' : 'Project Hub'}</span>
          </button>
          
          <button 
            onClick={() => activeStep === 0 ? setActiveStep(1) : navigate(`/planning/${projectId}`)}
            className="flex items-center space-x-2 px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] font-extrabold transition-all shadow-2xl shadow-purple-500/20 active:scale-95"
          >
            <span>{activeStep === 0 ? 'Next: Storyboard' : 'Start Planning'}</span>
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ideation;