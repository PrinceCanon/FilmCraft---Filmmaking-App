import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiFileText, FiDownload, FiTrash2, FiClock } = FiIcons;

const ScriptManager = ({ project, onScriptUpdate }) => {
  const [script, setScript] = useState(project.script || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    setScript(project.script || '');
  }, [project.script]);

  const handleSave = async () => {
    if (!script.trim()) return;
    setSaving(true);
    try {
      await onScriptUpdate(script);
      setLastSaved(new Date());
    } catch (error) {
      alert('Save failed. Check connection.');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const estimatedReadingTime = Math.ceil(wordCount / 130); // Avg speaking speed

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <SafeIcon icon={FiFileText} className="text-purple-400" />
          </div>
          <div>
            <h4 className="font-bold text-white">Script Editor</h4>
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{estimatedReadingTime} min read</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <span className="text-xs text-gray-500 flex items-center">
              <SafeIcon icon={FiClock} className="mr-1" />
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving || !script.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            <SafeIcon icon={saving ? FiClock : FiSave} className={saving ? 'animate-spin' : ''} />
            <span>{saving ? 'Saving...' : 'Save Script'}</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <textarea
          value={script}
          onChange={e => setScript(e.target.value)}
          className="w-full h-[500px] bg-white/5 border border-white/10 rounded-2xl p-8 text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 outline-none resize-none scrollbar-thin scrollbar-thumb-white/10"
          placeholder="INT. STUDIO - DAY&#10;&#10;The camera pans across the room...&#10;&#10;PRODUCER&#10;Ready when you are."
        />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
            <SafeIcon icon={FiDownload} />
          </button>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
        <div className="p-1.5 bg-blue-500/20 rounded-lg mt-0.5">
          <SafeIcon icon={FiFileText} className="text-blue-400 text-sm" />
        </div>
        <p className="text-blue-300 text-xs leading-relaxed">
          <strong>Tip:</strong> Use standard screenplay formatting (INT./EXT. for scenes, UPPERCASE for characters) to make your script easier for the crew to read.
        </p>
      </div>
    </div>
  );
};

export default ScriptManager;