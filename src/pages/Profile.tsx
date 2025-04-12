
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use actual user data or fallback to "Damid" if not available
  const [formData, setFormData] = useState({
    name: user?.name || "Damid",
    email: user?.email || "damid@example.com",
    phone: "",
    address: "",
    company: "Bill AI Pro"
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    });
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-blue mb-2">My Profile</h1>
        <p className="text-muted-foreground mb-6">Manage your personal information and preferences</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload or change your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-36 w-36 mb-4">
                <AvatarImage src="" alt={formData.name} />
                <AvatarFallback className="bg-brand-blue text-white text-4xl">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Button className="w-full mb-2" variant="outline">
                <Camera size={16} className="mr-2" />
                Upload New Picture
              </Button>
              <Button className="w-full" variant="outline" color="destructive">
                Remove Picture
              </Button>
            </CardContent>
          </Card>
          
          {/* Right Column - Profile Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Organization</Label>
                    <Input 
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="w-full md:w-auto">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Activity Section */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>
                Overview of your account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <h3 className="font-semibold text-brand-blue">Total Bills Processed</h3>
                  <p className="text-2xl font-bold mt-2">24</p>
                </div>
                
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <h3 className="font-semibold text-green-700">Total Saved</h3>
                  <p className="text-2xl font-bold mt-2">$320.45</p>
                </div>
                
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <h3 className="font-semibold text-purple-700">Account Type</h3>
                  <p className="text-2xl font-bold mt-2">Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
