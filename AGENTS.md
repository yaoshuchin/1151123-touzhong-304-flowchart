# 1151123投中304流程圖 - AGENTS.md

## 專案入口

- **專案名稱**：南投縣立南投國民中學 115學年度 3年4班「AI旅程照片生成器」流程圖規格庫與 17 份學生獨立程式系統
- **專案用途**：
  1. 將 304 班 17 份學生手寫流程圖 PDF 完整辨識並精準轉製為專業 Word 彙編文件（1151123投中304流程圖.docx），依學校名冊校對並將學生姓名第二字以「O」進行去識別化替代。
  2. 建置現代化單頁互動網頁（index.html），免密碼直接體驗、手稿分類檢索庫、高解析手稿檢視 Modal、全班 17 份學生專屬獨立程式工作台（姚O城國防特戰卡、許O崴節慶心型/圓形/星型裁切卡、林O羽電競對白封面卡、羅O鈞婚紗前後對比、鄧O康/王O NBA巨星同框典藏卡、蔡O緯海陸空探險、謝O倢7步驟工坊等）。
  3. 發布至 GitHub 倉庫並開啟 GitHub Pages 線上體驗。
- **主要工作目錄**：`D:\antigravity\1151123投中304流程圖`
- **GitHub repo**：`https://github.com/yaoshuchin/1151123-touzhong-304-flowchart`
- **線上網址**：`https://yaoshuchin.github.io/1151123-touzhong-304-flowchart/`
- **原始來源檔案**：`1151123投中304流程圖.pdf`
- **學生參考名冊**：`D:\115訓育組\1150929南投國中全部學生資料-化簡.xls`
- **Word 成果檔案**：`1151123投中304流程圖.docx`
- **互動網頁檔案**：`index.html`、`style.css`、`app.js`
- **資料庫檔案**：`data/flowcharts.json`、`data/dimensions.json`、`assets/flowcharts_bundle.js`
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
- 遵循校園資訊安全與學生隱私保護原則，學生姓名第二字以「O」遮罩。

## 不要做

- 不要 commit API key、token、私人密碼或憑證。
- 不要 commit 學生身分證號、電話、地址等機敏個資。
- 不要自動納入無關 git 變更，commit 前先檢查 diff。
