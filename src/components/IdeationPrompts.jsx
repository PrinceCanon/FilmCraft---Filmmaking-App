import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHelpCircle, FiRefreshCw, FiCheck, FiChevronDown, FiChevronUp } = FiIcons;

const IdeationPrompts = ({ step = 0, data = {}, onDataUpdate }) => {
  const [activePrompt, setActivePrompt] = useState(null);

  const prompts = {
    0: {
      title: 'Project Basics',
      questions: [
        {
          id: 'title',
          label: 'Project Title',
          type: 'text',
          placeholder: 'Enter your project title...',
          prompt: 'What would you like to call your video project?'
        },
        {
          id: 'type',
          label: 'Video Type',
          type: 'select',
          options: ['Vlog', 'Tutorial', 'Review', 'Travel', 'Food', 'Lifestyle', 'Business', 'Educational', 'Entertainment', 'Documentary'],
          prompt: 'What type of video are you creating?'
        },
        {
          id: 'duration',
          label: 'Target Duration',
          type: 'select',
          options: ['30 seconds - 1 minute', '1-3 minutes', '3-5 minutes', '5-10 minutes', '10-15 minutes', '15+ minutes'],
          prompt: 'How long should your video be?'
        }
      ]
    },
    1: {
      title: 'Concept Development',
      questions: [
        {
          id: 'concept',
          label: 'Core Concept',
          type: 'textarea',
          placeholder: 'Describe your video concept in detail...',
          prompt: 'What is the main idea or story you want to tell?'
        },
        {
          id: 'key_message',
          label: 'Key Message',
          type: 'textarea',
          placeholder: 'What do you want viewers to take away...',
          prompt: 'What is the one key message you want your audience to remember?'
        },
        {
          id: 'unique_angle',
          label: 'Unique Angle',
          type: 'textarea',
          placeholder: 'What makes your approach different...',
          prompt: 'What makes your video unique? What\'s your special perspective?'
        }
      ]
    },
    2: {
      title: 'Audience & Tone',
      questions: [
        {
          id: 'target_audience',
          label: 'Target Audience',
          type: 'textarea',
          placeholder: 'Describe your ideal viewer...',
          prompt: 'Who is your ideal viewer? What are their interests, age, and preferences?'
        },
        {
          id: 'tone',
          label: 'Tone & Style',
          type: 'select',
          options: ['Casual & Friendly', 'Professional & Informative', 'Energetic & Fun', 'Calm & Relaxing', 'Inspiring & Motivational', 'Humorous & Entertaining', 'Serious & Educational', 'Personal & Intimate'],
          prompt: 'What tone and style best fits your content and audience?'
        },
        {
          id: 'inspiration',
          label: 'Inspiration',
          type: 'textarea',
          placeholder: 'What inspired this video idea...',
          prompt: 'What inspired this video? Any creators or content you admire?'
        }
      ]
    }
  };

  const currentPrompts = prompts[step] || prompts[0];

  const handleInputChange = (id, value) => {
    onDataUpdate({ [id]: value });
  };

  const getRandomSuggestion = (id) => {
    const suggestions = {
      concept: [
        'A "Day in the Life" of a filmmaker using only mobile tools',
        'Exploring hidden gems in my hometown with cinematic transitions',
        'How to start a creative business in 2024 from scratch',
        'The science behind why we love watching storytelling videos'
      ],
      key_message: [
        'Consistency is more important than perfection',
        'Great stories are everywhere if you know where to look',
        'You don\'t need expensive gear to start creating',
        'True creativity comes from working within limitations'
      ],
      target_audience: [
        'Aspiring creators aged 18-25 looking for practical gear tips',
        'Busy professionals interested in productivity and minimalist lifestyle',
        'Tech enthusiasts who appreciate high production value and technical details',
        'A general audience that loves wholesome, travel-based storytelling'
      ]
    };

    const list = suggestions[id] || ['Think outside the box for this one...'];
    return list[Math.floor(Math.random() * list.length)];
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <SafeIcon icon={FiHelpCircle} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{currentPrompts.title}</h2>
        </div>

        <div className="space-y-8">
          {currentPrompts.questions.map((question, index) => (
            <motion.div
              key={question.id}
              className="space-y-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">
                  {question.label}
                </label>
                <button
                  onClick={() => setActivePrompt(activePrompt === question.id ? null : question.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all text-xs font-bold ${activePrompt === question.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
                >
                  <SafeIcon icon={activePrompt === question.id ? FiChevronUp : FiChevronDown} />
                  <span>Guide</span>
                </button>
              </div>

              <AnimatePresence>
                {activePrompt === question.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-3xl mb-4">
                      <p className="text-purple-300 text-sm leading-relaxed mb-4">{question.prompt}</p>
                      <button
                        onClick={() => handleInputChange(question.id, getRandomSuggestion(question.id))}
                        className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <SafeIcon icon={FiRefreshCw} />
                        <span>Use Suggestion</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {question.type === 'text' && (
                <input
                  type="text"
                  value={data[question.id] || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              )}

              {question.type === 'textarea' && (
                <textarea
                  value={data[question.id] || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  rows={4}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              )}

              {question.type === 'select' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {question.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange(question.id, option)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${data[question.id] === option ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeationPrompts;