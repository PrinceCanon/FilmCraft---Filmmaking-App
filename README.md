# 🎬 FilmCraft Creative Studio

**A comprehensive film production management platform for independent filmmakers, production teams, and creative studios.**

FilmCraft Creative Studio is a web-based application that guides film projects through every stage of production—from initial concept to final delivery. Built with React, Supabase, and Tailwind CSS, it provides an intuitive, collaborative workspace for managing scripts, schedules, resources, and post-production workflows.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Production Phases](#production-phases)
- [Key Components](#key-components)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Contributing](#contributing)

---

## 🎯 Overview

FilmCraft Creative Studio is designed to streamline the entire filmmaking process by organizing production workflows into distinct phases:

1. **Ideation** - Develop concepts, characters, and story structure
2. **Planning** - Build scripts, manage resources, and create production schedules
3. **Shooting** - Track shoot days, manage call sheets, and monitor shot progress
4. **Post-Production** - Manage editing milestones and delivery deadlines

The platform supports both **private** (password-protected) and **public** projects, enabling teams to collaborate in real-time with integrated chat functionality.

---

## ✨ Features

### 🎨 **Ideation Phase**
- **Story Structure Builder**: Create acts, sequences, and beats using traditional story frameworks
- **Character Development**: Define characters with detailed profiles, arcs, and relationships
- **Visual Mood Boards**: Upload reference images to establish the project's visual direction
- **Project Settings**: Configure privacy, genres, themes, and collaboration options

### 📝 **Planning Phase**
- **Script Manager**: Import `.docx` scripts with automatic scene detection and parsing
- **Shot List Builder**: Plan shots with camera angles, movements, lenses, and equipment
- **Resources Manager**: Organize cast, crew, equipment, props, and vehicles
- **Production Scheduler**: Schedule prep, shooting, and post-production activities with date ranges

### 🎥 **Shooting Phase**
- **Shoot Day Overview**: View current day's schedule with assigned resources
- **Call Sheet View**: See cast, crew, equipment, props, and vehicles for each shoot day
- **Shot Progress Tracking**: Mark shots as pending, in progress, or completed
- **Real-time Collaboration**: Chat with team members during production

### 🎞️ **Post-Production Phase**
- **Milestone Tracking**: Monitor editing, color grading, sound design, and VFX progress
- **Deadline Management**: View date ranges and completion status for all post-production tasks
- **Progress Dashboard**: At-a-glance view of overall project completion
- **Status Updates**: Mark milestones as pending, in progress, or completed

### 🤝 **Collaboration Features**
- **Real-time Chat**: Project-specific messaging with read status tracking
- **Guest Access**: Password-protected private projects with session-based access control
- **Multi-user Support**: Designed for producers, directors, crew, and editors
- **Breadcrumb Navigation**: Easy phase switching with visual progress indicators

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18.2** - Component-based UI framework
- **React Router DOM 6.22** - Client-side routing and navigation
- **Framer Motion 11.0** - Animation and transitions
- **Tailwind CSS 3.4** - Utility-first styling
- **React Icons 5.0** - Icon library

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **@supabase/supabase-js 2.39** - Supabase client library

### **Utilities**
- **Mammoth.js 1.6** - `.docx` script import and parsing
- **Lucide React 0.344** - Additional icon set
- **clsx & tailwind-merge** - Conditional class name utilities

### **Build Tools**
- **Vite 5.1** - Fast development server and build tool
- **ESLint 8.56** - Code linting
- **PostCSS & Autoprefixer** - CSS processing

---

## 📁 Project Structure

```
filmcraft-creative-studio/
├── src/
│   ├── pages/                    # Main route pages
│   │   ├── Dashboard.jsx         # Project list and creation
│   │   ├── Ideation.jsx          # Concept development phase
│   │   ├── Planning.jsx          # Pre-production planning phase
│   │   ├── Shooting.jsx          # Production tracking phase
│   │   ├── PostProduction.jsx    # Post-production tracking phase
│   │   └── JoinProject.jsx       # Password access for private projects
│   │
│   ├── components/               # Reusable components
│   │   ├── IdeationPrompts.jsx   # Story structure & character tools
│   │   ├── PlanningPrompts.jsx   # Script, shots, resources, schedule tabs
│   │   ├── ShootingPrompts.jsx   # Shoot day management
│   │   ├── ScriptManager.jsx     # Script import and scene management
│   │   ├── ShotListBuilder.jsx   # Shot planning interface
│   │   ├── ResourcesManager.jsx  # Cast, crew, equipment, props, vehicles
│   │   ├── ProductionScheduler.jsx # Calendar and timeline scheduler
│   │   ├── ProjectCard.jsx       # Dashboard project cards
│   │   ├── ProjectBreadcrumb.jsx # Phase navigation breadcrumb
│   │   ├── ProjectChat.jsx       # Real-time messaging
│   │   ├── ProjectSettings.jsx   # Project configuration
│   │   └── ... (see full list below)
│   │
│   ├── context/
│   │   └── ProjectContext.jsx    # Global state management for projects
│   │
│   ├── common/
│   │   └── SafeIcon.jsx          # Icon wrapper component
│   │
│   ├── lib/
│   │   └── supabase.js           # Supabase client configuration
│   │
│   ├── supabase/
│   │   ├── supabase.js           # Supabase connection (duplicate)
│   │   └── migrations/           # Database schema migrations
│   │
│   ├── App.jsx                   # Main app component with routing
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
│
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # This file
```

---

## 🎬 Production Phases

### **1. Ideation Phase**
**Purpose**: Develop the creative foundation of your film project.

**Key Activities**:
- Define story structure (acts, sequences, beats)
- Create character profiles and arcs
- Establish visual direction with mood boards
- Configure project settings (title, genre, privacy)

**Navigation**: Once concept is ready, click **"Lock Concept & Start Planning"** to move to Planning phase.

---

### **2. Planning Phase**
**Purpose**: Transform concepts into actionable production plans.

**Tabs**:
1. **Script**: Import `.docx` scripts, view/edit scenes
2. **Shot List**: Plan camera angles, movements, lenses, equipment
3. **Resources**: Manage cast, crew, equipment, props, vehicles
4. **Schedule**: Create timeline for prep, shooting, and post-production

**Key Features**:
- Auto-populate character roles from script for cast members
- Link resources to specific shoot days in the schedule
- Support date ranges for multi-day activities
- Select scenes to shoot for each scheduled day

**Navigation**: When planning is complete, click **"Finalize Plan & Start Production"** to enter Shooting phase.

---

### **3. Shooting Phase**
**Purpose**: Execute the production plan and track daily progress.

**Interface**:
- **Left Sidebar**: Calendar view of all shoot days
- **Main Panel**: Selected day's call sheet with:
  - Date, time, location, weather dependency
  - Assigned cast, crew, equipment, props, vehicles
  - Shot list with progress tracking (pending/in progress/completed)

**Workflow**:
1. Select a shoot day from the sidebar
2. Review call sheet and resources
3. Mark shots as complete as you film them
4. Track overall production progress

**Navigation**: When all shooting is wrapped, click **"Wrap Production & Go to Post"** to move to Post-Production phase.

---

### **4. Post-Production Phase**
**Purpose**: Track editing, finishing, and delivery milestones.

**Interface**:
- **Progress Overview**: Total milestones, completed count, percentage
- **Timeline View**: All post-production tasks with deadlines and status
- **Quick Actions**: Mark milestones complete or undo completion

**Post-Production Milestones** (predefined):
- Assembly Edit
- Rough Cut
- Fine Cut
- Picture Lock
- Sound Design
- Sound Mix
- Color Grading
- VFX
- Music Composition
- Final Mix
- Mastering
- Delivery

**Note**: Post-production tasks are **scheduled in Planning → Schedule** (select "Post-Production" type). The Post-Production phase is for **viewing and tracking** only.

**Navigation**: When project is finished, click **"Complete Project"** to mark it as completed.

---

## 🧩 Key Components

### **Core Pages**
| Component | Purpose |
|-----------|---------|
| `Dashboard.jsx` | Project list, creation, and access management |
| `Ideation.jsx` | Story structure, characters, mood boards |
| `Planning.jsx` | Script, shots, resources, scheduling |
| `Shooting.jsx` | Shoot day tracking and shot progress |
| `PostProduction.jsx` | Milestone tracking and completion |
| `JoinProject.jsx` | Password authentication for private projects |

### **Planning Components**
| Component | Purpose |
|-----------|---------|
| `ScriptManager.jsx` | Import `.docx`, view/edit scenes |
| `ShotListBuilder.jsx` | Plan shots with camera/lens details |
| `ResourcesManager.jsx` | Manage cast, crew, equipment, props, vehicles |
| `ProductionScheduler.jsx` | Calendar/timeline scheduler with resource linking |

### **Ideation Components**
| Component | Purpose |
|-----------|---------|
| `StoryStructureBuilder.jsx` | Create acts, sequences, beats |
| `IdeationPrompts.jsx` | Tab navigation for ideation phase |

### **Shared Components**
| Component | Purpose |
|-----------|---------|
| `ProjectBreadcrumb.jsx` | Phase navigation with visual progress |
| `ProjectChat.jsx` | Real-time messaging sidebar |
| `ProjectCard.jsx` | Dashboard project display cards |
| `ProjectSettings.jsx` | Project configuration modal |
| `SafeIcon.jsx` | Safe icon rendering wrapper |

---

## 🗄️ Database Schema

### **Core Tables**

#### **projects_fc2024**
Stores all project metadata.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Project name |
| `phase` | TEXT | Current phase (ideation/planning/shooting/post-production/completed) |
| `owner_id` | TEXT | Creator user ID |
| `is_private` | BOOLEAN | Privacy setting |
| `password` | TEXT | Access password (if private) |
| `genre` | TEXT | Film genre |
| `logline` | TEXT | One-sentence summary |
| `synopsis` | TEXT | Full story summary |
| `target_audience` | TEXT | Intended audience |
| `visual_references` | JSONB | Mood board image URLs |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last modified date |

#### **production_schedule_fc2024**
Stores all scheduled activities (prep, shooting, post-production).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `title` | TEXT | Activity name |
| `type` | TEXT | Activity type (prep/shoot/post) |
| `date` | DATE | Start date |
| `end_date` | DATE | End date (optional, for date ranges) |
| `start_time` | TIME | Start time (for shoot days) |
| `end_time` | TIME | End time (for shoot days) |
| `location` | TEXT | Filming location |
| `scenes_to_shoot` | INTEGER[] | Array of scene numbers |
| `cast_needed` | UUID[] | Array of cast member IDs |
| `crew_needed` | UUID[] | Array of crew member IDs |
| `equipment_needed` | UUID[] | Array of equipment IDs |
| `props_needed` | UUID[] | Array of prop IDs |
| `vehicles_needed` | UUID[] | Array of vehicle IDs |
| `notes` | TEXT | Additional information |
| `weather_consideration` | BOOLEAN | Weather-dependent flag |
| `completion_status` | TEXT | Status (pending/in_progress/completed) |
| `milestone_type` | TEXT | Post-production milestone name |

#### **scenes_fc2024**
Stores script scenes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `scene_number` | INTEGER | Scene number |
| `title` | TEXT | Scene heading |
| `description` | TEXT | Scene content |
| `location` | TEXT | Scene location |
| `time_of_day` | TEXT | INT/EXT, DAY/NIGHT |

#### **shots_fc2024**
Stores shot list.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `scene_id` | UUID | Foreign key to scenes |
| `shot_number` | TEXT | Shot identifier (e.g., "1A") |
| `description` | TEXT | Shot description |
| `shot_type` | TEXT | Shot size (ECU, CU, MS, etc.) |
| `angle` | TEXT | Camera angle (Eye Level, High, Low, etc.) |
| `movement` | TEXT | Camera movement (Static, Pan, Tilt, etc.) |
| `lens` | TEXT | Lens choice (Wide, Normal, Telephoto) |
| `equipment` | TEXT[] | Required equipment |
| `duration` | INTEGER | Estimated duration in seconds |
| `notes` | TEXT | Additional shot notes |
| `status` | TEXT | Completion status (pending/in_progress/completed) |

#### **Resource Tables**
- **cast_fc2024**: Actor name, character role, contact
- **crew_fc2024**: Crew name, position, contact
- **equipment_fc2024**: Equipment name, category, quantity
- **props_fc2024**: Prop name, description
- **vehicles_fc2024**: Vehicle name, type, description

#### **chat_messages_fc2024**
Stores project chat messages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `user_id` | TEXT | Sender user ID |
| `user_name` | TEXT | Sender display name |
| `message` | TEXT | Message content |
| `created_at` | TIMESTAMP | Send time |

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ and npm/yarn
- Supabase account and project

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/filmcraft-creative-studio.git
   cd filmcraft-creative-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Update `src/supabase/supabase.js` with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co'
   const SUPABASE_ANON_KEY = 'your-anon-key'
   ```

4. **Run database migrations**
   
   In your Supabase dashboard SQL editor, run all migration files from `src/supabase/migrations/` in chronological order.

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to `http://localhost:5173`

---

## 📖 Usage Guide

### **Creating a Project**
1. Go to Dashboard (`/`)
2. Click **"+ Create New Project"**
3. Enter project title
4. Choose privacy setting (public/private with password)
5. Click **"Create Project"**
6. You'll be redirected to Ideation phase

### **Ideation Phase Workflow**
1. **Story Structure**: Add acts → sequences → beats
2. **Characters**: Create character profiles with arcs
3. **Mood Board**: Upload visual references
4. **Settings**: Configure genre, logline, synopsis
5. Click **"Lock Concept & Start Planning"**

### **Planning Phase Workflow**
1. **Script Tab**: Import `.docx` script or create scenes manually
2. **Shot List Tab**: Plan shots for each scene
3. **Resources Tab**: Add cast, crew, equipment, props, vehicles
4. **Schedule Tab**: Create schedule items:
   - **Prep**: Pre-production activities
   - **Shoot**: Filming days (link scenes and resources)
   - **Post-Production**: Editing milestones with deadlines
5. Click **"Finalize Plan & Start Production"**

### **Shooting Phase Workflow**
1. Select shoot day from sidebar calendar
2. Review call sheet (resources, scenes, shots)
3. Mark shots as completed during filming
4. Use chat for team communication
5. Click **"Wrap Production & Go to Post"** when done

### **Post-Production Phase Workflow**
1. View all post-production milestones
2. Mark milestones complete as you finish them
3. Track overall progress percentage
4. Add new milestones via **Planning → Schedule**
5. Click **"Complete Project"** when finished

### **Accessing Private Projects**
1. Click on a private project card
2. Enter the project password
3. Click **"Access Project"**
4. Access is stored in session (localStorage)

---

## 🔧 Development

### **Available Scripts**

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Key Development Notes**

1. **State Management**: All project data is managed via `ProjectContext.jsx`
2. **Database Access**: All queries use `src/supabase/supabase.js` client
3. **Routing**: Uses React Router with phase-based URLs
4. **Styling**: Tailwind CSS with custom dark theme
5. **Icons**: Use `SafeIcon.jsx` wrapper for all react-icons

### **Adding New Features**

**To add a new resource type**:
1. Create migration in `src/supabase/migrations/`
2. Add table with `project_id` foreign key and RLS policies
3. Update `ResourcesManager.jsx` to include new tab
4. Add resource linking in `ProductionScheduler.jsx`

**To add a new production phase**:
1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Update `ProjectBreadcrumb.jsx` phase configuration
4. Add phase transition buttons in previous/next phases

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Code Style**
- Use functional React components with hooks
- Follow existing Tailwind CSS patterns
- Use Framer Motion for animations
- Ensure all database queries have error handling
- Add comments for complex logic

### **Testing Checklist**
- [ ] All phases navigate correctly
- [ ] Database operations succeed
- [ ] Private project access works
- [ ] Real-time chat updates
- [ ] Resource linking in scheduler
- [ ] Shot progress tracking
- [ ] Milestone completion tracking

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library
- **React Icons** - Icon library
- **Mammoth.js** - Document parsing

---

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact: support@filmcraft.io (example)

---

**Built with ❤️ for filmmakers by filmmakers** 🎬✨