# تحديث Palverse بعد الإطلاق (Checklist ثابت)

استخدم هذا الدليل **لكل تحديث مستقبلي**.  
الوضع الحالي:

| الجزء | أين يستضيف | الرابط |
|------|------------|--------|
| API | cPanel | `https://api.alfajrhealth.com` |
| الموقع | Vercel | `https://palverse-ivory.vercel.app` |
| الأدمن | Vercel | `https://palverse-asn5.vercel.app` |

مسار الكود على السيرفر:
```text
/home/alfajrhe/repositories/palverse
```
مجلد الـ API:
```text
/home/alfajrhe/repositories/palverse/palverse-api
```
Document Root العام:
```text
/home/alfajrhe/public_html/api
```

---

## القاعدة الذهبية

1. عدّل محلياً → اختبر.
2. **Commit + Push** على GitHub (`master`).
3. حدّث الجزء المتأثر فقط:
   - تغيّر Laravel → حدّث **cPanel**
   - تغيّر admin → **Redeploy** مشروع الأدمن على Vercel
   - تغيّر web → **Redeploy** مشروع الموقع على Vercel
4. إذا التعديل API + واجهة: نفّذ **الاثنين**.

بدون Push على GitHub، السيرفر وVercel ما بيشوفوا التحديث.

---

## أ) من جهازك (دائماً أولاً)

```bash
# من مجلد المشروع
git status
git add .
git commit -m "وصف مختصر للتعديل"
git push origin master
```

تأكد إن الدفع نجح على:
`https://github.com/abdallhzz1/palverse`

---

## ب) تحديث الـ API على cPanel

من **Terminal / SSH** في cPanel:

```bash
cd ~/repositories/palverse
git pull origin master

cd ~/repositories/palverse/palverse-api

# إذا في حزم PHP جديدة (composer.lock تغيّر)
php composer.phar install --no-dev --optimize-autoloader

# إذا في migrations جديدة
php artisan migrate --force

# امسح الكاش دائماً بعد سحب تحديثات .env أو config
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

### ملاحظات مهمة لبيئتكم

1. **الصور**: التخزين يجب يبقى على مجلد الويب الحقيقي:
   ```env
   FILESYSTEM_DISK=public
   FILESYSTEM_PUBLIC_PATH=/home/alfajrhe/public_html/api/storage
   APP_URL=https://api.alfajrhealth.com
   ```
2. إذا `public_html/api` فيه ملفات `public` منسوخة قديماً (مثل `index.php` / `.htaccess`) وتغيّرت بالكود، انسخها من جديد:
   ```bash
   cp ~/repositories/palverse/palverse-api/public/index.php ~/public_html/api/index.php
   cp ~/repositories/palverse/palverse-api/public/.htaccess ~/public_html/api/.htaccess
   ```
   (لا تمسح مجلد `storage` داخل `public_html/api`.)
3. فحص سريع بعد التحديث:
   - `https://api.alfajrhealth.com/up`
   - `https://api.alfajrhealth.com/api/v1/health`
   - `https://api.alfajrhealth.com/api/v1/ready`

---

## ج) تحديث الموقع أو الأدمن على Vercel

### إذا المشروع مربوط بـ GitHub (موصى به)
1. بعد `git push`، Vercel غالباً يعمل Deploy تلقائي.
2. افتح Vercel → المشروع → **Deployments** وتأكد آخر Deploy = Commit الجديد وناجح (Ready).

### إذا ما في Deploy تلقائي
1. Vercel → المشروع (`palverse-web` أو `palverse-admin`)
2. **Deployments** → آخر deployment → **Redeploy**
3. انتظر Ready

### Environment Variables (فقط إذا تغيّرت)
للموقع والأدمن لازم تظل:
```text
NEXT_PUBLIC_API_BASE_URL=https://api.alfajrhealth.com/api/v1
API_BASE_URL=https://api.alfajrhealth.com/api/v1
```
أي تعديل على `NEXT_PUBLIC_*` **يحتاج Redeploy** حتى يشتغل.

فحص سريع:
- الموقع: `https://palverse-ivory.vercel.app`
- الأدمن: `https://palverse-asn5.vercel.app/login`

---

## د) أي جزء أحدّث حسب نوع التعديل؟

| نوع التعديل | cPanel API | Vercel Web | Vercel Admin |
|-------------|------------|------------|--------------|
| API / DB / صور / صلاحيات | نعم | لا* | لا* |
| صفحات الموقع العام | لا | نعم | لا |
| لوحة الأدمن | لا | لا | نعم |
| API + أدمن معاً (مثل إصلاح الظهور) | نعم | لا | نعم |
| تغيير رابط الـ API | نعم (`.env`) | نعم (env + redeploy) | نعم (env + redeploy) |

\* إلا إذا الواجهة تعتمد على response جديد وتحتاج كود جديد عندها.

---

## هـ) تحديث اليوم (إصلاح الاشتراكات/الظهور)

هذا التحديث يمس **API + Admin**:

1. من جهازك: commit + push للتغييرات الحالية.
2. على cPanel: `git pull` + `config:clear` (+ `migrate` إذا طُلب).
3. على Vercel: Redeploy لمشروع **palverse-admin**.
4. افتح شاشة المحلات وتأكد شارة الظهور صارت صحيحة، وزر «تعيين اشتراك» ظاهر للمحلات المخفية.

---

## و) لو صار خطأ بعد التحديث

1. cPanel: `~/repositories/palverse/palverse-api/storage/logs/laravel.log`
2. Vercel: المشروع → Deployment → **Building / Runtime Logs**
3. تأكد إنك على cPanel مش Railway:
   - Network أو env لازم يكون `api.alfajrhealth.com`
4. الصور 403؟ تأكد وجود المجلد الحقيقي:
   ```bash
   ls -la ~/public_html/api/storage
   ```
   لازم يكون مجلد عادي فيه ملفات، مش symlink مكسور.
