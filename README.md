# SDGs 互動式數位策展

以聯合國永續發展目標（SDGs）為主題的互動式數位策展網站。網站採響應式設計，預計以 GSAP／ScrollTrigger 呈現展場敘事，並透過 Google Apps Script 將觀展回饋記錄至 Google 試算表。

## 專案狀態

- 已完成響應式展覽頁面雛形，採原生 HTML/CSS/JavaScript、Vite 與 GSAP／ScrollTrigger。
- 展覽主題為「放學以後：完成一份作業，需要哪些條件？」；內容使用 2024 年家庭設備／教育支出資料與 113 學年度課後照顧統計，並在頁面標示來源及資料限制。
- 觀展回饋表單與 Google Apps Script／Sheets 串接尚未實作。
- GitHub Pages 尚未部署；正式網址會在首次部署並確認可用後補上。
- Apps Script 將由使用者直接在瀏覽器中設定；本專案不使用 Clasp。

## 本機開發

```sh
npm ci
npm run dev
```

正式建置與本機預覽：

```sh
npm run build
npm run preview
```

設定本機回饋端點時，複製 `.env.example` 為 `.env.local`，再填入 Apps Script Web App URL。此 URL 會出現在前端建置內容中，請勿把它當作存放秘密憑證的方式。

## 發布

推送至 `main` 後，GitHub Actions 會建置並部署到 GitHub Pages。設定回饋端點時，請在 GitHub repository variables 建立 `APPS_SCRIPT_URL`。首次發布後，請在此補上已驗證可用的 Pages 網址。

**GitHub Pages：尚未部署**
