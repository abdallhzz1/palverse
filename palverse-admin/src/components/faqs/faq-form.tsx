"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Faq, CreateFaqRequest } from "@/types/faqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  question_ar: z.string().min(1, "مطلوب").max(500),
  question_en: z.string().max(500).optional().nullable(),
  answer_ar: z.string().min(1, "مطلوب"),
  answer_en: z.string().optional().nullable(),
  category: z.string().max(150).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().min(0).default(0),
});

export type FaqFormValues = z.infer<typeof formSchema>;

interface FaqFormProps {
  initialData?: Faq | null;
  onSubmit: (data: CreateFaqRequest) => Promise<boolean>;
  isMutating: boolean;
  apiError?: { message: string; errors?: Record<string, string[]> } | null;
}

export function FaqForm({ initialData, onSubmit, isMutating, apiError }: FaqFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ar");

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_ar: initialData?.question_ar || "",
      question_en: initialData?.question_en || "",
      answer_ar: initialData?.answer_ar || "",
      answer_en: initialData?.answer_en || "",
      category: initialData?.category || "",
      is_active: initialData?.is_active ?? true,
      sort_order: initialData?.sort_order || 0,
    },
  });

  const handleSubmit = async (values: any) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    ) as unknown as CreateFaqRequest;
    
    const success = await onSubmit(payload);
    if (success) {
      router.push("/faqs");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        
        {apiError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
            <p className="font-semibold mb-1">{apiError.message}</p>
            {apiError.errors && (
              <ul className="list-disc list-inside">
                {Object.values(apiError.errors).flat().map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200">
          <FormField
            control={form.control as any}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التصنيف</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="مثال: الحسابات، الدفع..." />
                </FormControl>
                <FormDescription>تصنيف اختياري لتجميع الأسئلة المشابهة</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الترتيب</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                  />
                </FormControl>
                <FormDescription>الترتيب في قوائم العرض (رقم صحيح)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 pt-4">
            <TabsList className="bg-slate-200/50">
              <TabsTrigger value="ar" className="data-[state=active]:bg-white data-[state=active]:text-[#0F3D2E]">العربية</TabsTrigger>
              <TabsTrigger value="en" className="data-[state=active]:bg-white data-[state=active]:text-[#0F3D2E]">English</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ar" className="p-6 space-y-6 mt-0">
            <FormField
              control={form.control as any}
              name="question_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السؤال *</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="answer_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الإجابة *</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={6} className="resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="en" className="p-6 space-y-6 mt-0">
            <FormField
              control={form.control as any}
              name="question_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="answer_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={6} dir="ltr" className="text-left resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <FormField
            control={form.control as any}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">تفعيل السؤال</FormLabel>
                  <p className="text-sm text-slate-500">
                    عند التفعيل، سيكون السؤال والإجابة مرئيين للعامة.
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()} 
            disabled={isMutating}
            className="flex-1 sm:flex-none border-slate-300"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            رجوع
          </Button>
          <Button 
            type="submit" 
            disabled={isMutating} 
            className="flex-1 sm:flex-none bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 min-w-[150px]"
          >
            <Check className="ml-2 h-4 w-4" />
            {isMutating ? "جاري الحفظ..." : "حفظ السؤال"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
