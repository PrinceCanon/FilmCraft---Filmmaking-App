import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import ProjectChat from './ProjectChat';
import ProjectBreadcrumb from './ProjectBreadcrumb';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiCheck, FiChevronDown, FiChevronRight, FiVideo, FiSun, FiMic, FiMapPin, FiPackage, FiUsers, FiCheckCircle, FiRefreshCw, FiArrowLeft, FiMessageCircle } = FiIcons;

const Shooting = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProject();
  const [project, setProject] = useState(null);
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState(new Set());
  const [sceneChecklists, setSceneChecklists] = useState({});
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const sceneChecklistItems = [
    { key: 'lighting_setup', label: 'Lighting', icon: FiSun },
    { key: 'audio_check', label: 'Audio', icon: FiMic },
    { key: 'location_ready', label: 'Location', icon: FiMapPin },
    { key: 'props_ready', label: 'Props', icon: FiPackage },
    { key: 'equipment_check', label: 'Equipment', icon: FiCamera },
    { key: 'team_ready', label: 'Team', icon: FiUsers }
  ];

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      setProject(projectData);
      loadData();
    }
  }, [projectId, getProject]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shotsRes, scenesRes] = await Promise.all([
        supabase.from('shot_lists_fc2024').select('*').eq('project_id', projectId).order('order_index'),
        supabase.from('scenes_fc2024').select('*').eq('project_id', projectId).order('scene_number')
      ]);

      setShots(shotsRes.data || []);
      setScenes(scenesRes.data || []);
      
      const checklists = {};
      (scenesRes.data || []).forEach(s => checklists[s.scene_number] = s.checklist || {});
      setSceneChecklists(checklists);
      
      if (scenesRes.data?.length > 0) setExpandedScenes(new Set([scenesRes.data[0].scene_number]));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShotToggle = async (shotId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, status: newStatus } : s));
    await supabase.from('shot_lists_fc2024').update({ status: newStatus }).eq('id', shotId);
  };

  const handleChecklistToggle = async (sceneNum, key) => {
    const newChecklist = { ...sceneChecklists[sceneNum], [key]: !sceneChecklists[sceneNum]?.[key] };
    setSceneChecklists(prev => ({ ...prev, [sceneNum]: newChecklist }));
    await supabase.from('scenes_fc2024').update({ checklist: newChecklist }).eq('project_id', projectId).eq('scene_number', sceneNum);
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
              <p className="text-gray-400">Production Dashboard • {shots.length} Shots Total</p>
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
          {scenes.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <SafeIcon icon={FiCamera} className="text-6xl text-gray-700 mx-auto mb-4" />
              <h2 className="text-xl text-white font-bold mb-2">No Scenes Found</h2>
              <p className="text-gray-500 mb-8">Go to Planning to breakdown your story into scenes.</p>
              <button onClick={() => navigate(`/planning/${projectId}`)} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl">Go to Planning</button>
            </div>
          ) : (
            scenes.map(scene => (
              <div key={scene.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
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
                    <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
                      <SafeIcon icon={expandedScenes.has(scene.scene_number) ? FiChevronDown : FiChevronRight} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{scene.title}</h3>
                      <p className="text-gray-500 text-sm">{scene.location || 'No location set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-bold text-gray-400">
                        {shots.filter(s => s.scene_number === scene.scene_number && s.status === 'completed').length} / {shots.filter(s => s.scene_number === scene.scene_number).length}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedScenes.has(scene.scene_number) && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-white/5">
                      <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Checklist - Now purely optional info */}
                        <div className="lg:col-span-1 space-y-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Setup Checklist</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                            {sceneChecklistItems.map(item => (
                              <button
                                key={item.key}
                                onClick={() => handleChecklistToggle(scene.scene_number, item.key)}
                                className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                                  sceneChecklists[scene.scene_number]?.[item.key]
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                    : 'bg-white/5 border-white/10 text-gray-500'
                                }`}
                              >
                                <SafeIcon icon={item.icon} className="text-sm" />
                                <span className="text-xs font-bold">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Shot Progress - Can be toggled anytime */}
                        <div className="lg:col-span-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Scene Shots</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shots.filter(s => s.scene_number === scene.scene_number).map(shot => (
                              <div 
                                key={shot.id}
                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                                  shot.status === 'completed' 
                                    ? 'bg-green-500/10 border-green-500/30' 
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${shot.status === 'completed' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                    {shot.order_index}
                                  </div>
                                  <div>
                                    <div className="text-white font-bold">{shot.title}</div>
                                    <div className="text-gray-500 text-xs">{shot.shot_type}</div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleShotToggle(shot.id, shot.status)}
                                  className={`p-3 rounded-xl transition-all ${
                                    shot.status === 'completed'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                  }`}
                                >
                                  <SafeIcon icon={FiCheck} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
      <ProjectChat projectId={projectId} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default Shooting;