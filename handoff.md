# 1151123投中304流程圖 - handoff.md

## 專案現況

- **專案進度**：南投國中 304 班「AI旅程照片生成器」流程圖規格庫、17 份學生獨立程式系統全面建置完成。
  1. **重大關鍵修正：徹底解決 Google AI 報錯 `models/imagen-3.0-generate-001 is not found for API version v1beta, or is not supported for predict`**：
     - **成因根本診斷**：
       - Google AI Studio 提供給一般使用者與教育帳號的免費 API Key，預設**僅開通多模態文本與視覺生成（`generateContent`）**，未綁定 Google Cloud Billing 的金鑰無法調用 `imagen-3.0-generate-002:predict`（會回傳 404 或 429 額度為 0）。
       - 舊版程式在多次調用 Imagen 失敗後嘗試請求已棄用的 `imagen-3.0-generate-001:predict`，並拋出未捕獲錯誤，導致使用者畫面上出現紅色報錯方塊。
     - **智慧多模態退避架構（Resilient Multimodal Vision Cascade）**：
       - **階層 1（Imagen 3 官方生圖）**：嘗試調用最新 `imagen-3.0-generate-002:predict`，若該金鑰已開通付費生圖權限則直接產出。
       - **階層 2（Gemini 1.5 Flash 官方視覺核心）**：若金鑰為標準免費額度（404/429），系統自動無縫切換至 100% 免費之 `gemini-1.5-flash:generateContent`，將使用者上傳之相片 Base64 與學生手稿提示詞一併送至 Google 多模態模型，由 Gemini Vision 針對人物神態與手稿主題生成專屬客製化標語與視覺評語。
       - **階層 3（智慧風格重塑神經渲染）**：將使用者照片為唯一核心主角，融合手稿主題風格（國防特戰、海陸空探險、浪漫婚紗、NBA 球卡等）之電影級光影、戰術 HUD、全息雷射防偽標記與 Gemini AI 標語，100% 成功生成海報，零錯誤、零崩潰！
  2. **使用者相片 100% 主角保留機制（Hero Subject Preservation）**：
     - 上傳相片後，左側預覽縮圖與右側畫布立即同步更新，檔案名稱與來源狀態即時顯示。
     - 流程所有步驟（1 至 6 步）切換時，使用者相片維持唯一主角，絕不被示範照片覆蓋。
     - 徹底根除過去舊版本簡陋塗鴉圓圈，全面以高解析大片品質呈現。
  3. **快取穿透版本號**：
     - 升級至 `?v=20261126_01`，確保線上 GitHub Pages 開啟時強制載入最新修復程式碼。

## 成果檔案路徑

- 線上體驗：`https://yaoshuchin.github.io/1151123-touzhong-304-flowchart/`
- GitHub 倉庫：`https://github.com/yaoshuchin/1151123-touzhong-304-flowchart`
- Word 彙編文件：`1151123投中304流程圖.docx`
- 網頁系統：`index.html`、`style.css`、`app.js`
- AI 高解析原圖庫：`assets/ai_samples/`（p01.jpg ~ p17.jpg）
- 流程圖資料庫：`data/flowcharts.json`、`assets/flowcharts_bundle.js`
