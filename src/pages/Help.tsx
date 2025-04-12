
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle, MessageSquare, FileText, Mail } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

const Help = () => {
  const faqs = [
    {
      question: "How do I scan a bill?",
      answer: "To scan a bill, navigate to the 'Scan' page, then either upload an image file or take a photo of your bill. Our AI will automatically extract key information like the vendor, amount, and date. You can review and edit this information before saving it to your account."
    },
    {
      question: "What file formats are supported for bill uploads?",
      answer: "We support common image formats including JPG, PNG, and PDF files. For best results, ensure the bill image is clear, well-lit, and shows all important information."
    },
    {
      question: "How accurate is the bill scanning feature?",
      answer: "Our AI scanning technology typically achieves high accuracy, but results may vary based on image quality and bill layout. Always review the extracted information before saving to ensure accuracy."
    },
    {
      question: "Can I edit the extracted bill information?",
      answer: "Yes, after scanning a bill, you can review and edit any information before saving. This allows you to correct any details that may not have been accurately extracted."
    },
    {
      question: "How do I generate reports?",
      answer: "Navigate to the 'Reports' section where you can generate various reports based on your bill data. You can filter by date range, category, or vendor to get insights into your spending patterns."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. All your data is encrypted both in transit and at rest. We use industry-standard security practices to protect your information."
    },
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-blue mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-6">Find answers to common questions and get support</p>
        
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search for help topics..." 
            className="pl-10"
          />
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FileText size={32} className="text-brand-blue mb-4" />
              <h3 className="font-medium mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground">Browse detailed guides and documentation</p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <MessageSquare size={32} className="text-brand-blue mb-4" />
              <h3 className="font-medium mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Talk to our support team in real-time</p>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Mail size={32} className="text-brand-blue mb-4" />
              <h3 className="font-medium mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground">Send us a message and we'll respond quickly</p>
            </CardContent>
          </Card>
        </div>
        
        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle size={20} />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about using Bill AI Pro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Contact Form */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Send us a message and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Email Address" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Input placeholder="Subject" />
              </div>
              <div className="space-y-2">
                <textarea 
                  placeholder="Your Message" 
                  className="w-full min-h-[150px] p-3 border rounded-md"
                ></textarea>
              </div>
              <Button>Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Help;
