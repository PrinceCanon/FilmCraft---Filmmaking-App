import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';

const { 
  FiPlus, FiTrash2, FiUsers, FiTool, FiUser, FiEdit2, FiSave, FiX, FiAlertCircle, FiCheck, FiPackage, FiBox
} = FiIcons;

const EQUIPMENT_CATEGORIES = [
  'Camera',
  'Lenses',
  'Lighting',
  'Audio',
  'Grip',
  'Power',
  'Storage',
  'Monitors',
  'Stabilization',
  'Other'
];

const ResourcesManager = ({ project }) => {
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [props, setProps] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cast');
  const [characters, setCharacters] = useState([]);

  const [newCast, setNewCast] = useState({ name: '', role: '', contact: '' });
  const [newCrew, setNewCrew] = useState({ name: '', position: '', contact: '' });
  const [newEquipment, setNewEquipment] = useState({ name: '', category: 'Camera', quantity: 1 });
  const [newProp, setNewProp] = useState({ name: '', description: '', quantity: 1 });
  const [newVehicle, setNewVehicle] = useState({ name: '', type: '', notes: '' });

  useEffect(() => {
    if (project?.id) {
      loadResources();
      loadCharactersFromScript();
    }
  }, [project?.id]);

  const loadCharactersFromScript = async () => {
    try {
      const scriptBlocks = project.script_json || [];
      const characterSet = new Set();
      
      scriptBlocks.forEach(block => {
        if (block.type === 'CHARACTER') {
          const cleanName = block.content.trim().toUpperCase();
          if (cleanName) characterSet.add(cleanName);
        }
      });
      
      setCharacters(Array.from(characterSet).sort());
    } catch (err) {
      console.error('Error extracting characters:', err);
    }
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      const [castRes, crewRes, equipRes, propsRes, vehiclesRes] = await Promise.all([
        supabase.from('cast_fc2024').select('*').eq('project_id', project.id).order('created_at'),
        supabase.from('crew_fc2024').select('*').eq('project_id', project.id).order('created_at'),
        supabase.from('equipment_fc2024').select('*').eq('project_id', project.id).order('category').order('created_at'),
        supabase.from('props_fc2024').select('*').eq('project_id', project.id).order('created_at'),
        supabase.from('vehicles_fc2024').select('*').eq('project_id', project.id).order('created_at')
      ]);
      
      setCast(castRes.data || []);
      setCrew(crewRes.data || []);
      setEquipment(equipRes.data || []);
      setProps(propsRes.data || []);
      setVehicles(vehiclesRes.data || []);
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCast = async () => {
    if (!newCast.name.trim() || !newCast.role.trim()) return;
    try {
      const { data, error } = await supabase
        .from('cast_fc2024')
        .insert([{ project_id: project.id, ...newCast }])
        .select()
        .single();
      if (error) throw error;
      setCast([...cast, data]);
      setNewCast({ name: '', role: '', contact: '' });
    } catch (err) {
      console.error('Error adding cast:', err);
    }
  };

  const addCrew = async () => {
    if (!newCrew.name.trim() || !newCrew.position.trim()) return;
    try {
      const { data, error } = await supabase
        .from('crew_fc2024')
        .insert([{ project_id: project.id, ...newCrew }])
        .select()
        .single();
      if (error) throw error;
      setCrew([...crew, data]);
      setNewCrew({ name: '', position: '', contact: '' });
    } catch (err) {
      console.error('Error adding crew:', err);
    }
  };

  const addEquipment = async () => {
    if (!newEquipment.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('equipment_fc2024')
        .insert([{ project_id: project.id, ...newEquipment }])
        .select()
        .single();
      if (error) throw error;
      setEquipment([...equipment, data]);
      setNewEquipment({ name: '', category: 'Camera', quantity: 1 });
    } catch (err) {
      console.error('Error adding equipment:', err);
    }
  };

  const addProp = async () => {
    if (!newProp.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('props_fc2024')
        .insert([{ project_id: project.id, ...newProp }])
        .select()
        .single();
      if (error) throw error;
      setProps([...props, data]);
      setNewProp({ name: '', description: '', quantity: 1 });
    } catch (err) {
      console.error('Error adding prop:', err);
    }
  };

  const addVehicle = async () => {
    if (!newVehicle.name.trim()) return;
    try {
      const { data, error } = await supabase
        .from('vehicles_fc2024')
        .insert([{ project_id: project.id, ...newVehicle }])
        .select()
        .single();
      if (error) throw error;
      setVehicles([...vehicles, data]);
      setNewVehicle({ name: '', type: '', notes: '' });
    } catch (err) {
      console.error('Error adding vehicle:', err);
    }
  };

  const removeResource = async (table, id, setter, list) => {
    try {
      await supabase.from(table).delete().eq('id', id);
      setter(list.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error removing resource:', err);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading resources...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
        <h4 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <SafeIcon icon={FiUsers} className="text-blue-400" />
          Production Resources
        </h4>
        <p className="text-blue-300 text-sm">Manage all resources for your production. These will be available when scheduling shoot days.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-white/5 p-1.5 rounded-2xl border border-white/10 gap-1">
        <button onClick={() => setActiveTab('cast')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'cast' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
          Cast ({cast.length})
        </button>
        <button onClick={() => setActiveTab('crew')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'crew' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
          Crew ({crew.length})
        </button>
        <button onClick={() => setActiveTab('equipment')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'equipment' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
          Equipment ({equipment.length})
        </button>
        <button onClick={() => setActiveTab('props')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'props' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
          Props ({props.length})
        </button>
        <button onClick={() => setActiveTab('vehicles')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'vehicles' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
          Vehicles ({vehicles.length})
        </button>
      </div>

      {/* Cast Tab */}
      {activeTab === 'cast' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h5 className="text-lg font-bold text-white mb-4">Add Cast Member</h5>
            {characters.length > 0 && (
              <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <SafeIcon icon={FiAlertCircle} />
                  Characters found in script
                </p>
                <div className="flex flex-wrap gap-2">
                  {characters.map(char => (
                    <button
                      key={char}
                      onClick={() => setNewCast({...newCast, role: char})}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-300 transition-all"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={newCast.name}
                onChange={(e) => setNewCast({ ...newCast, name: e.target.value })}
                placeholder="Actor Name *"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div>
                <select
                  value={newCast.role}
                  onChange={(e) => setNewCast({ ...newCast, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Character *</option>
                  {characters.map(char => (
                    <option key={char} value={char}>{char}</option>
                  ))}
                  <option value="__custom__">-- Custom Role --</option>
                </select>
                {newCast.role === '__custom__' && (
                  <input
                    value={newCast.role}
                    onChange={(e) => setNewCast({ ...newCast, role: e.target.value })}
                    placeholder="Enter custom role"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
                  />
                )}
              </div>
              <input
                value={newCast.contact}
                onChange={(e) => setNewCast({ ...newCast, contact: e.target.value })}
                placeholder="Contact Info"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button onClick={addCast} disabled={!newCast.name || !newCast.role || newCast.role === '__custom__'} className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-bold">
              <SafeIcon icon={FiPlus} className="inline mr-2" /> Add Cast Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cast.map(member => (
              <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="text-purple-400" />
                    </div>
                    <div>
                      <h6 className="font-bold text-white">{member.name}</h6>
                      <p className="text-sm text-purple-400 font-bold">{member.role}</p>
                    </div>
                  </div>
                  <button onClick={() => removeResource('cast_fc2024', member.id, setCast, cast)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                {member.contact && <p className="text-xs text-gray-500">{member.contact}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crew Tab */}
      {activeTab === 'crew' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h5 className="text-lg font-bold text-white mb-4">Add Crew Member</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={newCrew.name}
                onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                placeholder="Crew Name *"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={newCrew.position}
                onChange={(e) => setNewCrew({ ...newCrew, position: e.target.value })}
                placeholder="Position/Role *"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={newCrew.contact}
                onChange={(e) => setNewCrew({ ...newCrew, contact: e.target.value })}
                placeholder="Contact Info"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button onClick={addCrew} disabled={!newCrew.name || !newCrew.position} className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold">
              <SafeIcon icon={FiPlus} className="inline mr-2" /> Add Crew Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crew.map(member => (
              <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUsers} className="text-blue-400" />
                    </div>
                    <div>
                      <h6 className="font-bold text-white">{member.name}</h6>
                      <p className="text-sm text-gray-400">{member.position}</p>
                    </div>
                  </div>
                  <button onClick={() => removeResource('crew_fc2024', member.id, setCrew, crew)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                {member.contact && <p className="text-xs text-gray-500">{member.contact}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h5 className="text-lg font-bold text-white mb-4">Add Equipment</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                placeholder="Equipment Name *"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newEquipment.category}
                onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {EQUIPMENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                value={newEquipment.quantity}
                onChange={(e) => setNewEquipment({ ...newEquipment, quantity: parseInt(e.target.value) || 1 })}
                placeholder="Quantity"
                min="1"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button onClick={addEquipment} disabled={!newEquipment.name} className="w-full px-6 py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-2xl font-bold">
              <SafeIcon icon={FiPlus} className="inline mr-2" /> Add Equipment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiTool} className="text-green-400" />
                    </div>
                    <div>
                      <h6 className="font-bold text-white">{item.name}</h6>
                      {item.category && <p className="text-xs text-green-400 font-bold">{item.category}</p>}
                    </div>
                  </div>
                  <button onClick={() => removeResource('equipment_fc2024', item.id, setEquipment, equipment)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Props Tab */}
      {activeTab === 'props' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h5 className="text-lg font-bold text-white mb-4">Add Prop</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={newProp.name}
                onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                placeholder="Prop Name *"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={newProp.description}
                onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
                placeholder="Description"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                value={newProp.quantity}
                onChange={(e) => setNewProp({ ...newProp, quantity: parseInt(e.target.value) || 1 })}
                placeholder="Quantity"
                min="1"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button onClick={addProp} disabled={!newProp.name} className="w-full px-6 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-2xl font-bold">
              <SafeIcon icon={FiPlus} className="inline mr-2" /> Add Prop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {props.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiPackage} className="text-orange-400" />
                    </div>
                    <div>
                      <h6 className="font-bold text-white">{item.name}</h6>
                      {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => removeResource('props_fc2024', item.id, setProps, props)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h5 className="text-lg font-bold text-white mb-4">Add Vehicle</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                placeholder="Vehicle Name *"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                placeholder="Type (Car, Van, Truck, etc.)"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                value={newVehicle.notes}
                onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                placeholder="Notes"
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button onClick={addVehicle} disabled={!newVehicle.name} className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white rounded-2xl font-bold">
              <SafeIcon icon={FiPlus} className="inline mr-2" /> Add Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiBox} className="text-yellow-400" />
                    </div>
                    <div>
                      <h6 className="font-bold text-white">{item.name}</h6>
                      {item.type && <p className="text-xs text-gray-400">{item.type}</p>}
                    </div>
                  </div>
                  <button onClick={() => removeResource('vehicles_fc2024', item.id, setVehicles, vehicles)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
                {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesManager;