import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import PlanningPrompts from '../components/PlanningPrompts';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiFileText, FiCamera, FiCalendar, FiUsers, FiSkipForward } = FiIcons;

const Planning = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject, checkAccess } = useProject();
  const [project, setProject] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      if (!checkAccess(projectData)) {
        navigate(`/join/${projectId}`);
        return;
      }
      setProject(projectData);
    } else {
      navigate('/');
    }
  }, [projectId, getProject, checkAccess, navigate]);

  const steps = [
    { id: 'script', title: 'Script Editor', icon: FiFileText, description: 'Write your professional screenplay' },
    { id: 'shots', title: 'Shot List', icon: FiCamera, description: 'Plan your camera movements and angles' },
    { id: 'resources', title: 'Resources', icon: FiUsers, description: 'Cast, crew and equipment' },
    { id: 'schedule', title: 'Schedule', icon: FiCalendar, description: 'Organize your production days' }
  ];

  const handleDataUpdate = (data) => {
    const updatedProject = { ...project, ...data };
    setProject(updatedProject);
    updateProject(projectId, data);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await updateProject(projectId, { phase: 'shooting' });
    navigate(`/shooting/${projectId}`);
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <ProjectBreadcrumb project={project} currentPhase="planning" className="mb-4" />
            <h1 className="text-4xl font-black text-white tracking-tighter">Production Planning</h1>
          </div>
          <button 
            onClick={handleComplete}
            className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all text-sm font-bold border border-white/10 backdrop-blur-sm"
          >
            <span>Production Hub</span>
            <SafeIcon icon={FiSkipForward} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-12 bg-white/5 p-2 rounded-[2rem] border border-white/10">
          {steps.map((step, index) => (
            <button 
              key={step.id} 
              onClick={() => setCurrentStep(index)}
              className={`flex-1 min-w-[150px] flex items-center justify-center space-x-3 py-5 rounded-3xl transition-all font-bold ${index === currentStep ? 'bg-purple-500 text-white shadow-xl shadow-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <SafeIcon icon={step.icon} />
              <span className="hidden md:inline">{step.title}</span>
            </button>
          ))}
        </div>

        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <PlanningPrompts 
            step={currentStep} 
            project={project} 
            onDataUpdate={handleDataUpdate} 
          />
        </motion.div>

        <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <button 
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(`/ideation/${projectId}`)}
            className="flex items-center space-x-2 px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] font-bold border border-white/10 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>{currentStep === 0 ? 'Back to Storyboard' : 'Previous Step'}</span>
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center space-x-2 px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.5rem] font-extrabold transition-all shadow-2xl shadow-purple-500/20 active:scale-95"
          >
            <span>{currentStep === steps.length - 1 ? 'Go to Production' : 'Next Step'}</span>
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planning;