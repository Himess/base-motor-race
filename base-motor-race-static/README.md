# 🏍️ Base Motor Race - Statik HTML Deployment

## ✅ Çok Daha Basit Yöntem!

Next.js sorunları yüzünden **statik HTML** versiyonuna geçtik.

### 🚀 Deployment Adımları

#### 1. GitHub'a Yükle

```bash
cd base-motor-race-static

git init
git add .
git commit -m "Base Motor Race - Static"
git branch -M main

# GitHub'da repo oluştur, sonra:
git remote add origin https://github.com/KULLANICI_ADIN/base-motor-race.git
git push -u origin main
```

#### 2. Vercel'e Deploy

1. https://vercel.com → New Project
2. GitHub repoyu import et
3. Settings:
   - Framework: **Other**
   - Build Command: (boş bırak)
   - Output Directory: `.`
4. Deploy!

#### 3. URL'i Al ve Manifest Güncelle

Vercel URL'ini aldıktan sonra:

`.well-known/farcaster.json` dosyasındaki `YOUR-VERCEL-URL` kısımlarını değiştir:

```json
{
  "iconUrl": "https://your-app.vercel.app/icon.png",
  "homeUrl": "https://your-app.vercel.app",
  ...
}
```

Push et:
```bash
git add .well-known/farcaster.json
git commit -m "Update manifest URLs"
git push
```

#### 4. Base Mini App Setup

1. **Developer Mode:** https://farcaster.xyz/~/settings/developer-tools
2. **Account Association:** base.dev/build
3. Vercel URL'ini gir
4. Kodu al ve manifest'e ekle

#### 5. Test & Publish

- Preview: https://base.dev/preview
- Publish: Base app'te paylaş!

## 📝 Önemli

- `index.html` = Oyun (zaten çalışıyor!)
- `.well-known/farcaster.json` = Base manifest
- Asset'ler eklenecek: icon.png, splash.png

## 🎮 Lokal Test

Basit HTTP server:
```bash
python -m http.server 3000
# veya
npx serve .
```

http://localhost:3000 aç!

---

Artık çalışıyor! 🚀
