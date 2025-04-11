
import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Activity } from 'lucide-react';

const Home = () => {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
        <div className="max-w-md w-full space-y-6">
          <h1 className="text-4xl font-bold text-primary">
            Her Cycle Diary
          </h1>
          
          <p className="text-muted-foreground text-lg">
            Your personal companion for tracking and understanding your menstrual health
          </p>
          
          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="flex flex-col items-center">
              <Calendar className="w-10 h-10 text-primary mb-2" />
              <span>Track Cycles</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-10 h-10 text-rose-500 mb-2" />
              <span>Monitor Health</span>
            </div>
            <div className="flex flex-col items-center">
              <Activity className="w-10 h-10 text-green-500 mb-2" />
              <span>Understand Patterns</span>
            </div>
          </div>
          
          <Button size="lg" className="w-full">
            Get Started
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Empower yourself with knowledge about your body
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
