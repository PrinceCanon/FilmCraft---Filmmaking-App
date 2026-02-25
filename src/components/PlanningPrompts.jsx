import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import StoryStructureBuilder from './StoryStructureBuilder';
import ScriptManager from './ScriptManager';
import EnhancedShotListBuilder from './EnhancedShotListBuilder';
import ProductionScheduler from './ProductionScheduler';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiPackage, FiCheck, FiX } = FiIcons;

const ResourceItem = ({ item, onUpdate, onRemove }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl group hover:border-purple-500/30 transition-all">
    <span className="text-white text-sm font-medium">{item}</span>
    <button 
      onClick={onRemove}
      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
    >
      <SafeIcon icon={FiTrash2} />
    </button>
  </div>
);

const ResourceAdder = ({ category, onAdd }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`mt-2 flex items-center space-x-2 p-2 rounded-xl transition-all border ${isFocused ? 'bg-white/5 border-purple-500/50' : 'bg-transparent border-transparent'}`}>
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm py-1 px-2"
          placeholder={`Add new ${category.toLowerCase()} item...`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider border border-white/10 px-1.5 py-0.5 rounded">
            Enter ↵
          </span>
        </div>
      </div>
      <button 
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-lg transition-all"
      >
        <SafeIcon icon={FiPlus} />
      </button>
    </div>
  );
};

const PlanningPrompts = ({ step, project, onDataUpdate }) => {
  const renderStoryAndScript = () => (
    <div className="space-y-8">
      <ScriptManager 
        project={project} 
        onScriptUpdate={(scriptData) => onDataUpdate(scriptData)} 
      />
      
      <StoryStructureBuilder 
        project={project} 
        onDataUpdate={onDataUpdate} 
      />
    </div>
  );

  const renderShotList = () => (
    <EnhancedShotListBuilder 
      project={project} 
      onDataUpdate={onDataUpdate} 
    />
  );

  const renderSchedule = () => (
    <ProductionScheduler 
      project={project} 
      onDataUpdate={onDataUpdate} 
    />
  );

  const renderResources = () => {
    const [resources, setResources] = useState(project.resources || {});
    const categories = ['Equipment', 'Props', 'Costumes', 'Team', 'Other'];
    const updateTimeoutRef = useRef(null);

    useEffect(() => {
      setResources(project.resources || {});
    }, [project.resources]);

    const handleUpdateResources = async (updatedResources) => {
      setResources(updatedResources);
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(async () => {
        onDataUpdate({ resources: updatedResources });

        try {
          const { data: scenes, error } = await supabase
            .from('scenes_fc2024')
            .select('*')
            .eq('project_id', project.id);

          if (!error && scenes) {
            for (const scene of scenes) {
              const sceneResources = scene.resources || {};
              const updatedSceneResources = { ...sceneResources, ...updatedResources };
              await supabase.from('scenes_fc2024').update({ resources: updatedSceneResources }).eq('id', scene.id);
            }
          }
        } catch (error) {
          console.error('Error updating scene resources:', error);
        }
      }, 500);
    };

    const handleAddItem = (category, value) => {
      const newItems = [...(resources[category] || []), value];
      const updatedResources = { ...resources, [category]: newItems };
      handleUpdateResources(updatedResources);
    };

    const handleRemoveItem = (category, index) => {
      const newItems = (resources[category] || []).filter((_, i) => i !== index);
      const updatedResources = { ...resources, [category]: newItems };
      handleUpdateResources(updatedResources);
    };

    return (
      <div className="space-y-6">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-2 text-left">Resource Planning</h4>
          <ul className="text-purple-300 text-sm space-y-1 text-left">
            <li>• List all equipment, props, and team members needed</li>
            <li>• Use Enter to quickly add items to the list</li>
            <li>• Resources will be available for assignment during shooting</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div key={category} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiPackage} className="text-purple-400 text-lg" />
                <h4 className="text-lg font-bold text-white">{category}</h4>
                <span className="ml-auto text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                  {(resources[category] || []).length} items
                </span>
              </div>

              <div className="flex-1 space-y-2 mb-4">
                <AnimatePresence>
                  {(resources[category] || []).map((item, index) => (
                    <motion.div
                      key={`${category}-${index}-${item}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ResourceItem
                        item={item}
                        onRemove={() => handleRemoveItem(category, index)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(resources[category] || []).length === 0 && (
                  <div className="text-center py-4 text-gray-600 text-sm italic border border-dashed border-white/5 rounded-xl">
                    No items yet
                  </div>
                )}
              </div>

              <div className="mt-auto border-t border-white/5 pt-2">
                <ResourceAdder category={category} onAdd={(val) => handleAddItem(category, val)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  switch (step) {
    case 0: return renderStoryAndScript();
    case 1: return renderShotList();
    case 2: return renderSchedule();
    case 3: return renderResources();
    default: return null;
  }
};

export default PlanningPrompts;