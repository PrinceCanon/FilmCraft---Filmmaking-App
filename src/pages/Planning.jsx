import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import PlanningPrompts from '../components/PlanningPrompts';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiFileText, FiCamera, FiCalendar, FiUsers, FiLayers, FiSkipForward } = FiIcons;

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
    { id: 'story-script', title: 'Story & Script', icon: FiFileText, description: 'Develop your story structure and script' },
    { id: 'shots', title: 'Shot List', icon: FiCamera, description: 'Plan your shots and camera angles' },
    { id: 'schedule', title: 'Schedule', icon: FiCalendar, description: 'Create your shooting schedule' },
    { id: 'resources', title: 'Resources', icon: FiUsers, description: 'Identify needed equipment and team' }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectBreadcrumb project={project} currentPhase="planning" className="mb-6" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
            <p className="text-purple-300">Phase 2: Planning. All sections are optional.</p>
          </div>
          <button 
            onClick={handleComplete}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-bold border border-white/10"
          >
            <span>Skip to Shooting</span>
            <SafeIcon icon={FiSkipForward} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-black/20 p-2 rounded-2xl border border-white/5">
          {steps.map((step, index) => (
            <button 
              key={step.id} 
              onClick={() => setCurrentStep(index)}
              className={`flex-1 min-w-[150px] flex items-center justify-center space-x-3 py-4 rounded-xl transition-all font-bold ${index === currentStep ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <SafeIcon icon={step.icon} />
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/10"
        >
          <PlanningPrompts 
            step={currentStep} 
            project={project} 
            onDataUpdate={handleDataUpdate} 
          />
        </motion.div>

        <div className="flex items-center justify-between">
          <button 
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(`/ideation/${projectId}`)}
            className="flex items-center space-x-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>{currentStep === 0 ? 'Back to Ideation' : 'Previous Section'}</span>
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center space-x-2 px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20"
          >
            <span>{currentStep === steps.length - 1 ? 'Go to Shooting' : 'Next Section'}</span>
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Planning;