# SDGs 互動式數位策展

以聯合國永續發展目標（SDGs）為主題的互動式數位策展網站。網站採響應式設計，預計以 GSAP／ScrollTrigger 呈現展場敘事，並透過 Google Apps Script 將觀展回饋記錄至 Google 試算表。

## 專案狀態

- 已完成響應式展覽頁面雛形，採原生 HTML/CSS/JavaScript、Vite 與 GSAP／ScrollTrigger。
- 展覽主題為「放學以後：完成一份作業，需要哪些條件？」；內容使用 2024 年家庭設備／教育支出資料與 113 學年度課後照顧統計，並在頁面標示來源及資料限制。
- 觀展回饋表單已串接使用者部署的 Google Apps Script Web App，欄位不收集姓名或聯絡方式。由於 Apps Script 的跨網域回應無法由靜態頁讀取，網站會如實提示「請求已送出、寫入尚未確認」，不會冒稱試算表已成功新增資料。
- GitHub Pages 已部署並確認可用；正式網址見下方「發布」區段。
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

設定本機回饋端點時，在 `.env.local` 設定 `VITE_APPS_SCRIPT_URL` 為 Apps Script Web App URL。此 URL 會出現在前端建置內容中，請勿把它當作存放秘密憑證的方式。

## 發布

推送至 `main` 後，GitHub Actions 會建置並部署到 GitHub Pages。部署回饋表單前，請在 GitHub repository variables 建立 `APPS_SCRIPT_URL`，值為 Apps Script Web App URL；此值是公開端點，不是秘密憑證。

**GitHub Pages：[https://lloyd3126.github.io/sdgs-digital-curation/](https://lloyd3126.github.io/sdgs-digital-curation/)**
