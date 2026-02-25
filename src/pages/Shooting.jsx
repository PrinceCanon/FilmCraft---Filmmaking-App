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
  FiCamera, FiCheck, FiVideo, FiSun, FiMapPin, FiPackage, 
  FiUsers, FiMessageCircle, FiChevronDown, FiChevronRight, 
  FiArrowLeft, FiCheckCircle, FiClock, FiCalendar, FiAlertCircle,
  FiClipboard, FiTool, FiFilm, FiX
} = FiIcons;

const Shooting = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, checkAccess } = useProject();
  const [project, setProject] = useState(null);
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [callSheet, setCallSheet] = useState({
    crew_call: '07:00',
    first_shot: '08:00',
    lunch_break: '13:00',
    wrap_time: '18:00',
    equipment: [],
    crew_needed: [],
    notes: ''
  });

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
    const [shotsRes, scenesRes, scheduleRes] = await Promise.all([
      supabase.from('shot_lists_fc2024').select('*').eq('project_id', projectId).order('scene_number').order('order_index'),
      supabase.from('scenes_fc2024').select('*').eq('project_id', projectId).order('scene_number'),
      supabase.from('production_schedule_fc2024').select('*').eq('project_id', projectId).order('date').order('start_time')
    ]);
    setShots(shotsRes.data || []);
    setScenes(scenesRes.data || []);
    setSchedule(scheduleRes.data || []);
    setLoading(false);
  };

  const handleShotToggle = async (shotId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, status: newStatus } : s));
    await supabase.from('shot_lists_fc2024').update({ status: newStatus }).eq('id', shotId);
  };

  const getTodaySchedule = () => {
    return schedule.filter(item => item.date === selectedDate && item.type === 'shoot');
  };

  const getShotsForToday = () => {
    const todaySchedule = getTodaySchedule();
    if (todaySchedule.length === 0) return [];
    
    // Get scene numbers from today's schedule notes/title
    const todayScenes = scenes.filter(scene => 
      todaySchedule.some(item => 
        item.title.toLowerCase().includes(scene.title.toLowerCase()) ||
        item.notes?.toLowerCase().includes(scene.title.toLowerCase())
      )
    );
    
    const sceneNumbers = todayScenes.map(s => s.scene_number);
    return shots.filter(shot => sceneNumbers.includes(shot.scene_number));
  };

  const getEquipmentChecklist = () => {
    const todayShots = getShotsForToday();
    const equipment = new Set();
    
    todayShots.forEach(shot => {
      if (shot.lens) equipment.add(`Lens: ${shot.lens}`);
      if (shot.shot_type?.includes('Drone')) equipment.add('Drone + Controller');
      if (shot.shot_type?.includes('POV')) equipment.add('POV Rig / GoPro');
      equipment.add('Camera Body');
      equipment.add('Tripod / Stabilizer');
      equipment.add('Audio Kit');
      equipment.add('Lighting Kit');
    });
    
    return Array.from(equipment);
  };

  if (!project || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading Shoot Day...</p>
        </div>
      </div>
    );
  }

  const todaySchedule = getTodaySchedule();
  const todayShots = getShotsForToday();
  const completedToday = todayShots.filter(s => s.status === 'completed').length;
  const progressToday = todayShots.length > 0 ? (completedToday / todayShots.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProjectBreadcrumb project={project} currentPhase="shooting" className="mb-8" />
        
        {/* Shoot Day Header */}
        <div className="bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 rounded-[2.5rem] p-10 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 blur-[150px] rounded-full -mr-48 -mt-48" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-red-500/30 rounded-2xl border border-red-500/40">
                    <SafeIcon icon={FiVideo} className="text-red-400 text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">Shoot Day</h1>
                    <p className="text-red-300 font-bold text-sm mt-1">Production Dashboard</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-bold text-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button 
                  onClick={() => setShowChat(true)} 
                  className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                >
                  <SafeIcon icon={FiMessageCircle} className="text-xl" />
                </button>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shots Today</span>
                  <SafeIcon icon={FiCamera} className="text-red-400" />
                </div>
                <div className="text-3xl font-black text-white">{todayShots.length}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</span>
                  <SafeIcon icon={FiCheckCircle} className="text-green-400" />
                </div>
                <div className="text-3xl font-black text-white">{completedToday}</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                  <SafeIcon icon={FiFilm} className="text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white">{progressToday.toFixed(0)}%</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Locations</span>
                  <SafeIcon icon={FiMapPin} className="text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white">{new Set(todaySchedule.map(s => s.location)).size}</div>
              </div>
            </div>
          </div>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-12 text-center">
            <SafeIcon icon={FiAlertCircle} className="text-6xl text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">No Shoot Scheduled</h3>
            <p className="text-gray-400 mb-6">There are no shooting activities scheduled for {new Date(selectedDate).toLocaleDateString()}.</p>
            <button 
              onClick={() => navigate(`/planning/${projectId}`)}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-2xl transition-all"
            >
              Go to Planning to Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Call Sheet & Equipment */}
            <div className="space-y-8">
              {/* Call Sheet */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <SafeIcon icon={FiClipboard} className="text-2xl text-blue-400" />
                  <h3 className="text-2xl font-black text-white">Call Sheet</h3>
                </div>
                <div className="space-y-4">
                  {todaySchedule.map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                      <h4 className="font-bold text-white mb-2">{item.title}</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiClock} className="text-xs" />
                          <span>{item.start_time} - {item.end_time}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiMapPin} className="text-xs" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-xs italic mt-2 border-l-2 border-white/10 pl-2">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Checklist */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <SafeIcon icon={FiPackage} className="text-2xl text-green-400" />
                  <h3 className="text-2xl font-black text-white">Equipment</h3>
                </div>
                <div className="space-y-3">
                  {getEquipmentChecklist().map((item, i) => (
                    <label key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                      <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/10" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </label>
                  ))}
                  <div className="pt-4 border-t border-white/10">
                    <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                      <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/10" />
                      <span className="text-sm text-gray-300">Batteries Charged</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                      <input type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/10" />
                      <span className="text-sm text-gray-300">Memory Cards Formatted</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Shot List */}
            <div className="xl:col-span-2">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiFilm} className="text-2xl text-purple-400" />
                    <h3 className="text-2xl font-black text-white">Shot List</h3>
                  </div>
                  <div className="px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl">
                    <span className="text-sm font-black text-purple-300">{completedToday} / {todayShots.length} Complete</span>
                  </div>
                </div>

                {todayShots.length === 0 ? (
                  <div className="text-center py-16 opacity-50">
                    <SafeIcon icon={FiCamera} className="text-6xl text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No shots planned for this date</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayShots.map((shot, idx) => (
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
                            {/* Shot Number */}
                            <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black ${
                              shot.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50' 
                                : 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/30'
                            }`}>
                              {shot.status === 'completed' ? <SafeIcon icon={FiCheck} /> : idx + 1}
                            </div>

                            {/* Shot Details */}
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

                              {shot.notes && (
                                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                  <p className="text-xs text-yellow-200 font-medium">
                                    <strong>Director's Note:</strong> {shot.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            onClick={() => {
              if (confirm('Mark production as complete? This will archive the project.')) {
                navigate('/');
              }
            }}
            className="flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[1.5rem] font-bold transition-all shadow-xl shadow-green-500/20 hover:scale-105"
          >
            <SafeIcon icon={FiCheckCircle} />
            <span>Wrap Production</span>
          </button>
        </div>
      </div>
      
      <ProjectChat projectId={projectId} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default Shooting;