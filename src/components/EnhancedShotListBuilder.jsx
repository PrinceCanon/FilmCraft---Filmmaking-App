import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import ImageUpload from './ImageUpload';
import supabase from '../lib/supabase';
import { useProject } from '../context/ProjectContext';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiCamera, FiEdit2, FiCopy, FiTarget, FiMapPin, FiClock, FiSave, FiX, FiCheck, FiRefreshCw, FiMove, FiChevronDown, FiChevronUp, FiChevronRight } = FiIcons;

const EnhancedShotListBuilder = ({ project, onDataUpdate }) => {
  const { user } = useProject();
  const [shots, setShots] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [expandedScenes, setExpandedScenes] = useState(new Set([1]));
  const [loading, setLoading] = useState(false);
  const [editingShot, setEditingShot] = useState(null);
  const [scenesLoading, setScenesLoading] = useState(true);

  const shotTypes = ['Wide Shot', 'Medium Shot', 'Close-up', 'Extreme Close-up', 'POV', 'Establishing', 'Cutaway'];
  const shotAngles = ['Eye Level', 'High Angle', 'Low Angle', 'Dutch Angle', 'Birds Eye', 'Worms Eye', 'Over the Shoulder'];
  const cameraMovements = ['Static', 'Pan', 'Tilt', 'Zoom', 'Dolly', 'Tracking', 'Handheld'];
  const priorities = ['High', 'Medium', 'Low'];

  useEffect(() => {
    if (project?.id) {
      loadShots();
      loadScenes();
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
      if (data && data.length > 0) {
        setScenes(data);
      } else {
        const defaultScene = { scene_number: 1, title: 'Scene 1', description: 'Initial Scene' };
        setScenes([defaultScene]);
      }
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
      shot_type: 'Medium Shot',
      shot_angle: 'Eye Level',
      camera_movement: 'Static',
      priority: 'Medium',
      order_index: shots.length + 1,
      status: 'pending'
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

  if (scenesLoading) return <div className="text-center py-8 text-gray-400">Loading scenes...</div>;

  return (
    <div className="space-y-6">
      {scenes.map((scene) => (
        <div key={scene.scene_number} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5"
            onClick={() => setExpandedScenes(prev => {
              const next = new Set(prev);
              if (next.has(scene.scene_number)) next.delete(scene.scene_number);
              else next.add(scene.scene_number);
              return next;
            })}
          >
            <div className="flex items-center space-x-4">
              <SafeIcon icon={expandedScenes.has(scene.scene_number) ? FiChevronDown : FiChevronRight} className="text-purple-400" />
              <h3 className="text-lg font-bold text-white">{scene.title}</h3>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleAddShot(scene.scene_number); }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold"
            >
              Add Shot
            </button>
          </div>

          <AnimatePresence>
            {expandedScenes.has(scene.scene_number) && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="p-6 space-y-4 border-t border-white/5">
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
                      cameraMovements={cameraMovements}
                      priorities={priorities}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const ShotCard = ({ shot, index, isEditing, onEdit, onSave, onCancel, onRemove, shotTypes, shotAngles, cameraMovements, priorities }) => {
  const [localShot, setLocalShot] = useState(shot);

  if (isEditing) {
    return (
      <div className="bg-white/10 p-6 rounded-xl border-2 border-purple-500/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Title</label>
            <input value={localShot.title} onChange={e => setLocalShot({...localShot, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-2 rounded text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Type</label>
            <select value={localShot.shot_type} onChange={e => setLocalShot({...localShot, shot_type: e.target.value})} className="w-full bg-slate-800 border border-white/10 p-2 rounded text-white">
              {shotTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Angle</label>
            <select value={localShot.shot_angle} onChange={e => setLocalShot({...localShot, shot_angle: e.target.value})} className="w-full bg-slate-800 border border-white/10 p-2 rounded text-white">
              {shotAngles.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Movement</label>
            <select value={localShot.camera_movement} onChange={e => setLocalShot({...localShot, camera_movement: e.target.value})} className="w-full bg-slate-800 border border-white/10 p-2 rounded text-white">
              {cameraMovements.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-white/10 text-white rounded-lg">Cancel</button>
          <button onClick={() => onSave(localShot)} className="px-4 py-2 bg-green-500 text-white rounded-lg">Save Shot</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between group">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">{index}</div>
        <div>
          <h4 className="text-white font-bold">{shot.title}</h4>
          <div className="flex space-x-2 text-xs text-gray-500">
            <span>{shot.shot_type}</span>
            <span>•</span>
            <span className="text-blue-400">{shot.shot_angle || 'Eye Level'}</span>
            <span>•</span>
            <span>{shot.camera_movement}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 bg-white/10 hover:bg-white/20 rounded text-gray-400"><SafeIcon icon={FiEdit2} /></button>
        <button onClick={onRemove} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400"><SafeIcon icon={FiTrash2} /></button>
      </div>
    </div>
  );
};

export default EnhancedShotListBuilder;