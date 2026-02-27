import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabase/supabase';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = { id: 'guest-user', email: 'guest@filmcraft.io' };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects_fc2024')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects_fc2024')
        .insert([{ ...projectData, phase: 'ideation', owner_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const { data, error } = await supabase
        .from('projects_fc2024')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();
      if (error) throw error;
      
      // Update local state immediately
      setProjects(prev => prev.map(p => p.id === projectId ? data : p));
      
      // Also reload to ensure consistency
      await loadProjects();
      
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects_fc2024')
        .delete()
        .eq('id', projectId);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const getProject = (projectId) => projects.find(p => p.id === projectId);

  const checkAccess = (project) => {
    if (!project) return false;
    if (!project.is_private) return true;
    
    // Check if access was granted via password in this session
    const accessGranted = localStorage.getItem(`access_${project.id}`);
    return accessGranted === 'granted';
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      user, 
      loading, 
      createProject, 
      updateProject, 
      deleteProject, 
      getProject, 
      loadProjects,
      checkAccess
    }}>
      {children}
    </ProjectContext.Provider>
  );
};