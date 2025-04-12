
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layouts/MainLayout';
import { Save, Bell, Moon, ShieldCheck, Globe, Palette, Mail } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use actual user data or fallback to "Damid" if not available
  const userName = user?.name || "Damid";
  const userEmail = user?.email || "damid@example.com";
  
  const [formState, setFormState] = useState({
    name: userName,
    email: userEmail,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'english',
    timezone: 'UTC-5'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully."
    });
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={userName} />
              <AvatarFallback className="bg-brand-blue text-white text-lg">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-lg">{userName}</div>
              <div className="text-sm text-muted-foreground">{userEmail}</div>
            </div>
          </div>
        </div>
        
        <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-100">Premium Account</Badge>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-4 bg-muted/20">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formState.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formState.email} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input 
                    id="language" 
                    name="language" 
                    value={formState.language} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone" 
                    name="timezone" 
                    value={formState.timezone} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    name="currentPassword" 
                    type="password"
                    value={formState.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    name="newPassword" 
                    type="password"
                    value={formState.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    name="confirmPassword" 
                    type="password"
                    value={formState.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Button onClick={handleSave} className="mt-4 bg-brand-blue hover:bg-brand-blue/90">
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive email about your account activity</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">Bill Due Reminders</p>
                      <p className="text-sm text-muted-foreground">Get notified before bills are due</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">New Feature Announcements</p>
                      <p className="text-sm text-muted-foreground">Stay updated with new features and improvements</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Button onClick={handleSave} className="mt-4 bg-brand-blue hover:bg-brand-blue/90">
                  <Save size={16} className="mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Moon className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Palette className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">Compact View</p>
                      <p className="text-sm text-muted-foreground">Display more items on screen</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <Button onClick={handleSave} className="mt-4 bg-brand-blue hover:bg-brand-blue/90">
                  <Save size={16} className="mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-brand-blue" />
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Button onClick={handleSave} className="mt-4 bg-brand-blue hover:bg-brand-blue/90">
                  <Save size={16} className="mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
