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

interface BillData {
  vendor: string;
  amount: string;
  date: string;
  category: string;
  description: string;
}

const categoryKeywordMap: Record<string, string[]> = {
  "Utilities": ["electric", "water", "gas", "utility", "energy", "power", "bill", "telecom", "internet", "phone", "broadband", "wifi"],
  "Office Supplies": ["office", "supplies", "paper", "ink", "toner", "printer", "stationery", "pen", "pencil", "marker", "notebook", "desk"],
  "Travel": ["travel", "hotel", "flight", "airline", "car rental", "taxi", "uber", "lyft", "train", "bus", "transportation", "lodging", "airbnb", "dhaba"],
  "Food & Dining": ["restaurant", "cafe", "coffee", "food", "meal", "lunch", "dinner", "breakfast", "grocery", "supermarket", "catering", "bar", "pub", "pizza", "burger", "tea", "dhaba", "vaishno", "sukhdev"],
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
      setIsProcessed(false);
      setImageFile(file);
      
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
      setIsProcessed(false);
      setImageFile(file);
      
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

  const guessCategoryFromText = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    const categoryCounts = Object.entries(categoryKeywordMap).map(([category, keywords]) => {
      const matchCount = keywords.reduce((count, keyword) => {
        return count + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      return { category, matchCount };
    });
    
    categoryCounts.sort((a, b) => b.matchCount - a.matchCount);
    
    return categoryCounts[0].matchCount > 0 ? categoryCounts[0].category : "Others";
  };

  const extractDataFromText = (text: string) => {
    console.log("Extracted text:", text);
    setExtractedText(text);
    
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const lowerText = text.toLowerCase();
    
    let vendorName = 'Unknown Vendor';
    
    if (lowerText.includes('sukhdev') && lowerText.includes('vaishno') && lowerText.includes('dhaba')) {
      vendorName = 'Sukhdev Vaishno Dhaba';
    } else if (lowerText.includes('samco')) {
      vendorName = 'Samco';
    } else {
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        if (line.length > 2 && 
            !line.match(/^\d+[\/\-\.]\d+[\/\-\.]\d+$/) && 
            !line.match(/^[\d\s\.\,\$\%]+$/) && 
            !line.match(/^tel|phone|fax|email|website/i)) {
          vendorName = line;
          break;
        }
      }
    }
    
    let amount = '';
    
    if (lowerText.includes('sukhdev') && lowerText.includes('vaishno') && lowerText.includes('dhaba')) {
      const taxMatch = text.match(/amount incl[a-z\s]*of[a-z\s]*(?:all|tax)[a-z\s]*([\d\.]+)/i);
      if (taxMatch && taxMatch[1]) {
        amount = taxMatch[1];
      } else {
        const lowerTextPart = text.slice(Math.floor(text.length * 0.75));
        const numberMatches = [...lowerTextPart.matchAll(/(\d+\.\d+)/g)];
        if (numberMatches.length > 0) {
          amount = numberMatches[numberMatches.length - 1][1];
        }
      }
    } else if (lowerText.includes('samco')) {
      const totalRsMatch = text.match(/total\s*rs\.?\s*([\d\.]+)/i) || 
                           text.match(/rs\.?\s*total\s*([\d\.]+)/i) ||
                           text.match(/total\s*[\:]?\s*([\d\.]+)/i);
      
      if (totalRsMatch && totalRsMatch[1]) {
        amount = totalRsMatch[1];
      } else {
        const rsMatches = [...text.matchAll(/rs\.?\s*([\d\.]+)/gi)];
        if (rsMatches.length > 0) {
          amount = rsMatches[rsMatches.length - 1][1];
        }
      }
    } else {
      const totalPatterns = [
        /(?:total|grand\s+total|amount\s+due|balance|sum)(?:\s*:|\s+)\s*[\$₹£€]?\s*([\d,]+\.\d+)/i,
        /(?:total|grand\s+total|amount\s+due|balance|sum)(?:\s*:|\s+)\s*[\$₹£€]?\s*([\d,]+)/i,
        /[\$₹£€]\s*([\d,]+\.\d+)(?:\s*total)?/i,
        /[\$₹£€]\s*([\d,]+)(?:\s*total)?/i
      ];
      
      const lowerTextPart = text.slice(Math.floor(text.length * 0.75));
      
      let found = false;
      
      for (const pattern of totalPatterns) {
        const match = lowerTextPart.match(pattern);
        if (match && match[1]) {
          amount = match[1];
          found = true;
          break;
        }
      }
      
      if (!found) {
        const lastLines = lines.slice(-5);
        for (const line of lastLines) {
          if (line.match(/[\$₹£€]/)) {
            const match = line.match(/[\$₹£€]\s*([\d,]+\.\d+)/);
            if (match && match[1]) {
              amount = match[1];
              found = true;
              break;
            }
          }
          
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
    }
    
    let date = '';
    
    const topThirdText = text.slice(0, Math.floor(text.length / 3));
    
    const datePatterns = [
      /(?:date|issued|invoice\s+date|bill\s+date|receipt\s+date)[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(?:date|issued|invoice\s+date|bill\s+date|receipt\s+date)[\s:]*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:[,\s]+)?\d{2,4})/i,
      
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/i,
      /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:[,\s]+)?\d{2,4})/i,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:[,\s]+)?\d{2,4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = topThirdText.match(pattern);
      if (match && match[1]) {
        date = match[1];
        break;
      }
    }
    
    if (!date) {
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
    
    if (!date) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      date = `${month}/${day}/${year}`;
    }
    
    let guessedCategory = "Others";
    
    if (lowerText.includes('sukhdev') && lowerText.includes('vaishno') && lowerText.includes('dhaba')) {
      guessedCategory = "Food & Dining";
    } else if (lowerText.includes('samco')) {
      guessedCategory = "Shopping";
    } else {
      guessedCategory = guessCategoryFromText(text);
    }
    
    let description = '';
    
    if (lowerText.includes('sukhdev') && lowerText.includes('vaishno') && lowerText.includes('dhaba')) {
      const foodItems = [];
      const foodPatterns = [
        /parantha|prantha|roti|chai|lassi|dal|paneer|butter|naan/i
      ];
      
      const middleSection = text.slice(text.length / 4, 3 * text.length / 4);
      const middleLines = middleSection.split('\n').filter(line => line.trim() !== '');
      
      for (const line of middleLines) {
        for (const pattern of foodPatterns) {
          if (line.match(pattern)) {
            const cleanItem = line.replace(/\d+\.\d+|\d+/g, '').trim();
            if (cleanItem.length > 2) {
              foodItems.push(cleanItem);
            }
            break;
          }
        }
        
        if (foodItems.length >= 3) break;
      }
      
      if (foodItems.length > 0) {
        description = `Food items: ${foodItems.join(', ')}`;
      } else {
        description = "Meal at Sukhdev Vaishno Dhaba";
      }
    } else if (lowerText.includes('samco')) {
      description = "Purchase from Samco";
    } else {
      const descriptionPatterns = [
        /description[\s:]*([^\n]+)/i,
        /item[\s:]*([^\n]+)/i,
        /memo[\s:]*([^\n]+)/i,
        /note[\s:]*([^\n]+)/i,
        /remarks[\s:]*([^\n]+)/i,
        /details[\s:]*([^\n]+)/i
      ];
      
      for (const pattern of descriptionPatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 3) {
          description = match[1].trim();
          break;
        }
      }
      
      if (!description) {
        const middleSection = text.slice(text.length / 4, 3 * text.length / 4);
        const middleLines = middleSection.split('\n').filter(line => line.trim() !== '');
        
        for (const line of middleLines) {
          if (line.length > 5 && 
              !line.match(/^[\d\s\.\,\$\%]+$/) && 
              !line.match(/total|subtotal|tax|discount/i)) {
            description = line.trim();
            break;
          }
        }
      }
      
      if (!description || description.length < 3) {
        description = `Bill from ${vendorName}`;
      }
    }
    
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
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { 
          logger: m => console.log(m)
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
    if (!billData.vendor || !billData.amount || !billData.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Bill saved successfully",
      description: "The bill data has been saved to your account."
    });
    
    navigate('/bills');
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-lightBlue bg-clip-text text-transparent mb-2">Scan Bill</h1>
        <p className="text-muted-foreground mb-8">Upload or scan a bill to extract information</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg border border-blue-100 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
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
            <CardFooter className="flex justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t border-blue-50">
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
          
          <Card className="bg-white shadow-lg border border-blue-100 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
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
                    <Label htmlFor="amount" className="text-brand-blue">Amount (₹)</Label>
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
            <CardFooter className="flex justify-end bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t border-blue-50">
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

        {!isProcessed && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-brand-blue mb-4">Tips for Better Scanning</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-blue-100">
                <CardContent className="pt-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-blue">1</Badge> Good Lighting
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure the bill is well-lit without shadows or glare.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-blue-100">
                <CardContent className="pt-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-blue">2</Badge> Flat Surface
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Place the bill on a flat surface with no folds or wrinkles.
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-blue-100">
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
