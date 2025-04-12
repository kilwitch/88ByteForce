
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, Mail, Phone, Building, MapPin, BadgeCheck, Clock, FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use actual user data or fallback to "Damid" if not available
  const [formData, setFormData] = useState({
    name: user?.name || "Damid",
    email: user?.email || "damid@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, San Francisco, CA 94105",
    company: "Bill AI Pro"
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast({
          title: "Image uploaded",
          description: "Your profile picture has been updated."
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-lightBlue bg-clip-text text-transparent">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
          <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 px-3 py-1">
            <BadgeCheck size={14} className="mr-1" /> Premium Account
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <Card className="md:col-span-1 border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-lightBlue text-white">
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription className="text-white/80">
                Upload your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-6 bg-white">
              <Avatar className="h-40 w-40 mb-6 ring-4 ring-brand-blue/20 ring-offset-2">
                <AvatarImage src={profileImage || ""} alt={formData.name} />
                <AvatarFallback className="bg-gradient-to-br from-brand-blue to-brand-lightBlue text-white text-4xl">
                  {formData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full">
                <Button className="w-full" variant="outline" onClick={triggerFileInput}>
                  <Upload size={16} className="mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Recommended: Square image, 500x500 pixels or larger
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Right Column - Profile Info */}
          <Card className="md:col-span-2 border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-blue/90 to-brand-lightBlue text-white">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription className="text-white/80">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-brand-blue font-medium">Full Name</Label>
                    <div className="relative">
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-500">
                        <BadgeCheck size={16} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-brand-blue font-medium">Email Address</Label>
                    <div className="relative">
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-500">
                        <Mail size={16} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-brand-blue font-medium">Phone Number</Label>
                    <div className="relative">
                      <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-500">
                        <Phone size={16} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-brand-blue font-medium">Company/Organization</Label>
                    <div className="relative">
                      <Input 
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-500">
                        <Building size={16} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-brand-blue font-medium">Address</Label>
                  <div className="relative">
                    <Input 
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-10 border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-500">
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    className="px-6 bg-gradient-to-r from-brand-blue to-brand-lightBlue hover:opacity-90"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Activity Section */}
          <Card className="md:col-span-3 border-none shadow-lg overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-brand-blue/80 to-brand-lightBlue/80 text-white">
              <CardTitle>Account Summary</CardTitle>
              <CardDescription className="text-white/80">
                Overview of your account activity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
                  <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-blue-200 rounded-full opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center mb-2 text-brand-blue font-medium">
                      <FileText size={18} className="mr-2" />
                      Total Bills Processed
                    </div>
                    <p className="text-3xl font-bold text-brand-blue">24</p>
                    <p className="text-xs text-brand-blue/70 mt-2 flex items-center">
                      <Clock size={12} className="mr-1" />
                      Last processed 2 days ago
                    </p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
                  <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-green-200 rounded-full opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center mb-2 text-green-700 font-medium">
                      <BadgeCheck size={18} className="mr-2" />
                      Total Saved
                    </div>
                    <p className="text-3xl font-bold text-green-700">₹8,320.45</p>
                    <p className="text-xs text-green-700/70 mt-2">Compared to average spending</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-200">
                  <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-purple-200 rounded-full opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center mb-2 text-purple-700 font-medium">
                      <BadgeCheck size={18} className="mr-2" />
                      Account Type
                    </div>
                    <p className="text-3xl font-bold text-purple-700">Premium</p>
                    <p className="text-xs text-purple-700/70 mt-2">Active until Apr 12, 2026</p>
                  </div>
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
