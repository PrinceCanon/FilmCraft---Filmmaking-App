import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import IdeationPrompts from '../components/IdeationPrompts';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

// Added FiUsers to the destructured icons
const { FiArrowRight, FiLightbulb, FiTarget, FiAlertCircle, FiChevronLeft, FiUsers } = FiIcons;

const Ideation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { createProject, updateProject, getProject } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState(null);
  const [projectData, setProjectData] = useState({
    title: '',
    type: 'Vlog',
    target_audience: '',
    duration: '1-3 minutes',
    concept: '',
    key_message: '',
    tone: 'Casual & Friendly',
    inspiration: '',
    unique_angle: ''
  });

  const steps = [
    { id: 'basics', title: 'Project Basics', icon: FiTarget, description: 'Define your project fundamentals' },
    { id: 'concept', title: 'Concept Development', icon: FiLightbulb, description: 'Develop your creative concept' },
    { id: 'audience', title: 'Audience & Tone', icon: FiUsers, description: 'Define your target audience and tone' }
  ];

  useEffect(() => {
    if (projectId) {
      const existingProject = getProject(projectId);
      if (existingProject) {
        setProject(existingProject);
        setIsEditing(true);
        setProjectData({
          title: existingProject.title || '',
          type: existingProject.type || 'Vlog',
          target_audience: existingProject.target_audience || '',
          duration: existingProject.duration || '1-3 minutes',
          concept: existingProject.concept || '',
          key_message: existingProject.key_message || '',
          tone: existingProject.tone || 'Casual & Friendly',
          inspiration: existingProject.inspiration || '',
          unique_angle: existingProject.unique_angle || ''
        });
      }
    }
  }, [projectId, getProject]);

  const handleDataUpdate = (data) => {
    setProjectData(prev => ({ ...prev, ...data }));
    setError('');
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      // Use a default title if none provided to satisfy DB constraints
      const finalData = {
        ...projectData,
        title: projectData.title?.trim() || 'Untitled Project ' + new Date().toLocaleDateString()
      };

      if (isEditing) {
        await updateProject(projectId, finalData);
        navigate(`/project/${projectId}`);
      } else {
        const newProject = await createProject(finalData);
        navigate(`/planning/${newProject.id}`);
      }
    } catch (err) {
      console.error('Ideation error:', err);
      setError('Connection failed. Your progress might not have saved.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {project && <ProjectBreadcrumb project={project} currentPhase="ideation" className="mb-8" />}
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4">
            <SafeIcon icon={FiLightbulb} className="text-blue-400" />
            <span className="text-blue-400 font-bold text-sm tracking-wide uppercase">Ideation Phase</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isEditing ? 'Refine Your Direction' : 'Start Your Journey'}
          </h1>
          <p className="text-gray-400">Step {currentStep + 1} of 3: You can skip any field and return later.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400"
          >
            <SafeIcon icon={FiAlertCircle} />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl"
            >
              <IdeationPrompts step={currentStep} data={projectData} onDataUpdate={handleDataUpdate} />
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Real-time Preview</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Title</label>
                  <p className="text-white font-medium">{projectData.title || 'Untitled Project'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Concept Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${projectData.concept ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <p className="text-xs text-gray-400">{projectData.concept ? 'Developing' : 'Empty'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <button 
            onClick={handleBack}
            className="flex items-center space-x-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
          >
            <SafeIcon icon={FiChevronLeft} />
            <span>{currentStep === 0 ? 'Dashboard' : 'Back'}</span>
          </button>
          
          <button 
            onClick={handleNext}
            disabled={loading}
            className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>{currentStep === 2 ? (isEditing ? 'Finish Editing' : 'Start Planning') : 'Next Step'}</span>
                <SafeIcon icon={FiArrowRight} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ideation;