
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

// Category mapping based on common keywords
const categoryKeywordMap: Record<string, string[]> = {
  "Utilities": ["electric", "water", "gas", "utility", "energy", "power", "bill", "telecom", "internet", "phone", "broadband", "wifi"],
  "Office Supplies": ["office", "supplies", "paper", "ink", "toner", "printer", "stationery", "pen", "pencil", "marker", "notebook", "desk"],
  "Travel": ["travel", "hotel", "flight", "airline", "car rental", "taxi", "uber", "lyft", "train", "bus", "transportation", "lodging", "airbnb"],
  "Food & Dining": ["restaurant", "cafe", "coffee", "food", "meal", "lunch", "dinner", "breakfast", "grocery", "supermarket", "catering"],
  "Rent & Lease": ["rent", "lease", "property", "apartment", "office space", "building", "real estate", "storage", "parking"],
  "Insurance": ["insurance", "policy", "premium", "coverage", "health", "life", "auto", "car", "vehicle", "property", "liability"],
  "Services": ["service", "consulting", "freelance", "legal", "accounting", "maintenance", "cleaning", "repair", "subscription", "membership"],
};

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

  // Determine the most likely category based on the text content
  const guessCategoryFromText = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Count matches for each category
    const categoryCounts = Object.entries(categoryKeywordMap).map(([category, keywords]) => {
      const matchCount = keywords.reduce((count, keyword) => {
        return count + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      return { category, matchCount };
    });
    
    // Sort by match count, descending
    categoryCounts.sort((a, b) => b.matchCount - a.matchCount);
    
    // Return the category with the most matches, or "Others" if no matches
    return categoryCounts[0].matchCount > 0 ? categoryCounts[0].category : "Others";
  };
  
  const extractDataFromText = (text: string) => {
    console.log("Extracted text:", text);
    
    // Extract vendor name (usually in the first few lines, often the largest text or in a specific format)
    // Split text into lines and remove empty ones
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Vendor is often in the first 1-3 lines of the receipt
    // We'll take the first non-empty, non-numeric, substantial line (more than 2 characters)
    let vendorName = 'Unknown Vendor';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      // Skip lines that are dates, amounts, or too short
      if (line.length > 2 && 
          !line.match(/^\d+[\/\-\.]\d+[\/\-\.]\d+$/) && // Not a date
          !line.match(/^\$?\d+\.\d+$/) && // Not just an amount
          !line.match(/^[0-9\s]+$/)) { // Not just numbers
        vendorName = line;
        break;
      }
    }
    
    // Extract total amount - look for keywords that indicate a total
    // Common patterns: "Total: $X.XX", "Amount Due: $X.XX", "Grand Total: $X.XX", etc.
    // OR a row with a dollar sign near the bottom of the receipt
    const totalPatterns = [
      /(?:total|amount|sum|due|balance)(?:\s*:|\s+)\s*[$]?\s*(\d+[.,]\d+)/i,
      /(?:total|amount|sum|due)(?:\s*:|\s+)\s*[$]?\s*(\d+)/i,
      /(?:grand\s+total|total\s+amount)(?:\s*:|\s+)\s*[$]?\s*(\d+[.,]\d+)/i,
      /(?:total|amount|sum|due|balance)(?:\s+to\s+pay)(?:\s*:|\s+)\s*[$]?\s*(\d+[.,]\d+)/i,
      /\$\s*(\d+[.,]\d+)(?:\s*total)/i,
      /total\s+\$\s*(\d+[.,]\d+)/i,
      /final\s+(?:total|amount)(?:\s*:|\s+)\s*[$]?\s*(\d+[.,]\d+)/i,
      /(?:sub)?total\s*\$?\s*(\d+[.,]\d+)/i
    ];
    
    // Start with the last quarter of the text first for totals (they're usually at the bottom)
    const lowerHalfText = text.slice(text.length / 2);
    let amount = '';
    
    // Try each pattern until we find a match
    for (const pattern of totalPatterns) {
      // Try the lower half first for totals (they're usually at the bottom)
      let match = lowerHalfText.match(pattern);
      if (match && match[1]) {
        amount = match[1];
        break;
      }
      
      // If not found in lower half, try the full text
      match = text.match(pattern);
      if (match && match[1]) {
        amount = match[1];
        break;
      }
    }
    
    // If still not found, look for dollar amounts in the last few lines
    if (!amount) {
      // Get the last few lines where the total is likely to be
      const lastFewLines = lines.slice(-5);
      for (const line of lastFewLines) {
        const dollarMatch = line.match(/\$\s*(\d+[.,]\d+)/);
        if (dollarMatch && dollarMatch[1]) {
          amount = dollarMatch[1];
          break;
        }
      }
    }
    
    // Enhanced date extraction - look in the first 1/3 of the text which typically contains header info
    const topThirdText = text.slice(0, text.length / 3);
    
    const datePatterns = [
      /(?:date|issued|invoice date|bill date)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      /([A-Za-z]{3,9}\s+\d{1,2}(?:[,\s]+)?\d{2,4})/i,
      /(\d{1,2}\s+[A-Za-z]{3,9}(?:[,\s]+)?\d{2,4})/i
    ];
    
    let date = '';
    
    // Try each pattern in the top third first
    for (const pattern of datePatterns) {
      const match = topThirdText.match(pattern);
      if (match && match[1]) {
        date = match[1];
        break;
      }
    }
    
    // If not found in top third, check the entire text
    if (!date) {
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          date = match[1];
          break;
        }
      }
    }
    
    // If still no date is found, use current date as fallback
    if (!date) {
      const today = new Date();
      date = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Guess the category based on text content
    const guessedCategory = guessCategoryFromText(text);
    
    // Extract description (look for description, items, or memo fields)
    const descriptionPatterns = [
      /description[\s:]*([^\n]+)/i,
      /item[\s:]*([^\n]+)/i,
      /memo[\s:]*([^\n]+)/i,
      /note[\s:]*([^\n]+)/i,
      /remarks[\s:]*([^\n]+)/i,
      /details[\s:]*([^\n]+)/i
    ];
    
    let description = '';
    // Try each pattern until we find a match
    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }
    
    // If no description found, use a default or extract from middle of receipt
    if (!description) {
      // Extract something from the middle of the receipt as a fallback
      const middleIndex = Math.floor(lines.length / 2);
      if (lines[middleIndex] && lines[middleIndex].length > 3) {
        description = lines[middleIndex].trim();
      } else {
        description = 'Bill from ' + vendorName;
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
      category: guessedCategory,
      description
    };
  };
  
  const processBill = async () => {
    if (!imageFile) return;
    
    setIsScanning(true);
    
    try {
      // Use Tesseract.js for OCR processing with enhanced configuration
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { 
          logger: m => console.log(m),
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/:$%()- ',
          tessedit_pageseg_mode: '1' // Automatic page segmentation with OSD (orientation & script detection)
        }
      );
      
      const extractedText = result.data.text;
      const extractedData = extractDataFromText(extractedText);
      
      setBillData({
        ...billData,
        vendor: extractedData.vendor,
        amount: extractedData.amount,
        date: extractedData.date,
        category: extractedData.category,
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
          <Card className="bg-white shadow-md border border-gray-100">
            <CardHeader>
              <CardTitle className="text-brand-blue">Upload Bill Image</CardTitle>
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
                  min-h-[300px] bg-gray-50
                `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!imagePreview ? (
                  <div className="space-y-4">
                    <div className="bg-brand-blue/10 rounded-full p-4 inline-flex">
                      <Upload size={24} className="text-brand-blue" />
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
                    className="bg-brand-blue hover:bg-brand-blue/90"
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
          <Card className="bg-white shadow-md border border-gray-100">
            <CardHeader>
              <CardTitle className="text-brand-blue">Bill Information</CardTitle>
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
                    className="border-gray-300"
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
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      value={billData.date}
                      onChange={handleInputChange}
                      type="text"
                      disabled={!isProcessed && !imagePreview}
                      className="border-gray-300"
                      placeholder="MM/DD/YYYY"
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
                    <SelectTrigger id="category" className="border-gray-300">
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
                    className="border-gray-300"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!isProcessed}
                className="bg-brand-blue hover:bg-brand-blue/90"
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
