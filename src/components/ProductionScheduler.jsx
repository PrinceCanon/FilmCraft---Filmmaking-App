import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { 
  FiPlus, FiTrash2, FiClock, FiCalendar, FiMapPin, 
  FiUsers, FiCamera, FiCloud, FiList, FiGrid, FiEdit2, 
  FiSave, FiX, FiAlertCircle, FiChevronDown, FiChevronUp,
  FiFilm, FiCopy, FiCheckSquare, FiSquare, FiUser, FiTool, FiPackage, FiBox, FiTarget
} = FiIcons;

const CalendarView = ({ schedule, onRemove, onEdit, onDuplicate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getItemsForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    return schedule.filter(item => {
      const itemStart = item.date;
      const itemEnd = item.end_date || item.date;
      return dateStr >= itemStart && dateStr <= itemEnd;
    });
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    setSelectedDay(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/10 rounded-xl text-white font-bold text-lg transition-all">←</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-300 text-sm font-bold transition-all">Today</button>
            <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/10 rounded-xl text-white font-bold text-lg transition-all">→</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-black text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
          
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const items = getItemsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayStr}`;
            const isSelected = selectedDay === dateStr;
            
            return (
              <motion.div 
                key={day} 
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDay(dateStr)}
                className={`aspect-square p-2 rounded-2xl cursor-pointer transition-all relative ${
                  isToday ? 'bg-purple-500/30 border-2 border-purple-400' : 
                  isSelected ? 'bg-blue-500/30 border-2 border-blue-400' :
                  items.length > 0 ? 'bg-white/10 border border-white/20' : 
                  'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className={`text-sm font-bold block mb-1 ${
                  isToday ? 'text-purple-300' : 
                  isSelected ? 'text-blue-300' :
                  items.length > 0 ? 'text-white' : 'text-gray-400'
                }`}>
                  {day}
                </span>
                
                {items.length > 0 && (
                  <div className="space-y-0.5">
                    {items.slice(0, 2).map(item => (
                      <div 
                        key={item.id} 
                        className={`h-1.5 rounded-full ${
                          item.type === 'shoot' ? 'bg-red-400' : 
                          item.type === 'prep' ? 'bg-blue-400' : 
                          item.type === 'post' ? 'bg-purple-400' :
                          'bg-green-400'
                        }`}
                      />
                    ))}
                    {items.length > 2 && (
                      <div className="text-[8px] text-gray-400 font-bold text-center">+{items.length - 2}</div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        {selectedDay ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white">
                {new Date(selectedDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h4>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white">
                <SafeIcon icon={FiX} />
              </button>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {getItemsForDate(parseInt(selectedDay.split('-')[2])).map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h5 className="font-bold text-white text-sm">{item.title}</h5>
                    <div className="flex space-x-1">
                      <button onClick={() => onEdit(item)} className="p-1 text-blue-400 hover:bg-blue-500/10 rounded">
                        <SafeIcon icon={FiEdit2} className="text-xs" />
                      </button>
                      <button onClick={() => onDuplicate(item)} className="p-1 text-purple-400 hover:bg-purple-500/10 rounded">
                        <SafeIcon icon={FiCopy} className="text-xs" />
                      </button>
                      <button onClick={() => onRemove(item.id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                        <SafeIcon icon={FiTrash2} className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    {item.end_date && item.end_date !== item.date && (
                      <div className="flex items-center gap-2">
                        <SafeIcon icon={FiCalendar} />
                        <span>Until {new Date(item.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                    {item.start_time && (
                      <div className="flex items-center gap-2">
                        <SafeIcon icon={FiClock} />
                        <span>{item.start_time} - {item.end_time}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-2">
                        <SafeIcon icon={FiMapPin} />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <SafeIcon icon={FiCalendar} className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a day to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductionScheduler = ({ project, onDataUpdate }) => {
  const [viewMode, setViewMode] = useState('list');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [props, setProps] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  
  const [newScheduleItem, setNewScheduleItem] = useState({
    title: '',
    type: 'shoot',
    date: new Date().toISOString().split('T')[0],
    end_date: null,
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    scenes_to_shoot: [],
    cast_needed: [],
    crew_needed: [],
    equipment_needed: [],
    props_needed: [],
    vehicles_needed: [],
    notes: '',
    weather_consideration: false,
    completion_status: 'pending',
    milestone_type: null
  });

  const scheduleTypes = [
    { value: 'prep', label: 'Pre-production', icon: FiUsers, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'shoot', label: 'Shooting', icon: FiCamera, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'post', label: 'Post-Production', icon: FiFilm, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
  ];

  const postProductionMilestones = [
    'Assembly Edit',
    'Rough Cut',
    'Fine Cut',
    'Picture Lock',
    'Sound Design',
    'Sound Mix',
    'Color Grading',
    'VFX',
    'Music Composition',
    'Final Mix',
    'Mastering',
    'Delivery'
  ];

  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  useEffect(() => {
    if (project?.id) {
      loadData();
    }
  }, [project?.id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [scheduleRes, scenesRes, castRes, crewRes, equipRes, propsRes, vehiclesRes] = await Promise.all([
        supabase.from('production_schedule_fc2024').select('*').eq('project_id', project.id).order('date', { ascending: true }).order('start_time', { ascending: true }),
        supabase.from('scenes_fc2024').select('*').eq('project_id', project.id).order('scene_number', { ascending: true }),
        supabase.from('cast_fc2024').select('*').eq('project_id', project.id),
        supabase.from('crew_fc2024').select('*').eq('project_id', project.id),
        supabase.from('equipment_fc2024').select('*').eq('project_id', project.id),
        supabase.from('props_fc2024').select('*').eq('project_id', project.id),
        supabase.from('vehicles_fc2024').select('*').eq('project_id', project.id)
      ]);
      
      if (scheduleRes.error) throw scheduleRes.error;
      if (scenesRes.error) throw scenesRes.error;
      
      setScheduleItems(scheduleRes.data || []);
      setScenes(scenesRes.data || []);
      setCast(castRes.data || []);
      setCrew(crewRes.data || []);
      setEquipment(equipRes.data || []);
      setProps(propsRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load schedule. Please ensure database migrations are applied.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheduleItem = async () => {
    if (!newScheduleItem.title.trim()) return;
    
    setAdding(true);
    setError(null);
    
    try {
      const { data, error: insertError } = await supabase
        .from('production_schedule_fc2024')
        .insert([{
          project_id: project.id,
          ...newScheduleItem
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      setScheduleItems(prev => [...prev, data]);
      setNewScheduleItem({
        title: '',
        type: 'shoot',
        date: new Date().toISOString().split('T')[0],
        end_date: null,
        start_time: '09:00',
        end_time: '17:00',
        location: '',
        scenes_to_shoot: [],
        cast_needed: [],
        crew_needed: [],
        equipment_needed: [],
        props_needed: [],
        vehicles_needed: [],
        notes: '',
        weather_consideration: false,
        completion_status: 'pending',
        milestone_type: null
      });
      setShowSceneSelector(false);
      setShowResourceSelector(false);
    } catch (err) {
      console.error('Error adding schedule item:', err);
      setError('Failed to add schedule item.');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateScheduleItem = async (item) => {
    try {
      const { error: updateError } = await supabase
        .from('production_schedule_fc2024')
        .update(item)
        .eq('id', item.id);
      
      if (updateError) throw updateError;
      
      setScheduleItems(prev => prev.map(s => s.id === item.id ? item : s));
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating schedule item:', err);
    }
  };

  const handleDuplicateItem = async (item) => {
    try {
      const newItem = {
        ...item,
        id: undefined,
        title: `${item.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined
      };
      
      const { data, error: insertError } = await supabase
        .from('production_schedule_fc2024')
        .insert([newItem])
        .select()
        .single();
      
      if (insertError) throw insertError;
      setScheduleItems(prev => [...prev, data]);
    } catch (err) {
      console.error('Error duplicating item:', err);
    }
  };

  const removeScheduleItem = async (itemId) => {
    try {
      const { error: deleteError } = await supabase
        .from('production_schedule_fc2024')
        .delete()
        .eq('id', itemId);
      
      if (deleteError) throw deleteError;
      
      setScheduleItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing schedule item:', err);
    }
  };

  const toggleSceneSelection = (sceneNumber, isEditing = false) => {
    const target = isEditing ? editingItem : newScheduleItem;
    const setter = isEditing ? setEditingItem : setNewScheduleItem;
    
    const currentScenes = target.scenes_to_shoot || [];
    if (currentScenes.includes(sceneNumber)) {
      setter({
        ...target,
        scenes_to_shoot: currentScenes.filter(s => s !== sceneNumber)
      });
    } else {
      setter({
        ...target,
        scenes_to_shoot: [...currentScenes, sceneNumber]
      });
    }
  };

  const toggleResourceSelection = (type, id, isEditing = false) => {
    const key = `${type}_needed`;
    const target = isEditing ? editingItem : newScheduleItem;
    const setter = isEditing ? setEditingItem : setNewScheduleItem;
    
    const current = target[key] || [];
    if (current.includes(id)) {
      setter({
        ...target,
        [key]: current.filter(i => i !== id)
      });
    } else {
      setter({
        ...target,
        [key]: [...current, id]
      });
    }
  };

  const getTypeInfo = (type) => {
    return scheduleTypes.find(t => t.value === type) || scheduleTypes[1];
  };

  const groupScheduleByDate = () => {
    const grouped = {};
    scheduleItems.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (start, end) => {
    const diff = (new Date(`2000-01-01T${end}`) - new Date(`2000-01-01T${start}`)) / (1000 * 60 * 60);
    return diff >= 1 ? `${diff}h` : `${Math.round(diff * 60)}min`;
  };

  const calculateDateRange = (startDate, endDate) => {
    if (!endDate || startDate === endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${diffDays + 1} day${diffDays !== 0 ? 's' : ''}`;
  };

  const getTotalResourceCount = (item = newScheduleItem) => {
    return (item.cast_needed?.length || 0) +
           (item.crew_needed?.length || 0) +
           (item.equipment_needed?.length || 0) +
           (item.props_needed?.length || 0) +
           (item.vehicles_needed?.length || 0);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading schedule...</div>;

  const isPostProductionType = newScheduleItem.type === 'post';

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
          <SafeIcon icon={FiAlertCircle} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-bold text-sm mb-1">Error</p>
            <p className="text-red-300 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400"><SafeIcon icon={FiX} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 flex-1">
          <h4 className="text-xl font-black text-white mb-2 flex items-center gap-2">
            <SafeIcon icon={FiCalendar} className="text-purple-400" />
            Production Scheduler
          </h4>
          <p className="text-purple-300 text-sm">Plan all production activities including prep, shooting, and post-production milestones.</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${
              viewMode === 'list' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <SafeIcon icon={FiList} />
            <span>Timeline</span>
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${
              viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <SafeIcon icon={FiGrid} />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Add New Schedule Item */}
      <motion.div
        className="bg-white/5 border border-white/10 rounded-3xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <SafeIcon icon={FiPlus} className="text-purple-400" />
          Schedule New Activity
        </h4>
        
        <div className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Activity Type *</label>
            <select
              value={newScheduleItem.type}
              onChange={(e) => setNewScheduleItem({ 
                ...newScheduleItem, 
                type: e.target.value,
                title: '',
                milestone_type: null,
                start_time: e.target.value === 'post' ? null : '09:00',
                end_time: e.target.value === 'post' ? null : '17:00',
                location: '',
                weather_consideration: false,
                scenes_to_shoot: [],
                cast_needed: [],
                crew_needed: [],
                equipment_needed: [],
                props_needed: [],
                vehicles_needed: []
              })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {scheduleTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Title - Conditional based on type */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              {isPostProductionType ? 'Milestone / Task *' : 'Title / Activity *'}
            </label>
            {isPostProductionType ? (
              <>
                <select
                  value={newScheduleItem.milestone_type || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewScheduleItem({ 
                      ...newScheduleItem, 
                      milestone_type: value,
                      title: value === '__custom__' ? '' : value
                    });
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Milestone</option>
                  {postProductionMilestones.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="__custom__">Custom Milestone</option>
                </select>
                {newScheduleItem.milestone_type === '__custom__' && (
                  <input
                    type="text"
                    value={newScheduleItem.title}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
                    placeholder="Enter custom milestone name"
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                value={newScheduleItem.title}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Shoot exterior scenes at park"
              />
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                {isPostProductionType ? 'Deadline / Start Date *' : 'Date *'}
              </label>
              <input
                type="date"
                value={newScheduleItem.date}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={newScheduleItem.end_date || ''}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, end_date: e.target.value || null })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Time (only for non-post) */}
          {!isPostProductionType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Start Time</label>
                <select
                  value={newScheduleItem.start_time}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, start_time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">End Time</label>
                <select
                  value={newScheduleItem.end_time}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, end_time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Location & Weather (only for shoot) */}
          {newScheduleItem.type === 'shoot' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={newScheduleItem.location}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter location..."
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all w-full">
                  <input
                    type="checkbox"
                    checked={newScheduleItem.weather_consideration}
                    onChange={(e) => setNewScheduleItem({ ...newScheduleItem, weather_consideration: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20"
                  />
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <SafeIcon icon={FiCloud} className="text-yellow-400" />
                    Weather Dependent
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Scene Selection (only for shoot) */}
          {newScheduleItem.type === 'shoot' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-300">Scenes to Shoot</label>
                <button
                  onClick={() => setShowSceneSelector(!showSceneSelector)}
                  className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-2"
                >
                  {showSceneSelector ? <SafeIcon icon={FiChevronUp} /> : <SafeIcon icon={FiChevronDown} />}
                  {showSceneSelector ? 'Hide' : 'Select'} Scenes ({newScheduleItem.scenes_to_shoot?.length || 0})
                </button>
              </div>
              
              <AnimatePresence>
                {showSceneSelector && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                      {scenes.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">No scenes available. Create scenes in the Script tab first.</p>
                      ) : (
                        scenes.map(scene => (
                          <label
                            key={scene.id}
                            className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                          >
                            <div className="flex-shrink-0">
                              {(newScheduleItem.scenes_to_shoot || []).includes(scene.scene_number) ? (
                                <SafeIcon icon={FiCheckSquare} className="text-purple-400 text-lg" />
                              ) : (
                                <SafeIcon icon={FiSquare} className="text-gray-600 text-lg" />
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={(newScheduleItem.scenes_to_shoot || []).includes(scene.scene_number)}
                              onChange={() => toggleSceneSelection(scene.scene_number)}
                              className="hidden"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                                  SCENE {scene.scene_number}
                                </span>
                                <span className="text-sm font-bold text-white">{scene.title}</span>
                              </div>
                              {scene.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{scene.description}</p>
                              )}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {(newScheduleItem.scenes_to_shoot || []).length > 0 && !showSceneSelector && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newScheduleItem.scenes_to_shoot.map(sceneNum => {
                    const scene = scenes.find(s => s.scene_number === sceneNum);
                    return scene ? (
                      <span key={sceneNum} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-300">
                        Scene {sceneNum}: {scene.title}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Resource Selection (only for shoot) */}
          {newScheduleItem.type === 'shoot' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-300">Resources Needed</label>
                <button
                  onClick={() => setShowResourceSelector(!showResourceSelector)}
                  className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-2"
                >
                  {showResourceSelector ? <SafeIcon icon={FiChevronUp} /> : <SafeIcon icon={FiChevronDown} />}
                  {showResourceSelector ? 'Hide' : 'Select'} Resources ({getTotalResourceCount()})
                </button>
              </div>

              <AnimatePresence>
                {showResourceSelector && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                      {/* Cast */}
                      {cast.length > 0 && (
                        <div>
                          <h6 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <SafeIcon icon={FiUser} /> Cast ({(newScheduleItem.cast_needed || []).length})
                          </h6>
                          <div className="grid grid-cols-2 gap-2">
                            {cast.map(member => (
                              <label key={member.id} className="flex items-center space-x-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                                {(newScheduleItem.cast_needed || []).includes(member.id) ? (
                                  <SafeIcon icon={FiCheckSquare} className="text-purple-400" />
                                ) : (
                                  <SafeIcon icon={FiSquare} className="text-gray-600" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={(newScheduleItem.cast_needed || []).includes(member.id)}
                                  onChange={() => toggleResourceSelection('cast', member.id)}
                                  className="hidden"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{member.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{member.role}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Crew */}
                      {crew.length > 0 && (
                        <div>
                          <h6 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <SafeIcon icon={FiUsers} /> Crew ({(newScheduleItem.crew_needed || []).length})
                          </h6>
                          <div className="grid grid-cols-2 gap-2">
                            {crew.map(member => (
                              <label key={member.id} className="flex items-center space-x-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                                {(newScheduleItem.crew_needed || []).includes(member.id) ? (
                                  <SafeIcon icon={FiCheckSquare} className="text-blue-400" />
                                ) : (
                                  <SafeIcon icon={FiSquare} className="text-gray-600" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={(newScheduleItem.crew_needed || []).includes(member.id)}
                                  onChange={() => toggleResourceSelection('crew', member.id)}
                                  className="hidden"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{member.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{member.position}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Equipment */}
                      {equipment.length > 0 && (
                        <div>
                          <h6 className="text-xs font-black text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <SafeIcon icon={FiTool} /> Equipment ({(newScheduleItem.equipment_needed || []).length})
                          </h6>
                          <div className="grid grid-cols-2 gap-2">
                            {equipment.map(item => (
                              <label key={item.id} className="flex items-center space-x-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                                {(newScheduleItem.equipment_needed || []).includes(item.id) ? (
                                  <SafeIcon icon={FiCheckSquare} className="text-green-400" />
                                ) : (
                                  <SafeIcon icon={FiSquare} className="text-gray-600" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={(newScheduleItem.equipment_needed || []).includes(item.id)}
                                  onChange={() => toggleResourceSelection('equipment', item.id)}
                                  className="hidden"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{item.category}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Props */}
                      {props.length > 0 && (
                        <div>
                          <h6 className="text-xs font-black text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <SafeIcon icon={FiPackage} /> Props ({(newScheduleItem.props_needed || []).length})
                          </h6>
                          <div className="grid grid-cols-2 gap-2">
                            {props.map(item => (
                              <label key={item.id} className="flex items-center space-x-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                                {(newScheduleItem.props_needed || []).includes(item.id) ? (
                                  <SafeIcon icon={FiCheckSquare} className="text-orange-400" />
                                ) : (
                                  <SafeIcon icon={FiSquare} className="text-gray-600" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={(newScheduleItem.props_needed || []).includes(item.id)}
                                  onChange={() => toggleResourceSelection('props', item.id)}
                                  className="hidden"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vehicles */}
                      {vehicles.length > 0 && (
                        <div>
                          <h6 className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <SafeIcon icon={FiBox} /> Vehicles ({(newScheduleItem.vehicles_needed || []).length})
                          </h6>
                          <div className="grid grid-cols-2 gap-2">
                            {vehicles.map(item => (
                              <label key={item.id} className="flex items-center space-x-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                                {(newScheduleItem.vehicles_needed || []).includes(item.id) ? (
                                  <SafeIcon icon={FiCheckSquare} className="text-yellow-400" />
                                ) : (
                                  <SafeIcon icon={FiSquare} className="text-gray-600" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={(newScheduleItem.vehicles_needed || []).includes(item.id)}
                                  onChange={() => toggleResourceSelection('vehicles', item.id)}
                                  className="hidden"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{item.type}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {cast.length === 0 && crew.length === 0 && equipment.length === 0 && props.length === 0 && vehicles.length === 0 && (
                        <div className="text-center py-8">
                          <SafeIcon icon={FiAlertCircle} className="text-4xl text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No resources available</p>
                          <p className="text-gray-600 text-xs">Add resources in the Resources tab first</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {getTotalResourceCount() > 0 && !showResourceSelector && (
                <div className="mt-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300 mb-2">
                    <SafeIcon icon={FiUsers} />
                    <span>{getTotalResourceCount()} Resource{getTotalResourceCount() > 1 ? 's' : ''} Selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(newScheduleItem.cast_needed || []).length > 0 && (
                      <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] font-bold text-purple-300">
                        {newScheduleItem.cast_needed.length} Cast
                      </span>
                    )}
                    {(newScheduleItem.crew_needed || []).length > 0 && (
                      <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-bold text-blue-300">
                        {newScheduleItem.crew_needed.length} Crew
                      </span>
                    )}
                    {(newScheduleItem.equipment_needed || []).length > 0 && (
                      <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-[10px] font-bold text-green-300">
                        {newScheduleItem.equipment_needed.length} Equipment
                      </span>
                    )}
                    {(newScheduleItem.props_needed || []).length > 0 && (
                      <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-[10px] font-bold text-orange-300">
                        {newScheduleItem.props_needed.length} Props
                      </span>
                    )}
                    {(newScheduleItem.vehicles_needed || []).length > 0 && (
                      <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-[10px] font-bold text-yellow-300">
                        {newScheduleItem.vehicles_needed.length} Vehicles
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Notes / Special Requirements</label>
            <textarea
              value={newScheduleItem.notes}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, notes: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Additional requirements, special considerations..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddScheduleItem}
            disabled={!newScheduleItem.title.trim() || adding || (isPostProductionType && !newScheduleItem.milestone_type)}
          >
            {adding ? (
              <>
                <SafeIcon icon={FiClock} className="inline mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <SafeIcon icon={FiPlus} className="inline mr-2" />
                Add to Schedule
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Schedule View */}
      {viewMode === 'calendar' ? (
        <CalendarView 
          schedule={scheduleItems} 
          onRemove={removeScheduleItem}
          onEdit={setEditingItem}
          onDuplicate={handleDuplicateItem}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupScheduleByDate()).sort().map(([date, items]) => (
            <motion.div
              key={date}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <SafeIcon icon={FiCalendar} className="text-2xl text-purple-400" />
                <h4 className="text-2xl font-bold text-white">{formatDate(date)}</h4>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-black text-purple-300">
                  {items.length} {items.length === 1 ? 'Activity' : 'Activities'}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const typeInfo = getTypeInfo(item.type);
                  const duration = item.start_time && item.end_time ? calculateDuration(item.start_time, item.end_time) : null;
                  const dateRange = calculateDateRange(item.date, item.end_date);
                  const scenesForItem = (item.scenes_to_shoot || []).map(num => scenes.find(s => s.scene_number === num)).filter(Boolean);
                  const castForItem = (item.cast_needed || []).map(id => cast.find(c => c.id === id)).filter(Boolean);
                  const crewForItem = (item.crew_needed || []).map(id => crew.find(c => c.id === id)).filter(Boolean);
                  const equipForItem = (item.equipment_needed || []).map(id => equipment.find(e => e.id === id)).filter(Boolean);
                  const propsForItem = (item.props_needed || []).map(id => props.find(p => p.id === id)).filter(Boolean);
                  const vehiclesForItem = (item.vehicles_needed || []).map(id => vehicles.find(v => v.id === id)).filter(Boolean);

                  return (
                    <motion.div
                      key={item.id}
                      className={`bg-white/5 border rounded-2xl p-6 hover:bg-white/10 transition-all ${
                        item.completion_status === 'completed' ? 'border-green-500/50 opacity-70' : typeInfo.color.split(' ')[2]
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-2xl ${typeInfo.color}`}>
                              <SafeIcon icon={typeInfo.icon} className="text-xl" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-lg font-black text-white mb-2">{item.title}</h5>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                {duration && (
                                  <span className="flex items-center gap-1.5">
                                    <SafeIcon icon={FiClock} className="text-xs" />
                                    {item.start_time} - {item.end_time} ({duration})
                                  </span>
                                )}
                                {dateRange && (
                                  <span className="flex items-center gap-1.5 text-purple-400">
                                    <SafeIcon icon={FiCalendar} className="text-xs" />
                                    {dateRange}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="flex items-center gap-1.5">
                                    <SafeIcon icon={FiMapPin} className="text-xs" />
                                    {item.location}
                                  </span>
                                )}
                                {item.weather_consideration && (
                                  <span className="flex items-center gap-1.5 text-yellow-400">
                                    <SafeIcon icon={FiCloud} className="text-xs" />
                                    Weather Dependent
                                  </span>
                                )}
                                {item.completion_status === 'completed' && (
                                  <span className="flex items-center gap-1.5 text-green-400 font-bold">
                                    <SafeIcon icon={FiCheckSquare} className="text-xs" />
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {scenesForItem.length > 0 && (
                            <div className="pl-16">
                              <div className="flex items-center gap-2 mb-2">
                                <SafeIcon icon={FiFilm} className="text-purple-400" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Scenes to Shoot</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {scenesForItem.map(scene => (
                                  <span key={scene.id} className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-300">
                                    Scene {scene.scene_number}: {scene.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {(castForItem.length > 0 || crewForItem.length > 0 || equipForItem.length > 0 || propsForItem.length > 0 || vehiclesForItem.length > 0) && (
                            <div className="pl-16">
                              <div className="flex items-center gap-2 mb-3">
                                <SafeIcon icon={FiUsers} className="text-blue-400" />
                                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Resources</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {castForItem.length > 0 && (
                                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                    <div className="text-[10px] font-black text-purple-400 uppercase mb-1">Cast ({castForItem.length})</div>
                                    {castForItem.slice(0, 2).map(c => (
                                      <div key={c.id} className="text-xs text-gray-300">{c.name}</div>
                                    ))}
                                    {castForItem.length > 2 && <div className="text-[10px] text-gray-500">+{castForItem.length - 2} more</div>}
                                  </div>
                                )}
                                {crewForItem.length > 0 && (
                                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                    <div className="text-[10px] font-black text-blue-400 uppercase mb-1">Crew ({crewForItem.length})</div>
                                    {crewForItem.slice(0, 2).map(c => (
                                      <div key={c.id} className="text-xs text-gray-300">{c.name}</div>
                                    ))}
                                    {crewForItem.length > 2 && <div className="text-[10px] text-gray-500">+{crewForItem.length - 2} more</div>}
                                  </div>
                                )}
                                {equipForItem.length > 0 && (
                                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <div className="text-[10px] font-black text-green-400 uppercase mb-1">Equipment ({equipForItem.length})</div>
                                    {equipForItem.slice(0, 2).map(e => (
                                      <div key={e.id} className="text-xs text-gray-300">{e.name}</div>
                                    ))}
                                    {equipForItem.length > 2 && <div className="text-[10px] text-gray-500">+{equipForItem.length - 2} more</div>}
                                  </div>
                                )}
                                {propsForItem.length > 0 && (
                                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                    <div className="text-[10px] font-black text-orange-400 uppercase mb-1">Props ({propsForItem.length})</div>
                                    {propsForItem.slice(0, 2).map(p => (
                                      <div key={p.id} className="text-xs text-gray-300">{p.name}</div>
                                    ))}
                                    {propsForItem.length > 2 && <div className="text-[10px] text-gray-500">+{propsForItem.length - 2} more</div>}
                                  </div>
                                )}
                                {vehiclesForItem.length > 0 && (
                                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <div className="text-[10px] font-black text-yellow-400 uppercase mb-1">Vehicles ({vehiclesForItem.length})</div>
                                    {vehiclesForItem.slice(0, 2).map(v => (
                                      <div key={v.id} className="text-xs text-gray-300">{v.name}</div>
                                    ))}
                                    {vehiclesForItem.length > 2 && <div className="text-[10px] text-gray-500">+{vehiclesForItem.length - 2} more</div>}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {item.notes && (
                            <div className="pl-16">
                              <p className="text-sm text-gray-400 italic border-l-2 border-white/10 pl-4">{item.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all border border-blue-500/30"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setEditingItem(item)}
                            title="Edit"
                          >
                            <SafeIcon icon={FiEdit2} className="text-blue-400" />
                          </motion.button>
                          <motion.button
                            className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all border border-purple-500/30"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleDuplicateItem(item)}
                            title="Duplicate"
                          >
                            <SafeIcon icon={FiCopy} className="text-purple-400" />
                          </motion.button>
                          <motion.button
                            className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all border border-red-500/30"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => removeScheduleItem(item.id)}
                            title="Delete"
                          >
                            <SafeIcon icon={FiTrash2} className="text-red-400" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {Object.keys(groupScheduleByDate()).length === 0 && (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl">
              <SafeIcon icon={FiCalendar} className="text-6xl mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-bold text-white mb-2">No Schedule Items Yet</h3>
              <p className="text-gray-400">Add your first production activity above to get started</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-4xl shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-white">Edit Schedule Item</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-white">
                  <SafeIcon icon={FiX} className="text-2xl" />
                </button>
              </div>
              
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Title *</label>
                  <input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold outline-none focus:border-purple-500"
                    placeholder="Title"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Type</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    {scheduleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={editingItem.end_date || ''}
                      onChange={(e) => setEditingItem({...editingItem, end_date: e.target.value || null})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Time (if not post) */}
                {editingItem.type !== 'post' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Start Time</label>
                      <select
                        value={editingItem.start_time}
                        onChange={(e) => setEditingItem({...editingItem, start_time: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                      >
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">End Time</label>
                      <select
                        value={editingItem.end_time}
                        onChange={(e) => setEditingItem({...editingItem, end_time: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                      >
                        {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Location (if shoot) */}
                {editingItem.type === 'shoot' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Location</label>
                    <input
                      value={editingItem.location || ''}
                      onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                      placeholder="Location"
                    />
                  </div>
                )}

                {/* Completion Status (if post) */}
                {editingItem.type === 'post' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Status</label>
                    <select
                      value={editingItem.completion_status || 'pending'}
                      onChange={(e) => setEditingItem({...editingItem, completion_status: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none"
                    rows={3}
                    placeholder="Notes..."
                  />
                </div>
                
                <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                  <button 
                    onClick={() => setEditingItem(null)} 
                    className="px-8 py-4 text-gray-400 font-bold hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleUpdateScheduleItem(editingItem)} 
                    className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black shadow-xl shadow-purple-500/20 transition-all"
                  >
                    <SafeIcon icon={FiSave} className="inline mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductionScheduler;