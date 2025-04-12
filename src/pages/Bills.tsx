
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Download, Filter } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

const Bills = () => {
  // Sample bill data
  const bills = [
    { id: '1', vendor: 'Electric Company Inc.', amount: '$142.50', date: '2023-04-05', category: 'Utilities' },
    { id: '2', vendor: 'Water Services Ltd.', amount: '$78.25', date: '2023-04-10', category: 'Utilities' },
    { id: '3', vendor: 'Office Supplies Co.', amount: '$235.40', date: '2023-04-15', category: 'Office Supplies' },
    { id: '4', vendor: 'Internet Provider', amount: '$89.99', date: '2023-04-18', category: 'Services' },
    { id: '5', vendor: 'Business Insurance', amount: '$350.00', date: '2023-04-22', category: 'Insurance' },
  ];

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
                      <Button variant="ghost" size="sm">
                        <FileText size={16} />
                        <span className="ml-2">View</span>
                      </Button>
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
