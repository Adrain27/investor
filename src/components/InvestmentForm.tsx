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
import { Shield, Lock } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
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
      const { data, error } = await supabase.functions.invoke('send-to-telegram', {
        body: values,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your information has been submitted successfully.",
      });
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
                  <FormLabel>Payment Method</FormLabel>
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
                    If not selected, returns will be sent via the same payment method you chose above.
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
    </div>
  );
}
