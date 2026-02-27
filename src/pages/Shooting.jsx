import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProject } from '../context/ProjectContext';
import SafeIcon from '../common/SafeIcon';
import ProjectChat from '../components/ProjectChat';
import ProjectBreadcrumb from '../components/ProjectBreadcrumb';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { 
  FiCamera, FiCheck, FiVideo, FiMapPin, FiPackage, 
  FiUsers, FiMessageCircle, FiArrowLeft, FiArrowRight, 
  FiClock, FiCalendar, FiAlertCircle, FiFilm, FiUser, FiTool, FiSun
} = FiIcons;

const Shooting = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, checkAccess, updateProject } = useProject();
  const [project, setProject] = useState(null);
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wrapping, setWrapping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedShootDay, setSelectedShootDay] = useState(null);

  useEffect(() => {
    const projectData = getProject(projectId);
    if (projectData) {
      if (!checkAccess(projectData)) {
        navigate(`/join/${projectId}`);
        return;
      }
      setProject(projectData);
      loadShootingData();
    } else {
      navigate('/');
    }
  }, [projectId]);

  const loadShootingData = async () => {
    setLoading(true);
    const [shotsRes, scenesRes, scheduleRes, castRes, crewRes, equipRes] = await Promise.all([
      supabase.from('shot_lists_fc2024').select('*').eq('project_id', projectId).order('scene_number').order('order_index'),
      supabase.from('scenes_fc2024').select('*').eq('project_id', projectId).order('scene_number'),
      supabase.from('production_schedule_fc2024').select('*').eq('project_id', projectId).eq('type', 'shoot').order('date').order('start_time'),
      supabase.from('cast_fc2024').select('*').eq('project_id', projectId),
      supabase.from('crew_fc2024').select('*').eq('project_id', projectId),
      supabase.from('equipment_fc2024').select('*').eq('project_id', projectId)
    ]);
    
    setShots(shotsRes.data || []);
    setScenes(scenesRes.data || []);
    setSchedule(scheduleRes.data || []);
    setCast(castRes.data || []);
    setCrew(crewRes.data || []);
    setEquipment(equipRes.data || []);
    
    if (scheduleRes.data && scheduleRes.data.length > 0) {
      setSelectedShootDay(scheduleRes.data[0]);
    }
    
    setLoading(false);
  };

  const handleShotToggle = async (shotId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, status: newStatus } : s));
    await supabase.from('shot_lists_fc2024').update({ status: newStatus }).eq('id', shotId);
  };

  const handleWrapProduction = async () => {
    if (confirm('🎬 Wrap production and move to Post-Production?\n\nThis will move the project to the editing and finishing phase.')) {
      try {
        setWrapping(true);
        const updatedProject = await updateProject(projectId, { phase: 'post-production' });
        
        if (updatedProject) {
          // Small delay to ensure state updates
          setTimeout(() => {
            navigate(`/post-production/${projectId}`);
          }, 500);
        }
      } catch (error) {
        console.error('Error wrapping production:', error);
        alert('Failed to wrap production. Please try again.');
      } finally {
        setWrapping(false);
      }
    }
  };

  const getShotsForDay = (day) => {
    if (!day || !day.scenes_to_shoot) return [];
    const sceneNumbers = day.scenes_to_shoot;
    return shots.filter(shot => sceneNumbers.includes(shot.scene_number));
  };

  const getCastForDay = (day) => {
    if (!day || !day.cast_needed) return [];
    return cast.filter(c => day.cast_needed.includes(c.id));
  };

  const getCrewForDay = (day) => {
    if (!day || !day.crew_needed) return [];
    return crew.filter(c => day.crew_needed.includes(c.id));
  };

  const getEquipmentForDay = (day) => {
    if (!day || !day.equipment_needed) return [];
    return equipment.filter(e => day.equipment_needed.includes(e.id));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!project || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading Production...</p>
        </div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ProjectBreadcrumb project={project} currentPhase="shooting" className="mb-8" />
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-16 text-center">
            <SafeIcon icon={FiAlertCircle} className="text-8xl text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">No Shoot Days Scheduled</h2>
            <p className="text-gray-400 mb-8 text-lg">You need to create a production schedule before starting production.</p>
            <button 
              onClick={() => navigate(`/planning/${projectId}`)}
              className="px-12 py-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg rounded-3xl transition-all"
            >
              Go to Planning & Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dayShots = getShotsForDay(selectedShootDay);
  const completedToday = dayShots.filter(s => s.status === 'completed').length;
  const progressToday = dayShots.length > 0 ? (completedToday / dayShots.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProjectBreadcrumb project={project} currentPhase="shooting" className="mb-8" />
        
        {/* Header */}
        <div className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 rounded-[2.5rem] p-10 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 blur-[150px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-red-500/30 rounded-2xl border border-red-500/40">
                  <SafeIcon icon={FiVideo} className="text-red-400 text-2xl" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Production</h1>
                  <p className="text-red-300 font-bold text-sm mt-1">{schedule.length} Shoot Day{schedule.length !== 1 ? 's' : ''} Scheduled</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Shoot Days List (Sidebar) */}
          <div className="xl:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sticky top-8">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <SafeIcon icon={FiCalendar} className="text-purple-400" />
                Shoot Days
              </h3>
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {schedule.map((day, idx) => {
                  const isSelected = selectedShootDay?.id === day.id;
                  const dayShots = getShotsForDay(day);
                  const dayCompleted = dayShots.filter(s => s.status === 'completed').length;
                  const dayProgress = dayShots.length > 0 ? (dayCompleted / dayShots.length) * 100 : 0;
                  
                  return (
                    <motion.button
                      key={day.id}
                      onClick={() => setSelectedShootDay(day)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-purple-600 border-purple-500 shadow-xl' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } border`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                          Day {idx + 1}
                        </span>
                        {dayProgress === 100 && (
                          <SafeIcon icon={FiCheck} className="text-green-400" />
                        )}
                      </div>
                      <div className={`font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                        {dayShots.length} shot{dayShots.length !== 1 ? 's' : ''}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div className="bg-green-400 h-1.5 rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {selectedShootDay && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedShootDay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Call Sheet */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <SafeIcon icon={FiSun} className="text-yellow-400" />
                        {formatDate(selectedShootDay.date)}
                      </h2>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Progress</div>
                        <div className="text-3xl font-black text-white">{progressToday.toFixed(0)}%</div>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <SafeIcon icon={FiClock} className="text-blue-400" />
                          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Call Time</span>
                        </div>
                        <div className="text-2xl font-black text-white">{formatTime(selectedShootDay.start_time)}</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <SafeIcon icon={FiClock} className="text-orange-400" />
                          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Wrap Time</span>
                        </div>
                        <div className="text-2xl font-black text-white">{formatTime(selectedShootDay.end_time)}</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <SafeIcon icon={FiMapPin} className="text-purple-400" />
                          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Location</span>
                        </div>
                        <div className="text-lg font-black text-white truncate">{selectedShootDay.location || 'TBD'}</div>
                      </div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Cast */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <SafeIcon icon={FiUser} className="text-purple-400" />
                          <h4 className="font-black text-white">Cast</h4>
                          <span className="ml-auto text-xs font-black text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                            {getCastForDay(selectedShootDay).length}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {getCastForDay(selectedShootDay).length > 0 ? (
                            getCastForDay(selectedShootDay).map(member => (
                              <div key={member.id} className="text-sm">
                                <div className="font-bold text-white">{member.name}</div>
                                <div className="text-xs text-gray-400">{member.role}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic">No cast assigned</p>
                          )}
                        </div>
                      </div>

                      {/* Crew */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <SafeIcon icon={FiUsers} className="text-blue-400" />
                          <h4 className="font-black text-white">Crew</h4>
                          <span className="ml-auto text-xs font-black text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                            {getCrewForDay(selectedShootDay).length}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {getCrewForDay(selectedShootDay).length > 0 ? (
                            getCrewForDay(selectedShootDay).map(member => (
                              <div key={member.id} className="text-sm">
                                <div className="font-bold text-white">{member.name}</div>
                                <div className="text-xs text-gray-400">{member.position}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic">No crew assigned</p>
                          )}
                        </div>
                      </div>

                      {/* Equipment */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <SafeIcon icon={FiTool} className="text-green-400" />
                          <h4 className="font-black text-white">Equipment</h4>
                          <span className="ml-auto text-xs font-black text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                            {getEquipmentForDay(selectedShootDay).length}
                          </span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {getEquipmentForDay(selectedShootDay).length > 0 ? (
                            getEquipmentForDay(selectedShootDay).map(item => (
                              <div key={item.id} className="text-sm">
                                <div className="font-bold text-white">{item.name}</div>
                                <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic">No equipment assigned</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedShootDay.notes && (
                      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                        <div className="flex items-start gap-2">
                          <SafeIcon icon={FiAlertCircle} className="text-yellow-400 mt-0.5" />
                          <div>
                            <div className="font-bold text-yellow-300 text-sm mb-1">Production Notes</div>
                            <p className="text-sm text-yellow-200">{selectedShootDay.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shot List */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        <SafeIcon icon={FiFilm} className="text-purple-400" />
                        Shot List
                      </h3>
                      <div className="px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl">
                        <span className="text-sm font-black text-purple-300">{completedToday} / {dayShots.length} Complete</span>
                      </div>
                    </div>

                    {dayShots.length === 0 ? (
                      <div className="text-center py-16 opacity-50">
                        <SafeIcon icon={FiCamera} className="text-6xl text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No shots assigned to this day</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dayShots.map((shot, idx) => (
                          <motion.div 
                            key={shot.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group relative bg-white/5 border rounded-2xl overflow-hidden transition-all ${
                              shot.status === 'completed' 
                                ? 'border-green-500/50 opacity-60' 
                                : 'border-white/10 hover:border-purple-500/30'
                            }`}
                          >
                            <div className="p-6">
                              <div className="flex items-start gap-6">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${
                                  shot.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                    : 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/30'
                                }`}>
                                  {shot.status === 'completed' ? <SafeIcon icon={FiCheck} /> : idx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="text-lg font-black text-white mb-1">{shot.title}</h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-bold">Scene {shot.scene_number}</span>
                                        <span>•</span>
                                        <span>{scenes.find(s => s.scene_number === shot.scene_number)?.title}</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleShotToggle(shot.id, shot.status)}
                                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                        shot.status === 'completed'
                                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                          : 'bg-white/10 text-gray-300 hover:bg-purple-500 hover:text-white border border-white/10'
                                      }`}
                                    >
                                      {shot.status === 'completed' ? 'Captured' : 'Mark Done'}
                                    </button>
                                  </div>

                                  {shot.description && (
                                    <p className="text-sm text-gray-400 mb-3 italic border-l-2 border-white/10 pl-3">
                                      "{shot.description.substring(0, 120)}..."
                                    </p>
                                  )}

                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-gray-400">
                                      {shot.shot_type}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase text-blue-400">
                                      {shot.lens}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-black uppercase text-purple-400">
                                      {shot.shot_angle}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
          <button 
            onClick={() => navigate(`/planning/${projectId}`)} 
            className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back to Planning</span>
          </button>
          
          <button 
            onClick={handleWrapProduction}
            disabled={wrapping}
            className="flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-[1.5rem] font-bold transition-all shadow-xl shadow-purple-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wrapping ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Wrapping...</span>
              </>
            ) : (
              <>
                <span>Wrap & Go to Post-Production</span>
                <SafeIcon icon={FiArrowRight} />
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