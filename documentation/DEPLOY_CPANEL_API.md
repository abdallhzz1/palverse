# رفع Palverse API على cPanel (والواجهات على Vercel)

هذا الدليل يشرح بالتفصيل رفع **الـ API فقط** على استضافة cPanel، مع الإبقاء على:
- الموقع: Vercel
- لوحة الأدمن: Vercel

الهدف: تخزين الصور بشكل دائم على الاستضافة (ما تختفي زي Railway).

---

## قبل ما تبدأ (جهّز هدول)

1. دخول cPanel شغال.
2. دومين أو سب دومين للـ API، مثال: `api.yourdomain.com`.
3. روابط Vercel الحالية (عدّلها إذا تغيّرت):
   - الموقع: `https://palverse-ivory.vercel.app`
   - الأدمن: `https://palverse-asn5.vercel.app`
4. يفضّل يكون عندك **Terminal** أو **SSH** في cPanel.
5. كود المشروع على GitHub: `https://github.com/abdallhzz1/palverse.git`

---

## الخطوة 1: إنشاء قاعدة بيانات MySQL

1. من لوحة cPanel افتح **MySQL Databases** (أو MySQL® Databases).
2. في قسم **Create New Database**:
   - اكتب اسم القاعدة، مثال: `palverse`
   - اضغط Create Database
   - اسمها النهائي غالباً يصير مثل: `username_palverse` (cPanel يضيف بادئة تلقائياً)
3. في قسم **MySQL Users**:
   - أنشئ مستخدم جديد + كلمة مرور قوية
   - احفظ الاسم وكلمة المرور
4. في قسم **Add User To Database**:
   - اختر المستخدم + القاعدة
   - اضغط Add
   - اختر **ALL PRIVILEGES**
   - احفظ التغييرات
5. سجّل عندك:
   - DB Host: عادة `localhost`
   - DB Name
   - DB Username
   - DB Password

---

## الخطوة 2: إنشاء سب دومين للـ API

1. من cPanel افتح **Domains** أو **Subdomains**.
2. أنشئ سب دومين مثل: `api`
   - النتيجة: `api.yourdomain.com`
3. لاحقاً لازم يكون Document Root يشير إلى مجلد `public` داخل Laravel  
   (نضبطه بعد رفع الملفات في الخطوة 4).

مثال صحيح لـ Document Root:
```text
/home/USERNAME/palverse-api/public
```

مثال غلط:
```text
/home/USERNAME/palverse-api
```

---

## الخطوة 3: رفع كود الـ API

### الطريقة أ — Git (مفضلة)

1. cPanel → **Git™ Version Control** → Create.
2. Clone من:
   ```text
   https://github.com/abdallhzz1/palverse.git
   ```
3. بعد الاكتمال، ادخل للمجلد وانقل/استخدم فقط `palverse-api`  
   أو ارفع مجلد `palverse-api` لوحده لمسار ثابت مثل:
   ```text
   /home/USERNAME/palverse-api
   ```

### الطريقة ب — ZIP / File Manager

1. على جهازك: اعمل ZIP لمجلد `palverse-api`  
   (يفضّل بدون `vendor` وبدون `.env`).
2. ارفعه عبر **File Manager** أو FTP.
3. فك الضغط في:
   ```text
   /home/USERNAME/palverse-api
   ```

تأكد إنك تشوف داخل المجلد ملفات مثل:
- `artisan`
- `composer.json`
- `app/`
- `public/`
- `storage/`

---

## الخطوة 4: ربط السب دومين على مجلد public

1. ارجع لإعدادات الدومين/السب دومين.
2. غيّر Document Root إلى:
   ```text
   /home/USERNAME/palverse-api/public
   ```
3. احفظ.
4. انتظر دقيقة للدومين إذا كان جديد، وتأكد SSL شغال (Let's Encrypt من cPanel إن لزم).

---

## الخطوة 5: ضبط نسخة PHP والامتدادات

1. cPanel → **Select PHP Version** (أو MultiPHP).
2. اختر **PHP 8.4** (أو 8.3 كحد أدنى).
3. فعّل الامتدادات التالية على الأقل:
   - `pdo_mysql`
   - `mysqli`
   - `mbstring`
   - `openssl`
   - `tokenizer`
   - `xml`
   - `ctype`
   - `json`
   - `bcmath`
   - `fileinfo`
   - `gd`
   - `zip`
   - `curl`
4. إن أمكن من Options ارفع:
   - `upload_max_filesize = 20M`
   - `post_max_size = 25M`
   - `max_execution_time = 120`
   - `memory_limit = 256M`

---

## الخطوة 6: تثبيت الحزم عبر Terminal

1. cPanel → **Terminal** (أو اتصل SSH).
2. نفّذ:

```bash
cd ~/palverse-api
composer install --no-dev --optimize-autoloader
```

إذا `composer` غير موجود، ثبّته أو استخدم المسار الكامل حسب الاستضافة.

ثم:

```bash
cp .env.example .env
php artisan key:generate
```

---

## الخطوة 7: تعبئة ملف `.env`

افتح الملف:
```text
~/palverse-api/.env
```

وعدّل القيم التالية (بدّل الأسماء حسب عندك):

```env
APP_NAME="Palverse API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=username_palverse
DB_USERNAME=username_dbuser
DB_PASSWORD=YOUR_DB_PASSWORD

CACHE_STORE=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
FILESYSTEM_DISK=public
LOG_CHANNEL=stack

PALVERSE_ALLOWED_ORIGINS=https://palverse-ivory.vercel.app,https://palverse-asn5.vercel.app
PALVERSE_PUBLIC_WEB_URL=https://palverse-ivory.vercel.app
PALVERSE_ADMIN_WEB_URL=https://palverse-asn5.vercel.app

PALVERSE_ALLOW_DEMO_SEEDING=true
PALVERSE_DEMO_ADMIN_PASSWORD=DemoAdmin123!
PALVERSE_DEMO_MERCHANT_PASSWORD=DemoMerchant123!
PALVERSE_DEMO_REPRESENTATIVE_PASSWORD=DemoRepresentative123!
PALVERSE_DEMO_FOLLOW_UP_PASSWORD=DemoFollowUp123!
```

ملاحظات:
- `APP_DEBUG` لازم `false` في الإنتاج.
- `FILESYSTEM_DISK=public` يعني الصور على ديسك الاستضافة (ثابت).
- روابط Vercel لازم تكون صحيحة بدون `/` في الآخر.

---

## الخطوة 8: تشغيل المايغريشن وربط التخزين والديمو

من Terminal:

```bash
cd ~/palverse-api
php artisan migrate --force
php artisan storage:link
php artisan palverse:seed-demo --force
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

إذا ظهرت مشكلة صلاحيات:

```bash
chmod -R ug+rwx storage bootstrap/cache
```

### أين تتحفظ الصور؟
```text
~/palverse-api/storage/app/public/
```
وتظهر عبر روابط مثل:
```text
https://api.yourdomain.com/storage/...
```

هذا التخزين دائم على cPanel (ما يضيع مع كل deploy زي Railway).

---

## الخطوة 9: فحص أن الـ API شغال

افتح بالمتصفح:

1. `https://api.yourdomain.com/up`  
   لازم يطلع Application up

2. `https://api.yourdomain.com/api/v1/health`  
   لازم JSON فيه `"status":"healthy"`

3. `https://api.yourdomain.com/api/v1/ready`  
   لازم `"database": true`

إذا `ready` فاشل:
- راجع بيانات DB في `.env`
- تأكد المستخدم مربوط بالقاعدة بصلاحيات كاملة

---

## الخطوة 10: توجيه Vercel على API الجديد

### أ) مشروع الموقع (palverse-web)
Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
API_BASE_URL=https://api.yourdomain.com/api/v1
TRUSTED_ORIGINS=https://palverse-ivory.vercel.app
```

ثم **Redeploy**.

### ب) مشروع الأدمن (palverse-admin)

```text
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
API_BASE_URL=https://api.yourdomain.com/api/v1
TRUSTED_ORIGINS=https://palverse-asn5.vercel.app
NEXT_PUBLIC_WEB_URL=https://palverse-ivory.vercel.app
```

ثم **Redeploy**.

---

## الخطوة 11: دخول تجريبي

بعد الـ seed:

- الأدمن: `https://palverse-asn5.vercel.app/login`
- Email: `admin@palverse.demo`
- Password: `DemoAdmin123!`

جرّب رفع صورة محل، ثم حدّث الصفحة بعد دقايق — لازم تظل موجودة.

---

## الخطوة 12: بعد ما يشتغل كل شيء

1. غيّر كلمة مرور الأدمن.
2. في `.env` على cPanel:
   ```env
   PALVERSE_ALLOW_DEMO_SEEDING=false
   APP_DEBUG=false
   ```
3. نفّذ:
   ```bash
   php artisan config:clear
   ```

---

## مشاكل شائعة وحلولها

### 1) صفحة بيضاء / 500
- راجع `storage/logs/laravel.log`
- تأكد `APP_KEY` موجود
- تأكد Document Root على `public`

### 2) الصور ما تظهر
- نفّذ `php artisan storage:link`
- تأكد صلاحيات `storage`
- تأكد `APP_URL` صحيح بـ https

إذا كان Document Root على `public_html/api` (نسخة من `public`) وظهر `403` على روابط `/storage/...`:
كثير من استضافات LiteSpeed **تمنع متابعة symlink** خارج `public_html`.

الحل المعتمد:

```bash
# احذف symlink إن وجد، وأنشئ مجلد حقيقي
rm -rf ~/public_html/api/storage
mkdir -p ~/public_html/api/storage
cp -a ~/repositories/palverse/palverse-api/storage/app/public/. ~/public_html/api/storage/
chmod -R ug+rwx ~/public_html/api/storage
```

ثم في `.env` للـ API:

```env
FILESYSTEM_PUBLIC_PATH=/home/USERNAME/public_html/api/storage
```

ثم:

```bash
cd ~/repositories/palverse/palverse-api
php artisan config:clear
```

بهذا الرفع الجديد يروح مباشرة لمجلد الويب، بدون اعتماد على symlink.

### 3) CORS / تسجيل الدخول من الأدمن يفشل
- راجع `PALVERSE_ALLOWED_ORIGINS` يطابق روابط Vercel بالضبط
- أعد `php artisan config:clear`

### 4) Composer أو PHP version error
- غيّر PHP إلى 8.4 من Select PHP Version
- فعّل امتدادات PDO و GD

### 5) `storage:link` يفشل أو روابط `/storage` تعطي 403
استخدم الحل في الفقرة (2) أعلاه: مجلد حقيقي تحت `public_html/api/storage` + `FILESYSTEM_PUBLIC_PATH`.

---

## ترتيب التنفيذ السريع (Checklist)

- [ ] إنشاء MySQL (DB + User + Privileges)
- [ ] إنشاء `api.yourdomain.com`
- [ ] رفع `palverse-api`
- [ ] Document Root → `.../public`
- [ ] PHP 8.4 + الامتدادات
- [ ] `composer install`
- [ ] تعبئة `.env`
- [ ] `migrate` + `storage:link` + `seed-demo`
- [ ] فحص health/ready
- [ ] تحديث Environment Variables في Vercel
- [ ] Redeploy للويب والأدمن
- [ ] تجربة دخول + رفع صورة

---

لما تجهز الدومين (مثل `api.xxx.com`) والمعلومات الحقيقية للـ DB، ابعتهم وأكتب لك ملف `.env` جاهز للصق بدونplaceholders.
