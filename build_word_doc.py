import os
import json
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.section import WD_SECTION, WD_ORIENTATION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_word_document():
    # Load data
    with open('data/flowcharts.json', 'r', encoding='utf-8') as f:
        flowcharts = json.load(f)
    
    with open('data/dimensions.json', 'r', encoding='utf-8') as f:
        dimensions = json.load(f)

    doc = docx.Document()

    # Configure Margins (A4 Portrait)
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = '微軟正黑體'
    normal_style._element.rPr.rFonts.set(qn('w:eastAsia'), '微軟正黑體')
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # Helper styling functions
    def set_cell_background(cell, fill_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_table_borders(table, color="D1D5DB", sz="4", val="single"):
        tblPr = table._tbl.tblPr
        borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:left w:val="none"/><w:right w:val="none"/><w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:insideV w:val="none"/></w:tblBorders>')
        tblPr.append(borders)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = '微軟正黑體'
        run._element.rPr.rFonts.set(qn('w:eastAsia'), '微軟正黑體')
        run.font.size = Pt(16)
        run.bold = True
        run.font.color.rgb = RGBColor(30, 58, 138) # Navy Blue
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = '微軟正黑體'
        run._element.rPr.rFonts.set(qn('w:eastAsia'), '微軟正黑體')
        run.font.size = Pt(13)
        run.bold = True
        run.font.color.rgb = RGBColor(37, 99, 235) # Royal Blue
        return p

    def add_callout(text, title="系統特點"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.67)
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "EFF6FF")
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
        tcPr.append(borders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_t = p.add_run(f"💡 {title}：")
        r_t.bold = True
        r_t.font.name = '微軟正黑體'
        r_t.font.color.rgb = RGBColor(30, 58, 138)
        
        r_b = p.add_run(text)
        r_b.font.name = '微軟正黑體'
        r_b.font.color.rgb = RGBColor(30, 41, 59)
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ------------------ COVER PAGE ------------------
    cover_p1 = doc.add_paragraph()
    cover_p1.paragraph_format.space_before = Pt(72)
    cover_p1.paragraph_format.space_after = Pt(8)
    cover_p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = cover_p1.add_run("南投縣立南投國民中學 115學年度")
    r1.font.name = '微軟正黑體'
    r1.font.size = Pt(16)
    r1.font.color.rgb = RGBColor(100, 116, 139)

    cover_p2 = doc.add_paragraph()
    cover_p2.paragraph_format.space_before = Pt(8)
    cover_p2.paragraph_format.space_after = Pt(12)
    cover_p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = cover_p2.add_run("3年4班「AI旅程照片生成器」\n流程圖手稿辨識與系統設計彙編")
    r2.font.name = '微軟正黑體'
    r2.font.size = Pt(24)
    r2.bold = True
    r2.font.color.rgb = RGBColor(30, 58, 138)

    cover_p3 = doc.add_paragraph()
    cover_p3.paragraph_format.space_before = Pt(8)
    cover_p3.paragraph_format.space_after = Pt(36)
    cover_p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3 = cover_p3.add_run("學生手寫流程圖 17 頁全文本辨識・維度架構整合・互動系統實作指引")
    r3.font.name = '微軟正黑體'
    r3.font.size = Pt(12)
    r3.font.color.rgb = RGBColor(71, 85, 105)

    # Metadata table on cover
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    meta_table.columns[0].width = Inches(2.2)
    meta_table.columns[1].width = Inches(3.8)
    set_table_borders(meta_table, color="CBD5E1", sz="4")

    meta_info = [
        ("學校班級", "南投縣立南投國民中學 3年4班"),
        ("專案名稱", "AI旅程照片生成器（AI Journey Studio）"),
        ("手稿來源", "1151123投中304流程圖.pdf（全 17 頁）"),
        ("彙整製作日期", "115年11月23日（2026-11-23）"),
        ("核心功能亮點", "6步驟引導、10風格、10地點、5情境、6背景、NBA合照、Canvas合成")
    ]
    for row_idx, (k, v) in enumerate(meta_info):
        c0 = meta_table.cell(row_idx, 0)
        c1 = meta_table.cell(row_idx, 1)
        set_cell_background(c0, "F1F5F9")
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_k = p0.add_run(k)
        r_k.bold = True
        r_k.font.color.rgb = RGBColor(51, 65, 85)
        
        p1 = c1.paragraphs[0]
        r_v = p1.add_run(v)
        r_v.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_page_break()

    # ------------------ CHAPTER 1: OVERVIEW ------------------
    add_heading_1("第一章：專案總覽與全班規格整合藍圖")
    
    p = doc.add_paragraph("本文件完整收錄並精確辨識南投縣立南投國中 115學年度 3年4班同學於課程中所構思之「AI旅程照片生成器」17 頁手寫流程圖手稿。本專案透過循序漸進的引導式介面（Stepper），結合影像上傳、即時相機拍照、風格濾鏡轉換、跨國場景融合、主題情境設定、8~15 字智慧文案標語生成，最終透過 HTML5 Canvas 合成高品質紀念海報並支援一鍵下載。")
    p.paragraph_format.line_spacing = 1.2
    p.paragraph_format.space_after = Pt(8)

    add_heading_2("1.1 系統核心六步驟流程架構（Stepper）")
    
    step_tbl = doc.add_table(rows=7, cols=3)
    step_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    step_tbl.autofit = False
    step_tbl.columns[0].width = Inches(1.1)
    step_tbl.columns[1].width = Inches(1.8)
    step_tbl.columns[2].width = Inches(3.77)
    set_table_borders(step_tbl, color="CBD5E1", sz="6")

    headers = ["步驟序號", "核心功能模組", "詳細功能規格與使用者體驗"]
    for c_idx, h in enumerate(headers):
        cell = step_tbl.cell(0, c_idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    step_data = [
        ("步驟 1", "照片來源輸入", "支援本機相片拖曳上傳，以及開啟攝影機（Webcam）即時拍照捕捉並進行縮放裁切預覽。"),
        ("步驟 2", "風格濾鏡選擇", "提供 10 種藝術濾鏡（真實寫真、日式手繪、3D卡通、手札插畫、浪漫水彩、中國水墨、動漫、賽博朋克、古典油畫、美式漫畫）。"),
        ("步驟 3", "世界地點選擇", "探索 10 大熱門地點（臺灣、日本、中國、泰國、美國、歐洲、冰島、埃及、韓國、澳洲）及專屬地標。"),
        ("步驟 4", "主題任務/情境", "涵蓋 5 大人生情境（浪漫旅遊、夢幻婚禮、商務出差、學術考訪、辦公室任務），並支援 14 位 NBA 球星合照彩蛋。"),
        ("步驟 5", "特色背景場景", "自選 6 大背景地貌（黃昏暮色、蔚藍海洋、現代首都、雄偉高山、廣袤草原、歡樂遊樂區）。"),
        ("步驟 6", "標語生成與海報輸出", "根據前述選擇自動生成 8~15 字文案，利用 HTML5 Canvas 進行海報繪製，支援一鍵高畫質 PNG 下載與分享。")
    ]

    for r_idx, (s_no, s_title, s_desc) in enumerate(step_data, start=1):
        bg = "FFFFFF" if r_idx % 2 != 0 else "F8FAFC"
        c0 = step_tbl.cell(r_idx, 0)
        c1 = step_tbl.cell(r_idx, 1)
        c2 = step_tbl.cell(r_idx, 2)
        for c in (c0, c1, c2):
            set_cell_background(c, bg)
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r0 = p0.add_run(s_no)
        r0.bold = True
        r0.font.color.rgb = RGBColor(37, 99, 235)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(s_title)
        r1.bold = True

        p2 = c2.paragraphs[0]
        p2.add_run(s_desc)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_heading_2("1.2 四大核心參數維度矩陣")
    
    dim_p = doc.add_paragraph("經全面彙整 17 份手稿內容，本系統收錄之四大核心維度與自選元素如下表所示：")
    dim_p.paragraph_format.space_after = Pt(4)

    dim_tbl = doc.add_table(rows=5, cols=3)
    dim_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    dim_tbl.autofit = False
    dim_tbl.columns[0].width = Inches(1.3)
    dim_tbl.columns[1].width = Inches(1.3)
    dim_tbl.columns[2].width = Inches(4.07)
    set_table_borders(dim_tbl, color="CBD5E1", sz="6")

    d_headers = ["維度類別", "數量", "包含項目與特色"]
    for c_idx, h in enumerate(d_headers):
        cell = dim_tbl.cell(0, c_idx)
        set_cell_background(cell, "2563EB")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    d_rows = [
        ("藝術風格濾鏡", "10 種", "真實寫真、日式手繪、3D卡通、手札插畫、浪漫水彩、中國水墨、動漫插畫、賽博朋克、古典油畫、美式漫畫"),
        ("探索旅遊地點", "10 區", "臺灣、日本、中國、泰國、美國、歐洲、冰島、埃及、韓國、澳洲"),
        ("主題情境任務", "5 類", "浪漫旅遊、夢幻婚禮、商務出差、學術考訪、辦公室任務（+ 14 位 NBA 巨星合照模式）"),
        ("背景地貌場景", "6 大類", "黃昏暮色、蔚藍海洋、現代首都、雄偉高山、廣袤草原、歡樂遊樂區")
    ]

    for r_idx, (d_name, d_cnt, d_detail) in enumerate(d_rows, start=1):
        bg = "FFFFFF" if r_idx % 2 != 0 else "F8FAFC"
        c0 = dim_tbl.cell(r_idx, 0)
        c1 = dim_tbl.cell(r_idx, 1)
        c2 = dim_tbl.cell(r_idx, 2)
        for c in (c0, c1, c2):
            set_cell_background(c, bg)
            set_cell_margins(c, top=70, bottom=70, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(d_name)
        r0.bold = True
        
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.add_run(d_cnt)

        p2 = c2.paragraphs[0]
        p2.add_run(d_detail)

    add_callout("本系統將同學提出之特色（如姚元威之裝備國防、游傑與王廷之 NBA 合照、許程崴之形狀裁切、柯霈妮之 Stepper 流程引擎）全面保留並數位化，兼具趣味性與教育價值。", "全班創意大融通")

    doc.add_page_break()

    # ------------------ CHAPTER 2: INDIVIDUAL PAGE TRANSCRIPTIONS ------------------
    add_heading_1("第二章：各頁手稿詳細辨識彙整與個別規格分析")

    intro_p2 = doc.add_paragraph("本章依手稿原件頁碼順序（第 1 頁至第 17 頁），完整列出各頁清晰手稿照片、精準原文字辨識、結構化步驟清單、設計特點與技術對應。")
    intro_p2.paragraph_format.space_after = Pt(12)

    for item in flowcharts:
        p_no = item['page_num']
        author = item['display_author']
        theme = item['theme']
        cat = item['category']
        raw_text = item['raw_text']
        features = item['features']
        steps = item['steps']
        img_path = item['image']

        add_heading_2(f"【第 {p_no:02d} 頁】{author} — {theme}")

        # Meta summary line
        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_after = Pt(4)
        r_cat_l = p_meta.add_run("分類領域：")
        r_cat_l.bold = True
        p_meta.add_run(f"{cat}　｜　")
        r_step_l = p_meta.add_run("流程步數：")
        r_step_l.bold = True
        p_meta.add_run(f"{item['step_count']} 個步驟　｜　")
        r_tags_l = p_meta.add_run("標籤：")
        r_tags_l.bold = True
        p_meta.add_run("、".join(item['tags']))

        # Two-column layout for Image & Transcription/Steps
        detail_tbl = doc.add_table(rows=1, cols=2)
        detail_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        detail_tbl.autofit = False
        detail_tbl.columns[0].width = Inches(2.9)
        detail_tbl.columns[1].width = Inches(3.77)
        set_table_borders(detail_tbl, color="E2E8F0", sz="4")

        c_left = detail_tbl.cell(0, 0)
        c_right = detail_tbl.cell(0, 1)
        set_cell_background(c_left, "FAFAFA")
        set_cell_background(c_right, "FFFFFF")
        set_cell_margins(c_left, top=100, bottom=100, left=100, right=100)
        set_cell_margins(c_right, top=100, bottom=100, left=120, right=100)

        # Left cell: Embed Image
        p_img = c_left.paragraphs[0]
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if os.path.exists(img_path):
            p_img.add_run().add_picture(img_path, width=Inches(2.7))
        p_cap = c_left.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(4)
        p_cap.paragraph_format.space_after = Pt(2)
        r_cap = p_cap.add_run(f"圖：第 {p_no:02d} 頁手稿原圖導正（{author}）")
        r_cap.font.size = Pt(8.5)
        r_cap.font.color.rgb = RGBColor(100, 116, 139)

        # Right cell: Transcribed text & Steps
        p_r1 = c_right.paragraphs[0]
        p_r1.paragraph_format.space_after = Pt(2)
        r_r1 = p_r1.add_run("📝 手稿文字辨識：")
        r_r1.bold = True
        r_r1.font.color.rgb = RGBColor(30, 58, 138)

        # Raw text box
        p_raw = c_right.add_paragraph()
        p_raw.paragraph_format.space_before = Pt(2)
        p_raw.paragraph_format.space_after = Pt(6)
        p_raw.paragraph_format.line_spacing = 1.15
        r_raw = p_raw.add_run(raw_text)
        r_raw.font.size = Pt(9)
        r_raw.font.color.rgb = RGBColor(51, 65, 85)

        # Step breakdown
        p_s = c_right.add_paragraph()
        p_s.paragraph_format.space_before = Pt(4)
        p_s.paragraph_format.space_after = Pt(2)
        r_s = p_s.add_run("🎯 結構化步驟分解：")
        r_s.bold = True
        r_s.font.color.rgb = RGBColor(37, 99, 235)

        for s in steps:
            p_st = c_right.add_paragraph()
            p_st.paragraph_format.space_before = Pt(1)
            p_st.paragraph_format.space_after = Pt(1)
            p_st.paragraph_format.left_indent = Inches(0.15)
            r_st_n = p_st.add_run(f"Step {s['step']}: {s['name']} - ")
            r_st_n.bold = True
            r_st_n.font.size = Pt(8.5)
            r_st_n.font.color.rgb = RGBColor(15, 23, 42)
            r_st_d = p_st.add_run(s['desc'])
            r_st_d.font.size = Pt(8.5)
            r_st_d.font.color.rgb = RGBColor(71, 85, 105)

        # Features
        p_f = c_right.add_paragraph()
        p_f.paragraph_format.space_before = Pt(6)
        p_f.paragraph_format.space_after = Pt(2)
        r_f = p_f.add_run("✨ 亮點特色：")
        r_f.bold = True
        r_f.font.size = Pt(8.5)
        r_f.font.color.rgb = RGBColor(217, 119, 6)

        for feat in features:
            p_ft = c_right.add_paragraph()
            p_ft.paragraph_format.space_before = Pt(0)
            p_ft.paragraph_format.space_after = Pt(0)
            p_ft.paragraph_format.left_indent = Inches(0.15)
            r_bullet = p_ft.add_run(f"• {feat}")
            r_bullet.font.size = Pt(8.5)
            r_bullet.font.color.rgb = RGBColor(51, 65, 85)

        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.add_page_break()

    # ------------------ CHAPTER 3: COMPARISON MATRIX & CONCLUSION ------------------
    add_heading_1("第三章：全案功能對照總表與教學成果驗證")

    p3_1 = doc.add_paragraph("為清楚呈現全班 17 份提案之構想交集與特色分佈，以下彙整為全班規格對照矩陣總表，並對應至本專案實作之互動網頁系統中：")
    p3_1.paragraph_format.space_after = Pt(6)

    comp_tbl = doc.add_table(rows=len(flowcharts) + 1, cols=6)
    comp_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    comp_tbl.autofit = False
    comp_tbl.columns[0].width = Inches(0.6)
    comp_tbl.columns[1].width = Inches(1.1)
    comp_tbl.columns[2].width = Inches(1.8)
    comp_tbl.columns[3].width = Inches(0.8)
    comp_tbl.columns[4].width = Inches(1.4)
    comp_tbl.columns[5].width = Inches(0.97)
    set_table_borders(comp_tbl, color="CBD5E1", sz="4")

    c_headers = ["頁碼", "學生姓名", "提案主題", "步數", "主要創新亮點", "網頁對應"]
    for c_idx, h in enumerate(c_headers):
        cell = comp_tbl.cell(0, c_idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=80, bottom=80, left=60, right=60)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, itm in enumerate(flowcharts, start=1):
        bg = "FFFFFF" if r_idx % 2 != 0 else "F8FAFC"
        cells = [comp_tbl.cell(r_idx, i) for i in range(6)]
        for c in cells:
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=60, right=60)

        # Page
        p0 = cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r0 = p0.add_run(f"P.{itm['page_num']:02d}")
        r0.font.size = Pt(8.5)

        # Name
        p1 = cells[1].paragraphs[0]
        r1 = p1.add_run(itm['student_name'])
        r1.bold = True
        r1.font.size = Pt(8.5)

        # Theme
        p2 = cells[2].paragraphs[0]
        r2 = p2.add_run(itm['theme'])
        r2.font.size = Pt(8.5)

        # Steps
        p3 = cells[3].paragraphs[0]
        p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r3 = p3.add_run(f"{itm['step_count']} 步")
        r3.font.size = Pt(8.5)

        # Features
        p4 = cells[4].paragraphs[0]
        r4 = p4.add_run(itm['features'][0] if itm['features'] else "-")
        r4.font.size = Pt(8.5)

        # Status
        p5 = cells[5].paragraphs[0]
        p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r5 = p5.add_run("✅ 已整合")
        r5.font.size = Pt(8.5)
        r5.font.color.rgb = RGBColor(22, 101, 52)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    add_heading_2("3.2 結論與後續成果發布")
    p_concl = doc.add_paragraph("透過本次 AI 輔助流程圖解析與全案數位化建置，成功將南投國中 304 班每位同學的原創手稿完整保留，並昇華為高度互動、具備密碼管制（通行碼 049）之單頁現代化 Web 應用程式。系統已完成 Git 版本控管並正式發布至 GitHub 雲端倉庫，為師生提供最佳之數位科技融入自主學習成果典範。")
    p_concl.paragraph_format.line_spacing = 1.2

    # Save document
    out_file = '1151123投中304流程圖.docx'
    doc.save(out_file)
    print(f'Successfully generated Word document: {out_file}')

if __name__ == '__main__':
    create_word_document()
