
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import { useCycleData } from '@/contexts/CycleContext';
import { format } from 'date-fns';

const SettingsPage = () => {
  const { userData, resetData } = useCycleData();
  
  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">App Name</Label>
              <p>Blossom & Bloom</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Version</Label>
              <p>1.0.0</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Data Update</Label>
              <p>{format(new Date(userData.lastUpdated), 'MMM d, yyyy h:mm a')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="predictions">Show Cycle Predictions</Label>
              <Switch id="predictions" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reminders">Period Reminders</Label>
              <Switch id="reminders" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your cycle data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Your cycle data is stored locally on your device. You can reset all data if needed.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Reset All Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your cycle data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetData}>
                    Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Blossom & Bloom helps you track your menstrual cycle, predict upcoming periods, 
              and track symptoms over time. This app stores data locally on your device.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 Blossom & Bloom
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
