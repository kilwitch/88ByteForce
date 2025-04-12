
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
import { Badge } from '@/components/ui/badge';

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
  "Food & Dining": ["restaurant", "cafe", "coffee", "food", "meal", "lunch", "dinner", "breakfast", "grocery", "supermarket", "catering", "bar", "pub", "pizza", "burger", "tea"],
  "Rent & Lease": ["rent", "lease", "property", "apartment", "office space", "building", "real estate", "storage", "parking"],
  "Insurance": ["insurance", "policy", "premium", "coverage", "health", "life", "auto", "car", "vehicle", "property", "liability"],
  "Services": ["service", "consulting", "freelance", "legal", "accounting", "maintenance", "cleaning", "repair", "subscription", "membership", "salon", "spa", "wellness"],
  "Shopping": ["mall", "retail", "store", "shop", "purchase", "buy", "clothing", "apparel", "fashion", "shoes", "electronics", "gadget", "samco", "market"]
};

const ScanBill = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
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
    "Food & Dining", 
    "Shopping",
    "Rent & Lease", 
    "Insurance",
    "Services",
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
    setExtractedText('');
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
    setExtractedText(text);
    
    // Split text into lines and remove empty ones
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // IMPROVED VENDOR EXTRACTION
    // Usually vendor name appears in the first few lines of the bill, often in larger font
    let vendorName = 'Unknown Vendor';
    // Try first 3 lines that are not just numbers or symbols
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 2 && 
          !line.match(/^\d+[\/\-\.]\d+[\/\-\.]\d+$/) && // Not a date
          !line.match(/^[\d\s\.\,\$\%]+$/) && // Not just numbers/symbols
          !line.match(/^tel|phone|fax|email|website/i)) { // Not contact info
        vendorName = line;
        break;
      }
    }
    
    // IMPROVED AMOUNT EXTRACTION
    // We want the final/total amount which is usually at the bottom of the receipt
    // and often has keywords like "total", "amount due", "balance", etc.
    
    // Start with the most reliable patterns for totals
    const totalPatterns = [
      // Patterns with "total" keyword
      /(?:total|grand\s+total|amount\s+due|balance|sum)(?:\s*:|\s+)\s*[\$₹£€]?\s*([\d,]+\.\d+)/i,
      /(?:total|grand\s+total|amount\s+due|balance|sum)(?:\s*:|\s+)\s*[\$₹£€]?\s*([\d,]+)/i,
      // Pattern for "$XXX.XX" format near the bottom
      /[\$₹£€]\s*([\d,]+\.\d+)(?:\s*total)?/i,
      /[\$₹£€]\s*([\d,]+)(?:\s*total)?/i,
      // Look for numbers with decimal points in the bottom part
      /([\d,]+\.\d+)/,
      // Last resort, just numbers
      /([\d,]+)/
    ];
    
    // Get the last quarter of the text where totals are usually found
    const lowerText = text.slice(Math.floor(text.length * 0.75));
    const lowerLines = lowerText.split('\n').filter(line => line.trim() !== '');
    
    let amount = '';
    let found = false;
    
    // First try looking for "total" keywords in the last quarter
    for (const pattern of totalPatterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        amount = match[1];
        found = true;
        break;
      }
    }
    
    // If not found yet, try looking at the last few lines
    if (!found) {
      // Look at the last 5 lines
      const lastLines = lines.slice(-5);
      for (const line of lastLines) {
        // Look for lines with currency symbols first
        if (line.match(/[\$₹£€]/)) {
          const match = line.match(/[\$₹£€]\s*([\d,]+\.\d+)/);
          if (match && match[1]) {
            amount = match[1];
            found = true;
            break;
          }
        }
        
        // Then look for numbers with decimals
        if (!found) {
          const match = line.match(/([\d,]+\.\d+)/);
          if (match && match[1]) {
            amount = match[1];
            found = true;
            break;
          }
        }
      }
    }
    
    // IMPROVED DATE EXTRACTION
    // Dates are typically at the top portion of the bill
    // Try multiple date formats (MM/DD/YYYY, DD/MM/YYYY, YYYY/MM/DD, Month DD YYYY, etc.)
    
    const topThirdText = text.slice(0, Math.floor(text.length / 3));
    const topLines = topThirdText.split('\n').filter(line => line.trim() !== '');
    
    const datePatterns = [
      // Explicit date labels
      /(?:date|issued|invoice\s+date|bill\s+date|receipt\s+date)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(?:date|issued|invoice\s+date|bill\s+date|receipt\s+date)[\s:]*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:[,\s]+)?\d{2,4})/i,
      
      // Common date formats
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,  // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,    // YYYY/MM/DD
      /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:[,\s]+)?\d{2,4})/i,  // Month DD, YYYY
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:[,\s]+)?\d{2,4})/i,  // DD Month YYYY
    ];
    
    let date = '';
    
    // First look in the top third of the bill - most likely place for dates
    for (const pattern of datePatterns) {
      const match = topThirdText.match(pattern);
      if (match && match[1]) {
        date = match[1];
        break;
      }
    }
    
    // If not found in top third, check specific lines that often contain dates
    if (!date) {
      // Check first few lines
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        for (const pattern of datePatterns) {
          const match = lines[i].match(pattern);
          if (match && match[1]) {
            date = match[1];
            break;
          }
        }
        if (date) break;
      }
    }
    
    // If still no date is found, use current date as fallback
    if (!date) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
      const year = today.getFullYear();
      date = `${month}/${day}/${year}`;
    }
    
    // IMPROVED CATEGORY DETECTION
    // Use enhanced keyword matching for more accurate categorization
    const guessedCategory = guessCategoryFromText(text);
    
    // IMPROVED DESCRIPTION EXTRACTION
    let description = '';
    
    // Look for description fields or item names
    const descriptionPatterns = [
      /description[\s:]*([^\n]+)/i,
      /item[\s:]*([^\n]+)/i,
      /memo[\s:]*([^\n]+)/i,
      /note[\s:]*([^\n]+)/i,
      /remarks[\s:]*([^\n]+)/i,
      /details[\s:]*([^\n]+)/i
    ];
    
    // Try pattern matching first
    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 3) {
        description = match[1].trim();
        break;
      }
    }
    
    // If no description found, extract from items section if present
    if (!description) {
      // Look for items in the middle section of the receipt
      const middleSection = text.slice(text.length / 4, 3 * text.length / 4);
      const middleLines = middleSection.split('\n').filter(line => line.trim() !== '');
      
      // Try to find a line that looks like an item (not too short, not just numbers)
      for (const line of middleLines) {
        if (line.length > 5 && 
            !line.match(/^[\d\s\.\,\$\%]+$/) && 
            !line.match(/total|subtotal|tax|discount/i)) {
          description = line.trim();
          break;
        }
      }
    }
    
    // If still no description, use a generic one with the vendor name
    if (!description || description.length < 3) {
      description = `Bill from ${vendorName}`;
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
      // Fix: Use only the supported Tesseract worker options
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { 
          logger: m => console.log(m)
          // Removed problematic options that caused build errors
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
        <h1 className="text-3xl font-bold text-gradient-to-r from-brand-blue to-brand-lightBlue mb-2">Scan Bill</h1>
        <p className="text-muted-foreground mb-8">Upload or scan a bill to extract information</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Upload/Scan Area */}
          <Card className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-brand-blue flex items-center gap-2">
                <ScanEye className="w-5 h-5" />
                Upload Bill Image
              </CardTitle>
              <CardDescription>
                Upload a clear image of your bill for best results
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center 
                  ${imagePreview ? 'border-brand-lightBlue bg-blue-50' : 'border-gray-300 bg-gray-50'} 
                  hover:border-brand-lightBlue transition-colors
                  flex flex-col items-center justify-center
                  min-h-[300px]
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
                      className="mt-4 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
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
                      className="max-h-[300px] mx-auto object-contain rounded-lg shadow-md"
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
            <CardFooter className="flex justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-4">
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
          <Card className="bg-white shadow-lg border border-gray-100 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-brand-blue flex items-center gap-2">
                <FileUp className="w-5 h-5" />
                Bill Information
              </CardTitle>
              <CardDescription>
                {isProcessed 
                  ? "Review and edit the extracted information" 
                  : "Upload a bill image to extract information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor" className="text-brand-blue">Vendor/Business Name</Label>
                  <Input
                    id="vendor"
                    name="vendor"
                    value={billData.vendor}
                    onChange={handleInputChange}
                    placeholder={isProcessed ? "" : "Will be extracted from image"}
                    disabled={!isProcessed && !imagePreview}
                    className="border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-brand-blue">Amount ($)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      value={billData.amount}
                      onChange={handleInputChange}
                      type="text"
                      placeholder={isProcessed ? "" : "0.00"}
                      disabled={!isProcessed && !imagePreview}
                      className="border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-brand-blue">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      value={billData.date}
                      onChange={handleInputChange}
                      type="text"
                      disabled={!isProcessed && !imagePreview}
                      className="border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-brand-blue">Category</Label>
                  <Select 
                    value={billData.category} 
                    onValueChange={handleSelectChange}
                    disabled={!isProcessed && !imagePreview}
                  >
                    <SelectTrigger id="category" className="border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue">
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
                  <Label htmlFor="description" className="text-brand-blue">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={billData.description}
                    onChange={handleInputChange}
                    placeholder="Additional notes"
                    disabled={!isProcessed && !imagePreview}
                    className="border-gray-300 focus:border-brand-lightBlue focus:ring-brand-lightBlue"
                  />
                </div>

                {isProcessed && extractedText && (
                  <div className="mt-4">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-brand-blue transition-colors">
                        View extracted raw text
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                        {extractedText}
                      </div>
                    </details>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex justify-end bg-gradient-to-r from-gray-50 to-blue-50 p-4">
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

        {/* Tips Section */}
        {!isProcessed && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-brand-blue mb-4">Tips for Better Scanning</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-blue">1</Badge> Good Lighting
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure the bill is well-lit without shadows or glare.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-blue">2</Badge> Flat Surface
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Place the bill on a flat surface with no folds or wrinkles.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-blue">3</Badge> Full Frame
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Make sure the entire bill is visible within the frame.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ScanBill;
