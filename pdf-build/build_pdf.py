from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

W, H = 1600, 900
INK, SAGE, FOREST, PAPER, RULE = (HexColor(c) for c in ("#1f3a2e", "#62756a", "#2f6b4c", "#f4f2ee", "#d8ddd4"))

REFS = [
    (1, "Future Market Insights, Protective Packaging Industry Analysis in United States and Canada, 2025 to 2035 (TAM $9.1B; void fill $1.9B)",
     "https://www.futuremarketinsights.com/reports/united-states-and-canada-protective-packaging-market"),
    (2, "Market Intelo, Void Fill Packaging Market Research Report 2034 (e-commerce = 42.1% of void fill, 2025)",
     "https://marketintelo.com/report/void-fill-packaging-market"),
    (3, "Future Market Insights, Void Fill Packaging Systems Market Share Analysis (top 3 = 18%, top 10 = 36%)",
     "https://www.futuremarketinsights.com/reports/void-fill-packaging-systems-market-share-analysis"),
    (4, "Market Research Future, Void Fill Packaging System Market (growth drivers)",
     "https://www.marketresearchfuture.com/reports/void-fill-packaging-system-market-38467"),
    (5, "US EPA, Facts and Figures about Materials, Waste and Recycling: Plastics; Containers and Packaging",
     "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/plastics-material-specific-data"),
    (None, "", "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/containers-and-packaging-product-specific"),
    (6, "Our World in Data, \"Packaging is the source of 40% of the planet's plastic waste\"",
     "https://ourworldindata.org/data-insights/packaging-is-the-source-of-40-of-the-planets-plastic-waste"),
    (7, "Beyond Plastics, The Real Truth About the U.S. Plastics Recycling Rate",
     "https://www.beyondplastics.org/publications/us-plastics-recycling-rate"),
    (8, "The Recycling Partnership, State of Recycling: The Present and Future of Residential Recycling in the U.S. (2024)",
     "https://recyclingpartnership.org/wp-content/uploads/dlm_uploads/2024/01/Recycling-Partnership-State-of-Recycling-Report-1.12.24.pdf"),
    (9, "Smithers, \"Packaging waste outpacing global capacity for sustainable management\" (434.5M tonnes, 2025)",
     "https://www.smithers.com/resources/2025/december/packaging-waste-outpacing-global-capacity"),
    (10, "Packaging Technology Today, \"The Rise of Sustainable Packaging in the U.S.: Trends, Drivers, and the Road Ahead\"",
     "https://www.packagingtechtoday.com/materials/the-rise-of-sustainable-packaging-in-the-u-s-trends-drivers-and-the-road-ahead/"),
    (11, "Adobe Express, \"The power of the package\" consumer survey (73% say premium packaging improves view of brand)",
     "https://www.adobe.com/express/learn/blog/power-of-the-package"),
    (12, "Packaging Technology Today, \"Study Finds E-commerce Packaging Choices Impact Purchasing Decisions\" (Ryder study; boxes chosen for protection)",
     "https://www.packagingtechtoday.com/featureds/study-finds-e-commerce-packaging-choices-impact-purchasing-decisions/"),
    (13, "2025 consumer study of 1,193 shoppers (unboxing and repeat purchase)", None),
    (14, "Journal of Consumer Psychology, unboxing experiments", None),
    (15, "Customer interview: Holiday (DTC apparel brand) team, conducted by Ledger, Group 11. Primary research.", "PRIMARY"),
]

c = canvas.Canvas("../Hypha_Pitch_Deck_with_Sources.pdf", pagesize=(W, H))
c.setTitle("Hypha Pitch Deck (with sources)")
c.setAuthor("Group 11")

for i in range(1, 18):
    Image.open(f"slide-{i:02d}.png").convert("RGB").save(f"slide-{i:02d}.jpg", quality=90)  # keeps the PDF small
    c.drawImage(f"slide-{i:02d}.jpg", 0, 0, W, H)
    c.showPage()

def page_bg(title):
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(FOREST); c.setFont("Courier", 18)
    c.rect(104, H - 90, 34, 1, stroke=0, fill=1)
    c.drawString(152, H - 96, "REFERENCES")
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 56)
    c.drawString(104, H - 170, title)

def wrap(text, font, size, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if c.stringWidth(t, font, size) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

pages = [REFS[:9], REFS[9:]]
for p, chunk in enumerate(pages, 1):
    page_bg(f"Sources ({p} of {len(pages)})")
    y = H - 240
    for num, text, url in chunk:
        if num is not None:
            c.setFillColor(FOREST); c.setFont("Courier-Bold", 20)
            c.drawString(104, y, f"[{num}]")
            c.setFillColor(INK); c.setFont("Helvetica", 21)
            for ln in wrap(text, "Helvetica", 21, 1300):
                c.drawString(170, y, ln); y -= 27
        else:
            y += 4
        if url == "PRIMARY":
            c.setFillColor(SAGE); c.setFont("Helvetica-Oblique", 16)
            c.drawString(170, y, "Interview notes held by the team."); y -= 20
        elif url:
            c.setFillColor(FOREST); c.setFont("Courier", 15)
            for ln in [url[k:k+150] for k in range(0, len(url), 150)]:
                c.drawString(170, y, ln)
                c.linkURL(url, (170, y - 4, 170 + c.stringWidth(ln, "Courier", 15), y + 15), relative=0)
                y -= 20
        else:
            c.setFillColor(SAGE); c.setFont("Helvetica-Oblique", 16)
            c.drawString(170, y, "Cited by the team; link not yet added."); y -= 20
        y -= 22
    if p == len(pages):
        c.setFillColor(SAGE); c.setFont("Helvetica", 17)
        notes = ["Notes: Calculated figures (21% void fill share, $800M SAM, $4M SOM) are derived from [1] to [3]. The SOM capture rate (0.5%) is a team",
                 "assumption benchmarked against incumbent shares. Value-map scores and the additive-manufacturing scrap illustration are team estimates."]
        yy = 110
        for n in notes: c.drawString(104, yy, n); yy -= 24
    c.showPage()

c.save()
print("ok")
