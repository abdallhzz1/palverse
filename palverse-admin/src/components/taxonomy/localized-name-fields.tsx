import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocalizedNameFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: FieldErrors<any>;
  disabled?: boolean;
  isEnglishOptional?: boolean;
}

export function LocalizedNameFields({ register, errors, disabled = false, isEnglishOptional = true }: LocalizedNameFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="name_ar" className="flex items-center gap-1">
          الاسم بالعربية
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name_ar"
          dir="rtl"
          placeholder="أدخل الاسم بالعربية"
          {...register("name_ar")}
          className={errors.name_ar ? "border-red-500" : ""}
          disabled={disabled}
        />
        {errors.name_ar && (
          <p className="text-sm text-red-500 mt-1">{errors.name_ar.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name_en" className="flex items-center gap-1">
          الاسم بالإنجليزية
          {isEnglishOptional ? (
            <span className="text-xs text-slate-400 font-normal mr-1">(اختياري)</span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </Label>
        <Input
          id="name_en"
          dir="ltr"
          placeholder="Enter name in English"
          {...register("name_en")}
          className={errors.name_en ? "border-red-500 text-left" : "text-left"}
          disabled={disabled}
        />
        {errors.name_en && (
          <p className="text-sm text-red-500 mt-1 text-left">{errors.name_en.message as string}</p>
        )}
      </div>
    </div>
  );
}
