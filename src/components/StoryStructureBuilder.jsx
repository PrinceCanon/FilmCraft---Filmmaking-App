import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiMapPin, FiSave, FiCheckCircle, FiAlertCircle, FiClock } = FiIcons;

const StoryStructureBuilder = ({ project, onDataUpdate }) => {
  const [generating, setGenerating] = useState(false);
  const [newSegment, setNewSegment] = useState({
    title: '',
    description: '',
    duration: '30 seconds',
    act: 'setup',
    location: '',
    location_type: 'Indoor'
  });

  const handleAddSegment = () => {
    if (!newSegment.title.trim()) return;
    const segments = project.story_structure || [];
    onDataUpdate({ 
      story_structure: [...segments, { ...newSegment, id: Date.now() }] 
    });
    setNewSegment({ ...newSegment, title: '', description: '', location: '' });
  };

  const removeSegment = (id) => {
    const segments = project.story_structure || [];
    onDataUpdate({ story_structure: segments.filter(s => s.id !== id) });
  };

  const generateScenes = async () => {
    const segments = project.story_structure || [];
    if (segments.length === 0) return alert('Add story segments first.');
    
    setGenerating(true);
    try {
      // 1. Delete existing scenes
      await supabase.from('scenes_fc2024').delete().eq('project_id', project.id);

      // 2. Prepare new scenes
      const scenesToCreate = segments.map((s, idx) => ({
        project_id: project.id,
        scene_number: idx + 1,
        title: s.title,
        description: s.description,
        location: s.location || 'TBD',
        location_type: s.location_type,
        checklist: {},
        resources: {}
      }));

      // 3. Insert and update
      const { error } = await supabase.from('scenes_fc2024').insert(scenesToCreate);
      if (error) throw error;

      await onDataUpdate({ scenes_generated: true });
      alert('Scenes generated successfully! Ready for Shot List.');
    } catch (error) {
      console.error('Scene generation failed:', error);
      alert('Failed to sync scenes with database.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-6 flex items-center">
          <SafeIcon icon={FiPlus} className="mr-2 text-purple-400" />
          Add Story Segment
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Segment Title (e.g. The Hero's Discovery)"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            value={newSegment.title}
            onChange={e => setNewSegment({...newSegment, title: e.target.value})}
          />
          <select 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            value={newSegment.act}
            onChange={e => setNewSegment({...newSegment, act: e.target.value})}
          >
            <option value="setup" className="bg-gray-800">Act 1: Setup</option>
            <option value="conflict" className="bg-gray-800">Act 2: Conflict</option>
            <option value="resolution" className="bg-gray-800">Act 3: Resolution</option>
          </select>
        </div>
        <textarea 
          placeholder="What happens in this part of the story?"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none mb-4 h-24 resize-none"
          value={newSegment.description}
          onChange={e => setNewSegment({...newSegment, description: e.target.value})}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <div className="relative">
             <SafeIcon icon={FiMapPin} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
             <input 
               type="text" 
               placeholder="Location (optional)"
               className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none"
               value={newSegment.location}
               onChange={e => setNewSegment({...newSegment, location: e.target.value})}
             />
           </div>
           <select 
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
            value={newSegment.duration}
            onChange={e => setNewSegment({...newSegment, duration: e.target.value})}
          >
            <option value="15 seconds" className="bg-gray-800">15 sec</option>
            <option value="30 seconds" className="bg-gray-800">30 sec</option>
            <option value="1 minute" className="bg-gray-800">1 min</option>
          </select>
        </div>
        <button 
          onClick={handleAddSegment}
          className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
        >
          Add to Storyboard
        </button>
      </div>

      {/* Segments List */}
      <div className="space-y-4">
        {(project.story_structure || []).map((seg, idx) => (
          <div key={seg.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start space-x-4">
            <div className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-white text-lg">{seg.title}</h5>
                <button onClick={() => removeSegment(seg.id)} className="text-gray-500 hover:text-red-400">
                  <SafeIcon icon={FiTrash2} />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">{seg.description}</p>
              <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                <span className="uppercase">{seg.act}</span>
                <span>•</span>
                <span className="flex items-center"><SafeIcon icon={FiClock} className="mr-1" /> {seg.duration}</span>
                {seg.location && <span className="flex items-center"><SafeIcon icon={FiMapPin} className="mr-1" /> {seg.location}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      {(project.story_structure || []).length > 0 && (
        <div className="pt-8 border-t border-white/10 text-center">
          <button 
            disabled={generating}
            onClick={generateScenes}
            className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center mx-auto"
          >
            {generating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3" />
            ) : (
              <SafeIcon icon={FiCheckCircle} className="mr-2 text-xl" />
            )}
            {generating ? 'Syncing...' : 'Confirm & Sync To Production'}
          </button>
          <p className="text-gray-500 text-sm mt-4 italic">
            This will create professional scene breakdowns for your production phase.
          </p>
        </div>
      )}
    </div>
  );
};

export default StoryStructureBuilder;