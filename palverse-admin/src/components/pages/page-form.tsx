"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StaticPage, CreatePageRequest } from "@/types/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  slug: z.string()
    .min(1, "مطلوب")
    .max(180, "يجب ألا يتجاوز 180 حرف")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط"),
  title_ar: z.string().min(1, "مطلوب").max(255),
  title_en: z.string().max(255).optional().nullable(),
  content_ar: z.string().min(1, "مطلوب"),
  content_en: z.string().optional().nullable(),
  excerpt_ar: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  is_published: z.boolean().default(false),
  sort_order: z.number().min(0).default(0),
  seo_title_ar: z.string().max(255).optional().nullable(),
  seo_title_en: z.string().max(255).optional().nullable(),
  seo_description_ar: z.string().max(1000).optional().nullable(),
  seo_description_en: z.string().max(1000).optional().nullable(),
});

export type PageFormValues = z.infer<typeof formSchema>;

interface PageFormProps {
  initialData?: StaticPage | null;
  onSubmit: (data: CreatePageRequest) => Promise<boolean>;
  isMutating: boolean;
  apiError?: { message: string; errors?: Record<string, string[]> } | null;
}

export function PageForm({ initialData, onSubmit, isMutating, apiError }: PageFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ar");

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: initialData?.slug || "",
      title_ar: initialData?.title_ar || "",
      title_en: initialData?.title_en || "",
      content_ar: initialData?.content_ar || "",
      content_en: initialData?.content_en || "",
      excerpt_ar: initialData?.excerpt_ar || "",
      excerpt_en: initialData?.excerpt_en || "",
      is_published: initialData?.is_published || false,
      sort_order: initialData?.sort_order || 0,
      seo_title_ar: initialData?.seo_title_ar || "",
      seo_title_en: initialData?.seo_title_en || "",
      seo_description_ar: initialData?.seo_description_ar || "",
      seo_description_en: initialData?.seo_description_en || "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (values: any) => {
    // Convert empty strings to null for optional fields
    const payload = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    ) as unknown as CreatePageRequest;
    
    // Explicitly cast to match contract
    const success = await onSubmit(payload);
    if (success) {
      router.push("/pages");
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرابط (Slug) *</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" className="text-left font-mono" placeholder="e.g. privacy-policy" />
                </FormControl>
                <FormDescription>يجب أن يكون فريداً وباللغة الإنجليزية (يستخدم في الرابط)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="title_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الصفحة *</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="content_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى الصفحة *</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={12} className="font-mono text-base resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="excerpt_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مقتطف قصير (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="seo_title_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان SEO</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="seo_description_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف SEO</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="p-6 space-y-6 mt-0">
            <FormField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="title_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="content_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={12} dir="ltr" className="text-left font-mono text-base resize-y" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="excerpt_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Excerpt</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} dir="ltr" className="text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="seo_title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="seo_description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} rows={2} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <FormField
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            control={form.control as any}
            name="is_published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">نشر الصفحة</FormLabel>
                  <p className="text-sm text-slate-500">
                    عند التفعيل، ستكون الصفحة مرئية للعامة على المنصة.
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
            {isMutating ? "جاري الحفظ..." : "حفظ الصفحة"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
