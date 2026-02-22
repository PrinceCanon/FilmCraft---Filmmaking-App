import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import ProjectChat from '../components/ProjectChat';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiCheck, FiVideo, FiSun, FiMic, FiMapPin, FiPackage, FiUsers, FiMessageCircle, FiChevronDown, FiChevronRight, FiArrowLeft, FiCheckCircle } = FiIcons;

const Shooting = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject, checkAccess } = useProject();
  const [project, setProject] = useState(null);
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      if (!checkAccess(projectData)) {
        navigate(`/join/${projectId}`);
        return;
      }
      setProject(projectData);
      loadProductionData();
    } else {
      navigate('/');
    }
  }, [projectId, getProject, checkAccess, navigate]);

  const loadProductionData = async () => {
    setLoading(true);
    const [shotsRes, scenesRes] = await Promise.all([
      supabase.from('shot_lists_fc2024').select('*').eq('project_id', projectId).order('order_index'),
      supabase.from('scenes_fc2024').select('*').eq('project_id', projectId).order('scene_number')
    ]);
    setShots(shotsRes.data || []);
    setScenes(scenesRes.data || []);
    setLoading(false);
  };

  const handleShotToggle = async (shotId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, status: newStatus } : s));
    await supabase.from('shot_lists_fc2024').update({ status: newStatus }).eq('id', shotId);
  };

  const handleCompleteProject = async () => {
    setCompleting(true);
    try {
      await updateProject(projectId, { phase: 'completed', completed_at: new Date().toISOString() });
      navigate('/');
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  if (!project || loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Production...</div>;

  const totalCompleted = shots.filter(s => s.status === 'completed').length;
  const progress = shots.length > 0 ? (totalCompleted / shots.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProjectBreadcrumb project={project} currentPhase="shooting" className="mb-8" />
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
              <p className="text-gray-400">Production Dashboard • {shots.length} Shots total</p>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowChat(true)} className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
                <SafeIcon icon={FiMessageCircle} className="text-xl" />
              </button>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-500">{progress.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Complete</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full" />
          </div>
        </div>

        <div className="space-y-6">
          {scenes.map(scene => (
            <div key={scene.scene_number} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div 
                className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
                onClick={() => setExpandedScenes(prev => {
                  const next = new Set(prev);
                  if (next.has(scene.scene_number)) next.delete(scene.scene_number);
                  else next.add(scene.scene_number);
                  return next;
                })}
              >
                <div className="flex items-center space-x-4">
                  <SafeIcon icon={expandedScenes.has(scene.scene_number) ? FiChevronDown : FiChevronRight} className="text-red-400" />
                  <h3 className="text-xl font-bold text-white">{scene.title}</h3>
                </div>
                <div className="text-sm font-bold text-gray-400">
                  {shots.filter(s => s.scene_number === scene.scene_number && s.status === 'completed').length} / {shots.filter(s => s.scene_number === scene.scene_number).length}
                </div>
              </div>

              <AnimatePresence>
                {expandedScenes.has(scene.scene_number) && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: 'auto' }} 
                    exit={{ height: 0 }} 
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {shots.filter(s => s.scene_number === scene.scene_number).map(shot => (
                        <div key={shot.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${shot.status === 'completed' ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${shot.status === 'completed' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                              {shot.order_index}
                            </div>
                            <div>
                              <div className="text-white font-bold text-sm">{shot.title}</div>
                              <div className="text-gray-500 text-xs">{shot.shot_type} • <span className="text-blue-400">{shot.shot_angle || 'Eye Level'}</span></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleShotToggle(shot.id, shot.status)}
                            className={`p-2 rounded-lg transition-all ${shot.status === 'completed' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}
                          >
                            <SafeIcon icon={FiCheck} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
          <button onClick={() => navigate(`/planning/${projectId}`)} className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold">
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Planning</span>
          </button>
          
          <button 
            onClick={handleCompleteProject}
            disabled={completing}
            className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-green-500/20"
          >
            {completing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <SafeIcon icon={FiCheckCircle} />
                <span>Complete Production</span>
              </>
            )}
          </button>
        </div>
      </div>
      <ProjectChat projectId={projectId} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default Shooting;