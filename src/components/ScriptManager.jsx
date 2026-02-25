import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { 
  FiSave, FiFileText, FiTrash2, FiPlus, FiCopy,
  FiChevronDown, FiChevronUp, FiCamera, FiX, FiEye, FiList, FiAlertCircle
} = FiIcons;

const SHOT_TYPES = ['Wide Shot (WS)', 'Medium Shot (MS)', 'Close Up (CU)', 'Extreme Close Up (ECU)', 'POV', 'OTS', 'Master Shot', 'Insert', 'Two Shot', 'Drone / Aerial'];
const SHOT_ANGLES = ['Eye Level', 'High Angle', 'Low Angle', 'Dutch Angle', 'Birds Eye', 'Worms Eye', 'Shoulder Level'];
const LENSES = ['14mm', '18mm', '24mm', '35mm', '50mm', '85mm', '100mm', '135mm'];

const getStyleForType = (type) => {
  switch(type) {
    case 'CHARACTER': return 'text-center font-bold uppercase text-white mt-8 mb-1 mx-auto max-w-[50%] tracking-widest';
    case 'DIALOGUE': return 'text-center text-gray-200 italic mb-4 mx-auto max-w-[70%] leading-snug';
    case 'PARENTHETICAL': return 'text-center text-gray-500 text-sm italic mb-1 mx-auto max-w-[60%]';
    case 'TRANSITION': return 'text-right font-bold uppercase text-gray-400 mt-8 mb-4';
    default: return 'text-gray-300 text-left mb-4 leading-relaxed';
  }
};

const blocksToHtml = (blocks) => {
  if (!blocks || blocks.length === 0) return '<p class="script-action text-gray-300 text-left mb-4 leading-relaxed" data-type="ACTION"><br></p>';
  return blocks.map(b => {
    const className = `script-${b.type.toLowerCase()} ${getStyleForType(b.type)}`;
    return `<p class="${className}" data-type="${b.type}">${b.content || '<br>'}</p>`;
  }).join('');
};

const htmlToBlocks = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const blocks = [];
  Array.from(tempDiv.children).forEach(p => {
    const type = p.dataset.type || 'ACTION';
    const content = p.innerText.trim();
    if (content || p.innerHTML === '<br>') {
      blocks.push({ id: `gen-${Date.now()}-${Math.random()}`, type, content: content || '' });
    }
  });
  return blocks;
};

// Helper to normalize text for comparison (removes excess whitespace)
const normalizeText = (text) => text.replace(/\s+/g, ' ').trim().toLowerCase();

const ScriptManager = ({ project, onScriptUpdate }) => {
  const [scenes, setScenes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [selection, setSelection] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [linkedShots, setLinkedShots] = useState([]);
  const [showLinkedShots, setShowLinkedShots] = useState(false);
  const [allSceneShots, setAllSceneShots] = useState({});
  const containerRef = useRef(null);
  const isInitialLoad = useRef(true);
  const autoSaveTimeoutRef = useRef(null);
  const scenesChangedRef = useRef(false);

  useEffect(() => {
    if (project?.id && isInitialLoad.current) {
      const rawBlocks = Array.isArray(project.script_json) ? project.script_json : [];
      const parsedScenes = [];
      let currentScene = null;
      let currentBlocks = [];

      rawBlocks.forEach(block => {
        if (block.type === 'SCENE_HEADING') {
          if (currentScene) {
            currentScene.html = blocksToHtml(currentBlocks);
            parsedScenes.push(currentScene);
          }
          currentScene = { id: block.id || `scene-${Date.now()}`, heading: block.content, html: '', isCollapsed: false };
          currentBlocks = [];
        } else {
          currentBlocks.push(block);
        }
      });

      if (currentScene) {
        currentScene.html = blocksToHtml(currentBlocks);
        parsedScenes.push(currentScene);
      } else if (rawBlocks.length > 0) {
        parsedScenes.push({ id: 'init', heading: 'SCENE 1', html: blocksToHtml(rawBlocks), isCollapsed: false });
      } else {
        parsedScenes.push({ id: `sc-${Date.now()}`, heading: 'EXT. LOCATION - DAY', html: blocksToHtml([]), isCollapsed: false });
      }
      
      setScenes(parsedScenes);
      isInitialLoad.current = false;
    }
  }, [project.id]);

  useEffect(() => {
    if (project?.id) {
      loadAllSceneShots();
      
      const channel = supabase
        .channel(`script_shots_${project.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'shot_lists_fc2024', 
          filter: `project_id=eq.${project.id}` 
        }, () => {
          loadAllSceneShots();
        })
        .subscribe();
      
      return () => supabase.removeChannel(channel);
    }
  }, [project?.id]);

  const loadAllSceneShots = async () => {
    if (!project?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const shotsByScene = {};
      (data || []).forEach(shot => {
        if (!shot.selection_text) return;
        
        const sceneNum = shot.scene_number;
        if (!shotsByScene[sceneNum]) {
          shotsByScene[sceneNum] = [];
        }
        
        const existingGroup = shotsByScene[sceneNum].find(
          g => normalizeText(g.text) === normalizeText(shot.selection_text)
        );
        
        if (existingGroup) {
          existingGroup.shots.push(shot);
        } else {
          shotsByScene[sceneNum].push({
            text: shot.selection_text,
            shots: [shot]
          });
        }
      });
      
      setAllSceneShots(shotsByScene);
    } catch (err) {
      console.error('Error loading scene shots:', err);
    }
  };

  const performSave = useCallback(async () => {
    if (!project?.id || scenes.length === 0 || !scenesChangedRef.current) return;
    setSaving(true);
    scenesChangedRef.current = false;
    
    try {
      let fullBlocks = [];
      const scenesPayload = [];

      scenes.forEach((scene, index) => {
        fullBlocks.push({ id: scene.id, type: 'SCENE_HEADING', content: scene.heading });
        const bodyBlocks = htmlToBlocks(scene.html);
        fullBlocks = [...fullBlocks, ...bodyBlocks];
        
        scenesPayload.push({
          project_id: project.id,
          scene_number: index + 1,
          title: scene.heading || `Scene ${index + 1}`,
          description: 'Updated from Script Editor'
        });
      });

      await onScriptUpdate({ script_json: fullBlocks });
      await supabase.from('scenes_fc2024').upsert(scenesPayload, { onConflict: 'project_id, scene_number' });
      setLastSynced(new Date());
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  }, [project.id, scenes, onScriptUpdate]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    
    scenesChangedRef.current = true;
    
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [scenes, performSave]);

  const handleDuplicateScene = (scene) => {
    const newScene = {
      ...scene,
      id: `sc-dup-${Date.now()}`,
      isCollapsed: false
    };
    const index = scenes.findIndex(s => s.id === scene.id);
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, newScene);
    setScenes(newScenes);
  };

  const loadLinkedShots = async (text, sceneNumber) => {
    try {
      const { data, error } = await supabase
        .from('shot_lists_fc2024')
        .select('*')
        .eq('project_id', project.id)
        .eq('scene_number', sceneNumber);
      
      if (error) {
        console.error('Error loading linked shots:', error);
        return [];
      }
      
      const filtered = (data || []).filter(shot => {
        if (!shot.selection_text) return false;
        return normalizeText(shot.selection_text).includes(normalizeText(text));
      });
      
      return filtered;
    } catch (err) {
      console.error('Error in loadLinkedShots:', err);
      return [];
    }
  };

  const handleSelection = async () => {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) {
      setSelection(null);
      setShowCreator(false);
      setShowLinkedShots(false);
      return;
    }

    const text = sel.toString().trim();
    if (text.length > 2) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      let node = range.commonAncestorContainer;
      let blockType = 'ACTION';
      
      // Find the parent block element to determine type
      let typeNode = node.nodeType === 1 ? node : node.parentElement;
      while (typeNode && typeNode.tagName !== 'DIV' && !typeNode.dataset?.type) {
        typeNode = typeNode.parentElement;
      }
      if (typeNode && typeNode.dataset?.type) {
        blockType = typeNode.dataset.type;
      }

      while (node && node.nodeType !== 1) node = node.parentElement;
      const sceneNode = node?.closest('[data-scene-id]');
      
      if (sceneNode) {
        const sceneId = sceneNode.dataset.sceneId;
        const sceneIndex = scenes.findIndex(s => s.id === sceneId);
        const sceneNumber = sceneIndex + 1;
        
        const shots = await loadLinkedShots(text, sceneNumber);
        setLinkedShots(shots);
        
        setSelection({
          text,
          blockType,
          sceneId,
          sceneNumber,
          sceneHeading: scenes[sceneIndex].heading,
          x: rect.left + rect.width / 2,
          y: rect.top,
          shotCount: shots.length
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-40" ref={containerRef}>
      <div className="flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-xl z-[100] py-6 px-4 border-b border-white/10 -mx-4 mb-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
            <SafeIcon icon={FiFileText} className="text-purple-400 text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Script Editor</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                {saving ? 'Saving...' : lastSynced ? `Auto-saved ${lastSynced.toLocaleTimeString()}` : 'Auto-save Active'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={performSave}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-purple-500/20"
        >
          <SafeIcon icon={FiSave} />
          <span>Save Now</span>
        </button>
      </div>

      <div className="space-y-12 font-mono relative" onMouseUp={handleSelection}>
        <AnimatePresence>
          {selection && !showCreator && !showLinkedShots && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ 
                left: `${selection.x}px`,
                top: `${selection.y - 70}px`,
                position: 'fixed',
                transform: 'translateX(-50%)'
              }}
              className="z-[150] flex items-center gap-2"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setShowCreator(true); }}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-full font-black text-[10px] uppercase border border-purple-400/50 shadow-2xl hover:bg-purple-500 hover:scale-105 transition-all"
              >
                <SafeIcon icon={FiCamera} />
                <span>Add Quick Shot</span>
              </button>
              
              {selection.shotCount > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowLinkedShots(true); }}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase border border-blue-400/50 shadow-2xl hover:bg-blue-500 hover:scale-105 transition-all"
                >
                  <SafeIcon icon={FiEye} />
                  <span>{selection.shotCount}</span>
                </button>
              )}
            </motion.div>
          )}

          {showCreator && selection && (
            <ShotCreatorPopup 
              selection={selection} 
              projectId={project.id} 
              onClose={() => { setShowCreator(false); setSelection(null); }} 
              onSuccess={async () => {
                setShowCreator(false);
                await loadAllSceneShots();
                const shots = await loadLinkedShots(selection.text, selection.sceneNumber);
                setLinkedShots(shots);
                setSelection({...selection, shotCount: shots.length});
              }}
            />
          )}

          {showLinkedShots && linkedShots.length > 0 && (
            <LinkedShotsViewer
              shots={linkedShots}
              selection={selection}
              onClose={() => setShowLinkedShots(false)}
            />
          )}
        </AnimatePresence>

        {scenes.map((scene, index) => (
          <SceneItem 
            key={scene.id} 
            scene={scene} 
            index={index}
            sceneShots={allSceneShots[index + 1] || []}
            onUpdate={(updated) => setScenes(prev => prev.map(s => s.id === updated.id ? updated : s))}
            onDelete={() => setScenes(prev => prev.filter(s => s.id !== scene.id))}
            onDuplicate={() => handleDuplicateScene(scene)}
            onViewShots={(shots) => {
              setLinkedShots(shots);
              setShowLinkedShots(true);
            }}
          />
        ))}

        <div className="flex justify-center pt-6">
          <button 
            onClick={() => setScenes([...scenes, { id: `sc-${Date.now()}`, heading: 'INT. NEW SCENE - DAY', html: '<p class="script-action text-gray-300 text-left mb-4 leading-relaxed" data-type="ACTION"><br></p>', isCollapsed: false }])}
            className="px-14 py-6 bg-white/5 hover:bg-white/10 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] border border-white/10 transition-all flex items-center space-x-4 shadow-xl hover:border-purple-500/40"
          >
            <SafeIcon icon={FiPlus} />
            <span>Add New Scene</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const SceneItem = ({ scene, index, sceneShots, onUpdate, onDelete, onDuplicate, onViewShots }) => {
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shotIndicators, setShotIndicators] = useState([]);

  useEffect(() => {
    if (contentRef.current && !isInitialized) {
      contentRef.current.innerHTML = scene.html;
      setIsInitialized(true);
    }
  }, [scene.html, isInitialized]);

  // FIXED: Calculate shot indicator positions for multi-line selections
  useEffect(() => {
    if (!contentRef.current || !sceneShots.length || !isInitialized) {
      setShotIndicators([]);
      return;
    }

    const calculateIndicators = () => {
      const indicators = [];
      const contentElement = contentRef.current;
      const paragraphs = Array.from(contentElement.children);
      
      sceneShots.forEach((shotGroup, groupIdx) => {
        const searchText = normalizeText(shotGroup.text);
        
        // Try to find which paragraphs contain this text
        let matchedParagraphs = [];
        
        // Build the full normalized text from all paragraphs with separator
        let fullText = '';
        let paragraphTextMap = [];
        
        paragraphs.forEach((p, idx) => {
          const pText = normalizeText(p.innerText);
          const start = fullText.length;
          fullText += pText + ' '; // Add space as separator
          paragraphTextMap.push({
            element: p,
            start: start,
            end: start + pText.length,
            index: idx
          });
        });
        
        // Find the search text in the full concatenated text
        const searchIndex = fullText.indexOf(searchText);
        
        if (searchIndex !== -1) {
          const endIndex = searchIndex + searchText.length;
          
          // Find ALL paragraphs that overlap with the search range
          paragraphTextMap.forEach(pMap => {
            const overlaps = (
              (searchIndex >= pMap.start && searchIndex < pMap.end) || // starts in this para
              (endIndex > pMap.start && endIndex <= pMap.end) ||       // ends in this para
              (searchIndex <= pMap.start && endIndex >= pMap.end)      // spans entire para
            );
            
            if (overlaps) {
              matchedParagraphs.push(pMap.element);
            }
          });
          
          if (matchedParagraphs.length > 0) {
            // Get bounding boxes
            const firstPara = matchedParagraphs[0];
            const lastPara = matchedParagraphs[matchedParagraphs.length - 1];
            
            const firstRect = firstPara.getBoundingClientRect();
            const lastRect = lastPara.getBoundingClientRect();
            const containerRect = contentElement.getBoundingClientRect();
            
            const top = firstRect.top - containerRect.top;
            const height = (lastRect.bottom - firstRect.top);
            
            console.log(`Indicator for "${shotGroup.text.substring(0, 30)}...": top=${top}px, height=${height}px, paragraphs=${matchedParagraphs.length}`);
            
            indicators.push({
              id: `indicator-${groupIdx}`,
              top: Math.max(0, top),
              height: Math.max(24, height),
              shots: shotGroup.shots,
              text: shotGroup.text
            });
          }
        } else {
          console.warn(`Could not find text "${shotGroup.text.substring(0, 30)}..." in scene content`);
        }
      });
      
      console.log(`Total indicators calculated: ${indicators.length}`);
      setShotIndicators(indicators);
    };

    const timer = setTimeout(calculateIndicators, 200);
    window.addEventListener('resize', calculateIndicators);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateIndicators);
    };
  }, [sceneShots, scene.html, isInitialized]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      
      const anchor = sel.anchorNode;
      const p = (anchor.nodeType === 3 ? anchor.parentElement : anchor)?.closest('p');
      if (!p) return;

      const range = sel.getRangeAt(0);
      const offset = range.startOffset;
      const container = range.startContainer;

      const types = ['ACTION', 'CHARACTER', 'PARENTHETICAL', 'DIALOGUE', 'TRANSITION'];
      const currentType = p.dataset.type || 'ACTION';
      const nextType = types[(types.indexOf(currentType) + 1) % types.length];
      
      p.dataset.type = nextType;
      p.className = `script-${nextType.toLowerCase()} ${getStyleForType(nextType)}`;

      try {
        const newRange = document.createRange();
        newRange.setStart(container, offset);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch (err) {
        p.focus();
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      
      const anchor = sel.anchorNode;
      const p = (anchor.nodeType === 3 ? anchor.parentElement : anchor)?.closest('p');
      if (!p) return;

      let nextType = 'ACTION';
      const currentType = p.dataset.type || 'ACTION';
      if (currentType === 'CHARACTER' || currentType === 'PARENTHETICAL') nextType = 'DIALOGUE';
      else if (currentType === 'DIALOGUE') nextType = 'ACTION';
      
      const newP = document.createElement('p');
      newP.dataset.type = nextType;
      newP.className = `script-${nextType.toLowerCase()} ${getStyleForType(nextType)}`;
      newP.innerHTML = '<br>';
      p.after(newP);
      
      const range = document.createRange();
      range.setStart(newP, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const handleBlur = () => {
    if (contentRef.current) {
      const newHtml = contentRef.current.innerHTML;
      if (newHtml !== scene.html) {
        onUpdate({ ...scene, html: newHtml });
      }
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:border-purple-500/20 shadow-xl" data-scene-id={scene.id}>
      <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-4">
          <span className="text-xs font-black text-purple-400 opacity-50 uppercase tracking-widest leading-none">SCENE {index + 1}</span>
          <input 
            value={scene.heading}
            onChange={(e) => onUpdate({...scene, heading: e.target.value.toUpperCase()})}
            placeholder="INT. LOCATION - DAY"
            className="bg-transparent border-none outline-none text-xl font-black text-white uppercase tracking-widest w-full placeholder-gray-800"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onDuplicate} className="p-2 text-gray-600 hover:text-purple-400 transition-colors" title="Duplicate Scene"><SafeIcon icon={FiCopy} /></button>
          <button onClick={onDelete} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><SafeIcon icon={FiTrash2} /></button>
          <button onClick={() => onUpdate({...scene, isCollapsed: !scene.isCollapsed})} className="p-2 text-gray-400 hover:text-white transition-colors">
            <SafeIcon icon={scene.isCollapsed ? FiChevronDown : FiChevronUp} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!scene.isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="relative"
          >
            <div className="p-12 pl-16 relative" ref={containerRef}>
              
              {/* Shot Indicators */}
              <div 
                className="absolute left-4 top-12 bottom-12 w-10 z-10"
                style={{ pointerEvents: 'none' }}
              >
                {shotIndicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    style={{
                      position: 'absolute',
                      top: `${indicator.top}px`,
                      height: `${indicator.height}px`,
                      pointerEvents: 'auto'
                    }}
                    className="w-full"
                  >
                    <button
                      onClick={() => onViewShots(indicator.shots)}
                      className="relative w-full h-full group cursor-pointer"
                      title={`${indicator.shots.length} shot${indicator.shots.length > 1 ? 's' : ''}`}
                    >
                      {/* Gradient Line */}
                      <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-blue-500 via-blue-600 to-purple-600 rounded-full group-hover:w-2.5 transition-all shadow-lg shadow-blue-500/50" />
                      
                      {/* Shot Count Badge */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 min-w-[22px] h-[22px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-full border-2 border-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl z-20">
                        <span className="text-[10px] font-black text-white px-1">{indicator.shots.length}</span>
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap shadow-2xl border border-blue-400/50">
                          {indicator.shots.length} Shot{indicator.shots.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Script Content */}
              <div 
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                className="outline-none min-h-[200px] script-content-area text-lg text-white focus:ring-0 relative z-0"
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Smart Parsing Logic
const getSmartDefaults = (blockType, text) => {
  let defaults = {
    shot_type: 'Medium Shot (MS)',
    shot_angle: 'Eye Level',
    title: ''
  };

  const cleanText = text.replace(/[\n\r]+/g, ' ').substring(0, 50);

  switch(blockType) {
    case 'DIALOGUE':
      defaults.shot_type = 'Medium Shot (MS)';
      defaults.shot_angle = 'Eye Level';
      defaults.title = `Dialogue: ${cleanText}...`;
      break;
    case 'ACTION':
      defaults.shot_type = 'Wide Shot (WS)';
      defaults.shot_angle = 'Eye Level';
      defaults.title = `Action: ${cleanText}...`;
      break;
    case 'CHARACTER':
      defaults.shot_type = 'Close Up (CU)';
      defaults.shot_angle = 'Eye Level';
      defaults.title = `CU: ${cleanText}`;
      break;
    case 'TRANSITION':
      defaults.shot_type = 'Wide Shot (WS)';
      defaults.shot_angle = 'Eye Level';
      defaults.title = `Transition: ${cleanText}`;
      break;
    case 'PARENTHETICAL':
      defaults.shot_type = 'Close Up (CU)';
      defaults.shot_angle = 'Eye Level';
      defaults.title = `Reaction: ${cleanText}`;
      break;
    case 'SCENE_HEADING':
      defaults.shot_type = 'Master Shot';
      defaults.shot_angle = 'High Angle';
      defaults.title = `Master: ${cleanText}`;
      break;
    default:
      defaults.title = `Shot: ${cleanText}...`;
  }
  return defaults;
};

const ShotCreatorPopup = ({ selection, projectId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const smartDefaults = getSmartDefaults(selection.blockType, selection.text);

  const [shotData, setShotData] = useState({
    title: smartDefaults.title,
    shot_type: smartDefaults.shot_type,
    shot_angle: smartDefaults.shot_angle,
    lens: '35mm',
    description: selection.text
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    setError(null);
    
    try {
      const shotPayload = {
        project_id: projectId,
        scene_number: selection.sceneNumber,
        title: shotData.title,
        shot_type: shotData.shot_type,
        shot_angle: shotData.shot_angle,
        lens: shotData.lens,
        selection_text: selection.text,
        description: shotData.description,
        status: 'pending',
        order_index: Date.now()
      };

      const { data, error: insertError } = await supabase
        .from('shot_lists_fc2024')
        .insert([shotPayload])
        .select();
      
      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }
      
      onSuccess();
    } catch (e) {
      console.error('Error creating quick shot:', e);
      setError(e.message || 'Failed to create shot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{ 
        left: `${selection.x}px`,
        top: `${selection.y - 420}px`,
        position: 'fixed',
        transform: 'translateX(-50%)'
      }}
      className="z-[200] w-80 bg-slate-900 border border-purple-500/50 rounded-[2.5rem] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] backdrop-blur-3xl"
    >
      <div className="flex justify-between mb-6 items-center">
        <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
          <SafeIcon icon={FiCamera} /> Quick Capture
        </h4>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><SafeIcon icon={FiX} /></button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-2">
            <SafeIcon icon={FiAlertCircle} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-400 mb-1">Error</p>
              <p className="text-[10px] text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-5">
        <div>
          <label className="text-[9px] text-gray-500 font-black uppercase mb-1.5 block ml-1">Shot Title & Context</label>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2">
            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-1 inline-block">
              {selection.blockType}
            </span>
            <p className="text-[10px] text-gray-400 line-clamp-2 italic">"{selection.text}"</p>
          </div>
          <input 
            value={shotData.title}
            onChange={e => setShotData({...shotData, title: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-4">
          <select value={shotData.shot_type} onChange={e => setShotData({...shotData, shot_type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
            {SHOT_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={shotData.shot_angle} onChange={e => setShotData({...shotData, shot_angle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
              {SHOT_ANGLES.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
            </select>
            <select value={shotData.lens} onChange={e => setShotData({...shotData, lens: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none">
              {LENSES.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
        >
          {loading ? 'Adding Shot...' : 'Add to Shot List'}
        </button>
      </div>
      <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-purple-500/50 rotate-45" />
    </motion.div>
  );
};

const LinkedShotsViewer = ({ shots, selection, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] w-96 bg-slate-900 border border-blue-500/50 rounded-[2.5rem] p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] backdrop-blur-3xl max-h-[500px] overflow-y-auto"
    >
      <div className="flex justify-between mb-6 items-center sticky top-0 bg-slate-900 pb-4">
        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <SafeIcon icon={FiList} /> Linked Shots ({shots.length})
        </h4>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><SafeIcon icon={FiX} /></button>
      </div>
      
      <div className="space-y-4">
        {shots.map((shot, idx) => (
          <div key={shot.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-black text-blue-400">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-white mb-2">{shot.title}</h5>
                {shot.description && (
                   <p className="text-[10px] text-gray-400 mb-2 italic border-l-2 border-white/10 pl-2">"{shot.description.substring(0, 100)}..."</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-black uppercase text-gray-400">
                    {shot.shot_type}
                  </span>
                  {shot.lens && (
                    <span className="px-2 py-1 bg-blue-500/10 rounded-lg text-[8px] font-black uppercase text-blue-400">
                      {shot.lens}
                    </span>
                  )}
                  {shot.shot_angle && (
                    <span className="px-2 py-1 bg-green-500/10 rounded-lg text-[8px] font-black uppercase text-green-400">
                      {shot.shot_angle}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-blue-500/50 rotate-45" />
    </motion.div>
  );
};

export default ScriptManager;