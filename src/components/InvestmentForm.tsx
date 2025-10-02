import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Lock, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phoneNumber: z.string().trim().min(8, "Please enter a valid phone number with country code").max(20),
  country: z.string().min(1, "Please select a country"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  // Indian Bank Transfer fields
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  // UPI field
  upiId: z.string().optional(),
  // Crypto wallet (for all crypto payments)
  cryptoWallet: z.string().optional(),
  investmentReturnMethod: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => {
  // Validate bank details for Indian bank transfer
  if (data.country === "india" && data.paymentMethod === "bank_transfer") {
    return data.bankAccountName && data.bankAccountNumber && data.ifscCode;
  }
  return true;
}, {
  message: "Please provide all bank account details",
  path: ["bankAccountName"],
}).refine((data) => {
  // Validate UPI ID for Indian UPI payment
  if (data.country === "india" && data.paymentMethod === "upi") {
    return data.upiId && data.upiId.length > 0;
  }
  return true;
}, {
  message: "Please provide your UPI ID",
  path: ["upiId"],
}).refine((data) => {
  // Validate crypto wallet for crypto payments
  if (data.paymentMethod === "crypto") {
    return data.cryptoWallet && data.cryptoWallet.length > 0;
  }
  return true;
}, {
  message: "Please provide your crypto wallet address",
  path: ["cryptoWallet"],
});

export function InvestmentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [investorId, setInvestorId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      country: "",
      paymentMethod: "",
      bankAccountName: "",
      bankAccountNumber: "",
      ifscCode: "",
      upiId: "",
      cryptoWallet: "",
      investmentReturnMethod: "",
      agreedToTerms: false,
    },
  });

  const selectedCountry = form.watch("country");
  const selectedPaymentMethod = form.watch("paymentMethod");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Generate investor ID
      const generatedId = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase.functions.invoke('send-to-telegram', {
        body: { ...values, investorId: generatedId },
      });

      if (error) throw error;

      setInvestorId(generatedId);
      setShowSuccessDialog(true);
      form.reset();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyInvestorId = () => {
    if (investorId) {
      navigator.clipboard.writeText(investorId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Investment Form</h1>
        </div>
        <p className="text-muted-foreground">Fill out the form below to get started</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your information is secure and encrypted</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="+91 9876543210 or +1 2345678900" 
                    {...field} 
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground mt-1">
                  Please include country code (e.g., +91 for India, +1 for USA)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="other">Other Country</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCountry && (
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method Information</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedCountry === "india" ? (
                        <>
                          <SelectItem value="bank_transfer">Bank Transfer (IMPS)</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-amber-600 dark:text-amber-500 mt-1 font-medium">
                    Note: We are only collecting information. No payment will be collected here.
                  </p>
                  {selectedCountry === "other" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Other payment methods will be available soon. Currently only crypto is supported.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCountry === "india" && selectedPaymentMethod === "bank_transfer" && (
            <>
              <FormField
                control={form.control}
                name="bankAccountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account holder name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter IFSC code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {selectedCountry === "india" && selectedPaymentMethod === "upi" && (
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your UPI ID (e.g., name@upi)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedPaymentMethod === "crypto" && (
            <FormField
              control={form.control}
              name="cryptoWallet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crypto Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your wallet address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedPaymentMethod && (
            <FormField
              control={form.control}
              name="investmentReturnMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Return Payment Method (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select return method (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedCountry === "india" ? (
                        <>
                          <SelectItem value="bank_transfer">Bank Transfer (IMPS)</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          <SelectItem value="same">Same as Payment Method</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          <SelectItem value="same">Same as Payment Method</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can fill this here or send the details via chat later. If not selected, returns will be sent via the same payment method you chose above.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="agreedToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I agree to the terms and conditions
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you agree to our terms of service and privacy policy.
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>🔒 All data is transmitted securely and encrypted</p>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Form Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Your investor form has been completed. Please copy or take a screenshot of your Investor ID for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center justify-between rounded-md border p-3 bg-muted">
                <code className="text-sm font-mono font-semibold">{investorId}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyInvestorId}
                  className="h-8 w-8 p-0"
                >
                  {copiedId ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Save this ID - you'll need it to track your investment.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
