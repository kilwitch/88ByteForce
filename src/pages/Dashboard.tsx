
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, FileText, Upload, Printer, Settings, LogOut, HelpCircle, Plus, Filter, ScanEye } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import { useToast } from '@/components/ui/use-toast';

// Mock data for charts
const monthlyData = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 900 },
  { name: 'Mar', total: 1600 },
  { name: 'Apr', total: 1300 },
  { name: 'May', total: 1900 },
  { name: 'Jun', total: 2000 },
];

const categoryData = [
  { name: 'Utilities', value: 400 },
  { name: 'Office Supplies', value: 300 },
  { name: 'Travel', value: 500 },
  { name: 'Services', value: 200 },
  { name: 'Others', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Mock recent bills data
const recentBills = [
  { id: 1, vendor: 'Electricity Co.', amount: 142.50, date: '2023-04-05', category: 'Utilities', status: 'Processed' },
  { id: 2, vendor: 'Office Depot', amount: 78.25, date: '2023-04-03', category: 'Office Supplies', status: 'Pending' },
  { id: 3, vendor: 'Water Services', amount: 65.00, date: '2023-04-01', category: 'Utilities', status: 'Processed' },
  { id: 4, vendor: 'Internet Provider', amount: 89.99, date: '2023-03-28', category: 'Utilities', status: 'Processed' },
  { id: 5, vendor: 'Courier Service', amount: 42.30, date: '2023-03-25', category: 'Services', status: 'Pending' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const handleScanBill = () => {
    navigate('/scan');
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-blue">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <Button onClick={handleScanBill} className="flex items-center gap-2">
            <ScanEye size={18} />
            Scan New Bill
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">24</div>
                <div className="text-sm text-green-500 flex items-center">
                  <ArrowUpRight size={16} />
                  <span>12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">$2,450.85</div>
                <div className="text-sm text-green-500 flex items-center">
                  <ArrowUpRight size={16} />
                  <span>8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm text-red-500 flex items-center">
                  <ArrowUpRight size={16} className="rotate-45" />
                  <span>3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Your spending over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Total']} />
                      <Bar dataKey="total" fill="#0A2540" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bill Categories</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest bill processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBills.slice(0, 3).map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary p-2 rounded-md">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="font-medium">{bill.vendor}</p>
                            <p className="text-sm text-muted-foreground">{bill.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${bill.amount.toFixed(2)}</p>
                          <p className={`text-xs ${bill.status === 'Processed' ? 'text-green-500' : 'text-amber-500'}`}>
                            {bill.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="link" className="w-full" onClick={() => setActiveTab("bills")}>
                    View All Bills
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="bills">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Bills</CardTitle>
                  <CardDescription>Manage and view all your bills</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Bill
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {recentBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium">{bill.vendor}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {bill.date}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {bill.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            ${bill.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span 
                              className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                                bill.status === 'Processed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <Button variant="ghost" size="sm" onClick={() => 
                              toast({
                                title: "Viewing bill details",
                                description: `Viewing details for ${bill.vendor}`,
                              })
                            }>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown by expense category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
