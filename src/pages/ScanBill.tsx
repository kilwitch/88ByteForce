
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScanEye, Upload, Camera, X, Check, FileUp, ImageIcon, Loader2, Send } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import * as Tesseract from 'tesseract.js';

// Bill data interface
interface BillData {
  vendor: string;
  amount: string;
  date: string;
  category: string;
  description: string;
}

const ScanBill = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [billData, setBillData] = useState<BillData>({
    vendor: '',
    amount: '',
    date: '',
    category: 'Utilities',
    description: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const categories = [
    "Utilities", 
    "Office Supplies", 
    "Travel", 
    "Services", 
    "Food & Dining", 
    "Rent & Lease", 
    "Insurance",
    "Others"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset states
      setIsProcessed(false);
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Reset states
      setIsProcessed(false);
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsProcessed(false);
    setBillData({
      vendor: '',
      amount: '',
      date: '',
      category: 'Utilities',
      description: ''
    });
  };
  
  const extractDataFromText = (text: string) => {
    console.log("Extracted text:", text);
    
    // Extract vendor (usually the first few lines contain business name)
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const vendorName = lines[0] || 'Unknown Vendor';
    
    // Enhanced amount extraction - look for common patterns indicating totals
    // Look for patterns like "Total: $X.XX", "Amount Due: $X.XX", "Balance: $X.XX", etc.
    const totalPatterns = [
      /total[\s:].*?(\d+[.,]\d+)/i,
      /amount\s*due[\s:].*?(\d+[.,]\d+)/i, 
      /balance[\s:].*?(\d+[.,]\d+)/i,
      /sum[\s:].*?(\d+[.,]\d+)/i,
      /due[\s:].*?(\d+[.,]\d+)/i,
      /(?:^|[\s])(\d+[.,]\d+)(?:\s*total)/i,
      /\$\s*(\d+[.,]\d+)/i,
      /(\d+[.,]\d+)(?:\s*\$)/i,
      /(?:^|[\s])(\d+[.,]\d+)(?:\s*$|[\s])/i // Fallback for standalone numbers
    ];
    
    let amount = '';
    // Try each pattern until we find a match
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        amount = match[1];
        break;
      }
    }
    
    // Enhanced date extraction - look for various date formats at the top of the document
    // Look in the first 10 lines which typically contain header info including dates
    const headerText = lines.slice(0, 10).join(' ');
    
    const datePatterns = [
      /(?:date|issued|invoice date|bill date)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      /([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})/i,
      /(\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{2,4})/i
    ];
    
    let date = '';
    // Try each pattern until we find a match
    for (const pattern of datePatterns) {
      const match = headerText.match(pattern);
      if (match && match[1]) {
        date = match[1];
        break;
      }
    }
    
    // If no date is found, use current date as fallback
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }
    
    // Extract description (look for description, items, or memo fields)
    const descriptionPatterns = [
      /description[\s:]*([^\n]+)/i,
      /item[\s:]*([^\n]+)/i,
      /memo[\s:]*([^\n]+)/i,
      /note[\s:]*([^\n]+)/i,
      /remarks[\s:]*([^\n]+)/i
    ];
    
    let description = 'Bill payment';
    // Try each pattern until we find a match
    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }
    
    // If description is too long, trim it
    if (description.length > 100) {
      description = description.substring(0, 97) + '...';
    }
    
    return {
      vendor: vendorName,
      amount,
      date,
      category: 'Utilities', // Default category
      description
    };
  };
  
  const processBill = async () => {
    if (!imageFile) return;
    
    setIsScanning(true);
    
    try {
      // Use Tesseract.js for OCR processing
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { logger: m => console.log(m) }
      );
      
      const extractedText = result.data.text;
      const extractedData = extractDataFromText(extractedText);
      
      setBillData({
        ...billData,
        vendor: extractedData.vendor,
        amount: extractedData.amount,
        date: extractedData.date,
        description: extractedData.description
      });
      
      setIsProcessed(true);
      
      toast({
        title: "Bill processed successfully",
        description: "We've extracted the information from your bill."
      });
    } catch (error) {
      console.error("OCR processing error:", error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your bill. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setBillData(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleSubmit = () => {
    // Validate the form
    if (!billData.vendor || !billData.amount || !billData.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would submit this data to your backend
    toast({
      title: "Bill saved successfully",
      description: "The bill data has been saved to your account."
    });
    
    // Navigate back to dashboard
    navigate('/bills');
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-blue mb-2">Scan Bill</h1>
        <p className="text-muted-foreground mb-8">Upload or scan a bill to extract information</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Upload/Scan Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Bill Image</CardTitle>
              <CardDescription>
                Upload a clear image of your bill for best results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center 
                  ${imagePreview ? 'border-primary' : 'border-gray-300'} 
                  hover:border-primary transition-colors
                  flex flex-col items-center justify-center
                  min-h-[300px]
                `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-full p-4 inline-flex">
                      <Upload size={24} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drag and drop or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports JPG, PNG and PDF
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={triggerFileInput}
                      className="mt-4"
                    >
                      <FileUp size={16} className="mr-2" />
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Bill preview" 
                      className="max-h-[300px] mx-auto object-contain rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {imagePreview && (
                <>
                  <Button variant="outline" onClick={clearImage}>
                    Clear
                  </Button>
                  <Button
                    onClick={processBill}
                    disabled={isScanning || isProcessed}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isProcessed ? (
                      <>
                        <Check size={16} className="mr-2" />
                        Processed
                      </>
                    ) : (
                      <>
                        <ScanEye size={16} className="mr-2" />
                        Process Bill
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
          
          {/* Right Column: Form */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
              <CardDescription>
                {isProcessed 
                  ? "Review and edit the extracted information" 
                  : "Upload a bill image to extract information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor/Business Name</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={billData.vendor}
                    onChange={handleInputChange}
                    placeholder={isProcessed ? "" : "Will be extracted from image"}
                    disabled={!isProcessed && !imagePreview}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      value={billData.amount}
                      onChange={handleInputChange}
                      type="text"
                      placeholder={isProcessed ? "" : "0.00"}
                      disabled={!isProcessed && !imagePreview}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      value={billData.date}
                      onChange={handleInputChange}
                      type="date"
                      disabled={!isProcessed && !imagePreview}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={billData.category} 
                    onValueChange={handleSelectChange}
                    disabled={!isProcessed && !imagePreview}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={billData.description}
                    onChange={handleInputChange}
                    placeholder="Additional notes"
                    disabled={!isProcessed && !imagePreview}
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!isProcessed}
              >
                <Send size={16} className="mr-2" />
                Save Bill
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ScanBill;
