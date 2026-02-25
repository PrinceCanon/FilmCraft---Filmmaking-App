import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { 
  FiPlus, FiTrash2, FiClock, FiCalendar, FiMapPin, 
  FiUsers, FiCamera, FiSun, FiMoon, FiCloud, FiList, FiGrid, FiEdit2, FiSave, FiX, FiAlertCircle
} = FiIcons;

const CalendarView = ({ schedule, onRemove, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    return schedule.filter(item => item.date === dateStr);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-white">←</button>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-white">→</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 bg-slate-900/50 text-center text-sm font-bold text-gray-400">
            {day}
          </div>
        ))}
        
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-900/30 min-h-[100px]" />
        ))}
        
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const items = getItemsForDate(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          
          return (
            <div key={day} className={`bg-slate-900/30 min-h-[100px] p-2 border-t border-white/5 relative group ${isToday ? 'bg-purple-900/10' : ''}`}>
              <span className={`text-sm font-medium ${isToday ? 'text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded' : 'text-gray-400'}`}>
                {day}
              </span>
              
              <div className="mt-2 space-y-1">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`text-[10px] p-1.5 rounded border border-white/5 truncate cursor-pointer hover:scale-105 transition-transform ${
                      item.type === 'shoot' ? 'bg-red-500/20 text-red-300' : 
                      item.type === 'prep' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                    }`}
                    title={`${item.start_time} - ${item.title}`}
                    onClick={() => onEdit(item)}
                  >
                     {item.start_time.split(':')[0]}h • {item.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProductionScheduler = ({ project, onDataUpdate }) => {
  const [viewMode, setViewMode] = useState('list');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  
  const [newScheduleItem, setNewScheduleItem] = useState({
    title: '',
    type: 'shoot',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    notes: '',
    weather_consideration: false
  });

  const scheduleTypes = [
    { value: 'prep', label: 'Pre-production', icon: FiUsers, color: 'bg-blue-500/20 text-blue-400' },
    { value: 'shoot', label: 'Shooting', icon: FiCamera, color: 'bg-red-500/20 text-red-400' },
    { value: 'review', label: 'Review/Editing', icon: FiClock, color: 'bg-green-500/20 text-green-400' }
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  useEffect(() => {
    if (project?.id) {
      loadSchedule();
    }
  }, [project?.id]);

  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('production_schedule_fc2024')
        .select('*')
        .eq('project_id', project.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (fetchError) throw fetchError;
      setScheduleItems(data || []);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Could not load schedule data. Please apply the latest database migration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheduleItem = async () => {
    if (!newScheduleItem.title.trim()) return;
    
    setAdding(true);
    try {
      const { data, error: insertError } = await supabase
        .from('production_schedule_fc2024')
        .insert([{
          project_id: project.id,
          title: newScheduleItem.title,
          type: newScheduleItem.type,
          date: newScheduleItem.date,
          start_time: newScheduleItem.start_time,
          end_time: newScheduleItem.end_time,
          location: newScheduleItem.location,
          notes: newScheduleItem.notes,
          weather_consideration: newScheduleItem.weather_consideration
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      setScheduleItems(prev => [...prev, data]);
      setNewScheduleItem({
        title: '',
        type: 'shoot',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        location: '',
        notes: '',
        weather_consideration: false
      });
    } catch (err) {
      console.error('Error adding schedule item:', err);
      setError('Failed to add schedule item. Ensure the migration is applied.');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateScheduleItem = async (item) => {
    try {
      const { error: updateError } = await supabase
        .from('production_schedule_fc2024')
        .update({
          title: item.title,
          type: item.type,
          date: item.date,
          start_time: item.start_time,
          end_time: item.end_time,
          location: item.location,
          notes: item.notes,
          weather_consideration: item.weather_consideration
        })
        .eq('id', item.id);
      
      if (updateError) throw updateError;
      
      setScheduleItems(prev => prev.map(s => s.id === item.id ? item : s));
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating schedule item:', err);
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

  if (loading) return <div className="text-center py-12 text-gray-400">Loading schedule...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <SafeIcon icon={FiAlertCircle} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-bold text-sm mb-1">Database Error</p>
            <p className="text-red-300 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400"><SafeIcon icon={FiX} /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 flex-1 mr-4">
          <h4 className="text-lg font-semibold text-white mb-2">Production Scheduler</h4>
          <p className="text-purple-300 text-sm">Plan your shooting days and prep work efficiently.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <SafeIcon icon={FiList} />
            <span>Timeline</span>
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all ${viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <SafeIcon icon={FiGrid} />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      <motion.div
        className="bg-white/5 border border-white/10 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">Add to Schedule</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newScheduleItem.title}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, title: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Title / Activity"
          />
          <select
            value={newScheduleItem.type}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, type: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            {scheduleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="date"
            value={newScheduleItem.date}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, date: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
          <select
            value={newScheduleItem.start_time}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, start_time: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={newScheduleItem.end_time}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, end_time: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newScheduleItem.location}
            onChange={(e) => setNewScheduleItem({ ...newScheduleItem, location: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="Location"
          />
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={newScheduleItem.weather_consideration}
              onChange={(e) => setNewScheduleItem({ ...newScheduleItem, weather_consideration: e.target.checked })}
              className="rounded"
            />
            <span>Weather dependent</span>
          </label>
        </div>
        <textarea
          value={newScheduleItem.notes}
          onChange={(e) => setNewScheduleItem({ ...newScheduleItem, notes: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none mb-4"
          rows={2}
          placeholder="Notes..."
        />
        <motion.button
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold disabled:opacity-50"
          whileHover={{ scale: 1.01 }}
          onClick={handleAddScheduleItem}
          disabled={!newScheduleItem.title.trim() || adding}
        >
          {adding ? 'Adding...' : 'Add to Schedule'}
        </motion.button>
      </motion.div>

      {viewMode === 'calendar' ? (
        <CalendarView schedule={scheduleItems} onRemove={removeScheduleItem} onEdit={setEditingItem} />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupScheduleByDate()).map(([date, items]) => (
            <div key={date} className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <SafeIcon icon={FiCalendar} className="text-purple-400" /> {formatDate(date)}
              </h4>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-lg p-4 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getTypeInfo(item.type).color}`}>
                        <SafeIcon icon={getTypeInfo(item.type).icon} />
                      </div>
                      <div>
                        <h5 className="font-bold text-white">{item.title}</h5>
                        <p className="text-xs text-gray-400">{item.start_time} - {item.end_time} • {item.location || 'No location set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingItem(item)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><SafeIcon icon={FiEdit2} /></button>
                      <button onClick={() => removeScheduleItem(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><SafeIcon icon={FiTrash2} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white mb-6">Edit Schedule Item</h3>
              <div className="space-y-4">
                <input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500"
                  placeholder="Title"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={editingItem.date}
                    onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    {scheduleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={editingItem.start_time}
                    onChange={(e) => setEditingItem({...editingItem, start_time: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select
                    value={editingItem.end_time}
                    onChange={(e) => setEditingItem({...editingItem, end_time: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button onClick={() => setEditingItem(null)} className="px-6 py-3 text-gray-400 font-bold">Cancel</button>
                  <button onClick={() => handleUpdateScheduleItem(editingItem)} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold">Save Changes</button>
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