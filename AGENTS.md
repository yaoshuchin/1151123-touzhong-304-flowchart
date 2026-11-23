# 1151123投中304流程圖 - AGENTS.md

## 專案入口

- **專案名稱**：南投縣立南投國民中學 115學年度 3年4班「AI旅程照片生成器」流程圖規格庫與互動系統
- **專案用途**：
  1. 將 304 班 17 份學生手寫流程圖 PDF 完整辨識並精準轉製為專業 Word 彙編文件（1151123投中304流程圖.docx）。
  2. 建置現代化單頁互動網頁（index.html），具備 `049` 通行密碼防護、手稿分類檢索庫、高解析手稿檢視 Modal、全功能 6 步驟 AI 旅程照片生成器（支援 Webcam 拍照、10大風格、10大地點、5大情境、6大背景、NBA球星同框彩蛋、HTML5 Canvas 即時海報合成輸出與一鍵高畫質 PNG 下載）。
  3. 發布至 GitHub 倉庫並開啟 GitHub Pages 線上體驗。
- **主要工作目錄**：`D:\antigravity\1151123投中304流程圖`
- **GitHub repo**：`https://github.com/yaoshuchin/1151123-touzhong-304-flowchart`
- **線上網址**：`https://yaoshuchin.github.io/1151123-touzhong-304-flowchart/`
- **原始來源檔案**：`1151123投中304流程圖.pdf`
- **Word 成果檔案**：`1151123投中304流程圖.docx`
- **互動網頁檔案**：`index.html`、`style.css`、`app.js`
- **資料庫檔案**：`data/flowcharts.json`、`data/dimensions.json`、`assets/flowcharts_bundle.js`
- **系統管制密碼**：`049`
- **預設 branch**：`main`

## Obsidian 對應筆記

- **Obsidian vault**：待使用者指定本機 Vault 路徑
- **專案駕駛艙**：`1151123投中304流程圖/專案工作流程.md`

## 工作規則

- 回應優先使用繁體中文（台灣）。
- 涉及檔案操作時回報完整產出位置（使用 `file:///` 格式連結）。
- 命令列操作優先使用 Windows PowerShell 語法，Python 執行優先使用 `uv run`。
- 開工時讀本檔、讀專案交接紀錄（`handoff.md`）、檢查檔案現況與 Git 狀態。
- 收工時更新專案紀錄，進度交接寫入 `handoff.md`。
- 不把每日流水帳寫進本檔。
- 遵循校園資訊安全與學生隱私保護原則。

## 不要做

- 不要 commit API key、token、私人密碼或憑證。
- 不要 commit NotebookLM 個人匯出清單或筆記本 ID 清單。
- 不要自動納入無關 git 變更，commit 前先檢查 diff。
- 妥善保護學生個資，避免洩漏隱私資料。
