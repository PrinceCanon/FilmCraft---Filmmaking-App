import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import ImageUpload from './ImageUpload';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiCamera, FiEdit2, FiCopy, FiTarget, FiMapPin, FiClock, FiSave, FiX, FiCheck, FiRefreshCw, FiMove, FiChevronDown, FiChevronUp, FiChevronRight, FiLink } = FiIcons;

const EnhancedShotListBuilder = ({ project, onDataUpdate }) => {
  const { user } = useProject();
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState(new Set([1]));
  const [loading, setLoading] = useState(false);
  const [editingShot, setEditingShot] = useState(null);
  const [scenesLoading, setScenesLoading] = useState(true);

  const shotTypes = ['Wide Shot (WS)', 'Medium Shot (MS)', 'Close Up (CU)', 'Extreme Close Up (ECU)', 'POV', 'OTS', 'Master Shot', 'Insert', 'Two Shot', 'Drone / Aerial'];
  const shotAngles = ['Eye Level', 'High Angle', 'Low Angle', 'Dutch Angle', 'Birds Eye', 'Worms Eye', 'Shoulder Level'];
  const lenses = ['14mm', '18mm', '24mm', '35mm', '50mm', '85mm', '100mm', '135mm'];
  const priorities = ['High', 'Medium', 'Low'];

  useEffect(() => {
    if (project?.id) {
      loadShots();
      loadScenes();
      
      const channel = supabase
        .channel(`shots_realtime_${project.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shot_lists_fc2024', filter: `project_id=eq.${project.id}` }, () => {
          loadShots();
        })
        .subscribe();
      
      return () => supabase.removeChannel(channel);
    }
  }, [project?.id]);

  const loadShots = async () => {
    const { data } = await supabase.from('shot_lists_fc2024').select('*').eq('project_id', project.id).order('order_index');
    setShots(data || []);
  };

  const loadScenes = async () => {
    try {
      setScenesLoading(true);
      const { data } = await supabase.from('scenes_fc2024').select('*').eq('project_id', project.id).order('scene_number');
      if (data && data.length > 0) setScenes(data);
      else setScenes([{ scene_number: 1, title: 'Scene 1', description: 'Initial' }]);
    } finally {
      setScenesLoading(false);
    }
  };

  const handleAddShot = async (sceneNumber) => {
    const sceneShots = shots.filter(s => s.scene_number === sceneNumber);
    const newShot = {
      project_id: project.id,
      scene_number: sceneNumber,
      title: `Shot ${sceneShots.length + 1}`,
      shot_type: 'Medium Shot (MS)',
      shot_angle: 'Eye Level',
      lens: '35mm',
      order_index: shots.length + 1,
      status: 'pending',
      priority: 'Medium',
      duration: '30 seconds'
    };

    const { data } = await supabase.from('shot_lists_fc2024').insert([newShot]).select().single();
    if (data) {
      setShots([...shots, data]);
      setEditingShot(data.id);
    }
  };

  const updateShot = async (shotId, updates) => {
    const { data } = await supabase.from('shot_lists_fc2024').update(updates).eq('id', shotId).select().single();
    if (data) setShots(shots.map(s => s.id === shotId ? data : s));
  };

  const removeShot = async (id) => {
    await supabase.from('shot_lists_fc2024').delete().eq('id', id);
    setShots(shots.filter(s => s.id !== id));
  };

  if (scenesLoading) return <div className="text-center py-20 text-gray-500 animate-pulse">Initializing Production Board...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Production Board</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Storyboarding & Technical Planning</p>
        </div>
      </div>

      {scenes.map((scene) => (
        <div key={scene.scene_number} className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden">
          <div 
            className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setExpandedScenes(prev => {
              const next = new Set(prev);
              if (next.has(scene.scene_number)) next.delete(scene.scene_number);
              else next.add(scene.scene_number);
              return next;
            })}
          >
            <div className="flex items-center space-x-5">
              <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/20">
                <SafeIcon icon={expandedScenes.has(scene.scene_number) ? FiChevronDown : FiChevronRight} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{scene.title}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {shots.filter(s => s.scene_number === scene.scene_number).length} Planned Shots
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAddShot(scene.scene_number); }}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 transition-all active:scale-95"
            >
              Add Shot
            </button>
          </div>

          <AnimatePresence>
            {expandedScenes.has(scene.scene_number) && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-8 space-y-8 border-t border-white/5 bg-black/20">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {shots.filter(s => s.scene_number === scene.scene_number).map((shot, idx) => (
                      <ShotCard 
                        key={shot.id} 
                        shot={shot} 
                        index={idx + 1}
                        isEditing={editingShot === shot.id}
                        onEdit={() => setEditingShot(shot.id)}
                        onSave={(updates) => { updateShot(shot.id, updates); setEditingShot(null); }}
                        onCancel={() => setEditingShot(null)}
                        onRemove={() => removeShot(shot.id)}
                        shotTypes={shotTypes}
                        shotAngles={shotAngles}
                        lenses={lenses}
                        priorities={priorities}
                      />
                    ))}
                  </div>
                  {shots.filter(s => s.scene_number === scene.scene_number).length === 0 && (
                    <div className="text-center py-24 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/10">
                      <SafeIcon icon={FiCamera} className="text-6xl text-gray-800 mx-auto mb-4 opacity-30" />
                      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No Technical Coverage Defined</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const ShotCard = ({ shot, index, isEditing, onEdit, onSave, onCancel, onRemove, shotTypes, shotAngles, lenses, priorities }) => {
  const [localShot, setLocalShot] = useState(shot);

  if (isEditing) {
    return (
      <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-purple-500/50 space-y-8 shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Shot Title</label>
            <input 
              value={localShot.title} 
              onChange={e => setLocalShot({...localShot, title: e.target.value})} 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-lg" 
            />
          </div>
          <div>
             <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2 block ml-1">Script Source / Description</label>
             <textarea 
               value={localShot.description || ''} 
               onChange={e => setLocalShot({...localShot, description: e.target.value})}
               className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none h-24 resize-none text-sm font-mono"
               placeholder="Script excerpt or action line..."
             />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block ml-1">Shot Type</label>
              <select value={localShot.shot_type} onChange={e => setLocalShot({...localShot, shot_type: e.target.value})} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none">
                {shotTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block ml-1">Angle</label>
              <select value={localShot.shot_angle} onChange={e => setLocalShot({...localShot, shot_angle: e.target.value})} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none">
                {shotAngles.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block ml-1">Lens</label>
              <select value={localShot.lens} onChange={e => setLocalShot({...localShot, lens: e.target.value})} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-white font-bold outline-none">
                {lenses.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 block ml-1">Director's Notes</label>
            <textarea 
              value={localShot.notes || ''} 
              onChange={e => setLocalShot({...localShot, notes: e.target.value})}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none h-32 resize-none"
              placeholder="Lighting requirements, blocking notes, or camera movement..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t border-white/5">
          <button onClick={onCancel} className="px-8 py-3 text-gray-400 font-bold hover:text-white transition-colors">Discard</button>
          <button onClick={() => onSave(localShot)} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-105 transition-all">Save Config</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex flex-col space-y-6 group relative hover:border-purple-500/30 transition-all shadow-lg hover:shadow-2xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-sm font-black text-purple-400 shadow-inner">
            {index}
          </div>
          <div className="flex-1">
            <h4 className="text-white font-black text-xl tracking-tight leading-tight">{shot.title}</h4>
            {shot.description && (
               <p className="text-[10px] text-gray-400 mt-1 italic line-clamp-2 border-l-2 border-white/10 pl-2">
                 {shot.description}
               </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                {shot.shot_type}
              </span>
              <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/10">
                {shot.lens}
              </span>
              <span className="px-3 py-1 bg-green-500/10 rounded-full text-[9px] font-black uppercase tracking-widest text-green-400 border border-green-500/10">
                {shot.shot_angle}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={onEdit} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white border border-white/10"><SafeIcon icon={FiEdit2} /></button>
          <button onClick={onRemove} className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 border border-red-500/10"><SafeIcon icon={FiTrash2} /></button>
        </div>
      </div>
      
      <div className="relative rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 h-64 shadow-inner">
        {shot.image_url ? (
          <img src={shot.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Storyboard" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
            <SafeIcon icon={FiCamera} className="text-5xl mb-3 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Awaiting Reference</span>
          </div>
        )}
        <div className="absolute bottom-6 right-6">
          <ImageUpload 
            onImageUploaded={(url) => onSave({...shot, image_url: url})} 
            currentImage={shot.image_url}
          />
        </div>
      </div>

      {shot.notes && (
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-xs text-gray-400 leading-relaxed italic">"{shot.notes}"</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedShotListBuilder;