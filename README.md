
# Her Cycle Diary

A comprehensive menstrual cycle tracking application that helps users monitor their periods, symptoms, and reproductive health.

![Her Cycle Diary](https://raw.githubusercontent.com/your-username/her-cycle-diary/main/public/placeholder.svg)

## Features

- **Period Tracking**: Log and track your menstrual cycles with ease
- **Symptom Monitoring**: Record symptoms, moods, and flow levels throughout your cycle
- **Predictions**: Get accurate predictions for future periods, fertile windows, and ovulation dates
- **Calendar View**: Visualize your cycle data in an intuitive calendar interface
- **Statistics**: View insights about your cycle patterns and health trends
- **Notes**: Add personal notes for each day of your cycle
- **Secure**: Your data is stored securely and privately

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **State Management**: React Context API, TanStack Query
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/her-cycle-diary.git
cd her-cycle-diary
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server
```bash
npm run dev
```

## Supabase Setup

### Database Schema

To use this application, you need to set up the following tables in your Supabase database:

#### 1. profiles

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  average_cycle_length INTEGER DEFAULT 28,
  average_period_length INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### 2. cycles

```sql
CREATE TABLE cycles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  period_length INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cycles"
  ON cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycles"
  ON cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycles"
  ON cycles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycles"
  ON cycles FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3. cycle_days

```sql
CREATE TABLE cycle_days (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cycle_id UUID REFERENCES cycles NOT NULL,
  date DATE NOT NULL,
  menstruation BOOLEAN DEFAULT false,
  flow TEXT,
  symptoms TEXT[] DEFAULT '{}',
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cycle_days ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cycle days"
  ON cycle_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle days"
  ON cycle_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle days"
  ON cycle_days FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycle days"
  ON cycle_days FOR DELETE
  USING (auth.uid() = user_id);
```

### Setting up Authentication

1. Go to the Authentication section in your Supabase dashboard
2. Enable Email/Password authentication
3. Configure any additional settings like email templates or redirects

### Database Triggers (Optional)

You can add the following trigger to automatically set the updated_at timestamp:

```sql
-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_cycles_timestamp
BEFORE UPDATE ON cycles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_cycle_days_timestamp
BEFORE UPDATE ON cycle_days
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
```

## Application Structure

- `/src/components` - UI components
- `/src/contexts` - React context providers 
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/services` - API services
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)

