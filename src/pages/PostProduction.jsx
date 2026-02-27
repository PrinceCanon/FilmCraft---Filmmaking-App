import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import ProjectChat from '../components/ProjectChat';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { 
  FiFilm, FiMessageCircle, FiArrowLeft, FiCheckCircle, 
  FiClock, FiCalendar, FiCheck, FiX, FiTarget, FiTrendingUp, FiAlertCircle
} = FiIcons;

const PostProduction = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, checkAccess, updateProject } = useProject();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      if (!checkAccess(projectData)) {
        navigate(`/join/${projectId}`);
        return;
      }
      setProject(projectData);
      loadMilestones();
    } else {
      navigate('/');
    }
  }, [projectId]);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('production_schedule_fc2024')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'post')
        .order('date', { ascending: true });
      
      if (error) throw error;
      setMilestones(data || []);
    } catch (err) {
      console.error('Error loading milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (confirm('Mark project as complete? This will archive the project.')) {
      await updateProject(projectId, { phase: 'completed' });
      navigate('/');
    }
  };

  const updateMilestoneStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('production_schedule_fc2024')
        .update({ completion_status: status })
        .eq('id', id);
      
      if (error) throw error;
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, completion_status: status } : m));
    } catch (err) {
      console.error('Error updating milestone:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDateRange = (start, end) => {
    if (!end || start === end) return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const completedCount = milestones.filter(m => m.completion_status === 'completed').length;
  const progressPercent = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  if (!project || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading Post-Production...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProjectBreadcrumb project={project} currentPhase="post-production" className="mb-8" />
        
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-[2.5rem] p-10 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[150px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-purple-500/30 rounded-2xl border border-purple-500/40">
                  <SafeIcon icon={FiFilm} className="text-purple-400 text-2xl" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Post-Production</h1>
                  <p className="text-purple-300 font-bold text-sm mt-1">Edit, refine, and deliver your film</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowChat(true)} 
              className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            >
              <SafeIcon icon={FiMessageCircle} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <SafeIcon icon={FiTarget} className="text-purple-400 text-2xl" />
              <span className="text-sm font-black text-gray-400 uppercase tracking-wider">Total Milestones</span>
            </div>
            <div className="text-4xl font-black text-white">{milestones.length}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <SafeIcon icon={FiCheckCircle} className="text-green-400 text-2xl" />
              <span className="text-sm font-black text-gray-400 uppercase tracking-wider">Completed</span>
            </div>
            <div className="text-4xl font-black text-white">{completedCount}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <SafeIcon icon={FiTrendingUp} className="text-blue-400 text-2xl" />
              <span className="text-sm font-black text-gray-400 uppercase tracking-wider">Progress</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-white">{progressPercent.toFixed(0)}%</div>
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <SafeIcon icon={FiAlertCircle} className="text-blue-400 text-xl mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-300 mb-1">Post-Production Workflow</h4>
              <p className="text-sm text-blue-200">
                Track your editing and finishing milestones here. To schedule new post-production tasks or update deadlines, 
                go to <strong>Planning → Schedule</strong> and select "Post-Production" as the activity type.
              </p>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <SafeIcon icon={FiCalendar} className="text-purple-400" />
              Post-Production Timeline
            </h2>
            <button
              onClick={() => navigate(`/planning/${projectId}`)}
              className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-300 font-bold text-sm transition-all"
            >
              + Add Milestone
            </button>
          </div>

          {milestones.length === 0 ? (
            <div className="text-center py-16">
              <SafeIcon icon={FiTarget} className="text-6xl text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Milestones Scheduled</h3>
              <p className="text-gray-400 mb-6">Schedule your post-production milestones in the Planning phase</p>
              <button
                onClick={() => navigate(`/planning/${projectId}`)}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold transition-all shadow-xl hover:scale-105"
              >
                Go to Planning
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white/5 border rounded-2xl p-6 transition-all ${
                    milestone.completion_status === 'completed' ? 'border-green-500/30 opacity-70' : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-black text-white">{milestone.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(milestone.completion_status)}`}>
                          {milestone.completion_status === 'completed' ? 'Completed' : 
                           milestone.completion_status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-2">
                          <SafeIcon icon={FiCalendar} className="text-purple-400" />
                          {calculateDateRange(milestone.date, milestone.end_date)}
                        </span>
                      </div>

                      {milestone.notes && (
                        <p className="text-sm text-gray-400 italic border-l-2 border-white/10 pl-4">{milestone.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {milestone.completion_status !== 'completed' && (
                        <button
                          onClick={() => updateMilestoneStatus(milestone.id, 'completed')}
                          className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <SafeIcon icon={FiCheck} />
                          Mark Complete
                        </button>
                      )}
                      {milestone.completion_status === 'completed' && (
                        <button
                          onClick={() => updateMilestoneStatus(milestone.id, 'pending')}
                          className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-xl text-gray-400 font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <SafeIcon icon={FiX} />
                          Undo
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
          <button 
            onClick={() => navigate(`/shooting/${projectId}`)} 
            className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Production</span>
          </button>
          
          <button 
            onClick={handleComplete}
            className="flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] font-bold transition-all shadow-xl shadow-green-500/20 hover:scale-105"
          >
            <SafeIcon icon={FiCheckCircle} />
            <span>Complete Project</span>
          </button>
        </div>
      </div>
      
      <ProjectChat projectId={projectId} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default PostProduction;