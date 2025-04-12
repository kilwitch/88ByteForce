
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Filter, X } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

interface Bill {
  id: string;
  vendor: string;
  amount: string;
  date: string;
  category: string;
  description?: string;
  image?: string;
}

const Bills = () => {
  // Sample bill data
  const bills: Bill[] = [
    { 
      id: '1', 
      vendor: 'Electric Company Inc.', 
      amount: '$142.50', 
      date: '2023-04-05', 
      category: 'Utilities',
      description: 'Monthly electricity service for office space'
    },
    { 
      id: '2', 
      vendor: 'Water Services Ltd.', 
      amount: '$78.25', 
      date: '2023-04-10', 
      category: 'Utilities',
      description: 'Quarterly water bill'
    },
    { 
      id: '3', 
      vendor: 'Office Supplies Co.', 
      amount: '$235.40', 
      date: '2023-04-15', 
      category: 'Office Supplies',
      description: 'Paper, pens, and other office supplies'
    },
    { 
      id: '4', 
      vendor: 'Internet Provider', 
      amount: '$89.99', 
      date: '2023-04-18', 
      category: 'Services',
      description: 'Monthly internet and phone service'
    },
    { 
      id: '5', 
      vendor: 'Business Insurance', 
      amount: '$350.00', 
      date: '2023-04-22', 
      category: 'Insurance',
      description: 'Quarterly business liability insurance'
    },
  ];

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brand-blue">Bills</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
            <CardDescription>
              Manage and track your recent bill uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.vendor}</TableCell>
                    <TableCell>{bill.amount}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.category}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedBill(bill)}
                          >
                            <FileText size={16} />
                            <span className="ml-2">View</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Bill Details</DialogTitle>
                            <DialogDescription>
                              View complete information about this bill
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 mt-4">
                            {selectedBill && (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                                    <p className="font-medium">{selectedBill.vendor}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                    <p className="font-medium">{selectedBill.amount}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="font-medium">{selectedBill.date}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                                    <p className="font-medium">{selectedBill.category}</p>
                                  </div>
                                </div>
                                
                                {selectedBill.description && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="font-medium">{selectedBill.description}</p>
                                  </div>
                                )}
                                
                                {selectedBill.image && (
                                  <div className="mt-4">
                                    <p className="text-sm font-medium text-muted-foreground">Bill Image</p>
                                    <div className="mt-2 border rounded-md p-2">
                                      <img 
                                        src={selectedBill.image} 
                                        alt="Bill" 
                                        className="w-full object-contain max-h-[200px]" 
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Bills;
