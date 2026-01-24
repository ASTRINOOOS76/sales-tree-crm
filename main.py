import streamlit as st
import pandas as pd
from fpdf import FPDF
import base64
from datetime import datetime

# --- ΡΥΘΜΙΣΕΙΣ & CONSTANTS ---
OIL_DENSITY = 0.916  # Ειδικό βάρος ελαιολάδου
CURRENCY = "€"

# --- ΒΑΣΗ ΔΕΔΟΜΕΝΩΝ (Mock Data - Εδώ θα μπορούσε να είναι SQL) ---
DB_OILS = {
    "Extra Virgin (EVOO)": {"price_kg": 7.50, "loss_factor": 0.02}, # 2% φύρα
    "Organic (BIO)": {"price_kg": 9.20, "loss_factor": 0.03},
    "PDO (ΠΟΠ)": {"price_kg": 8.10, "loss_factor": 0.025}
}

DB_PACKAGING = {
    "Dorica 250ml": {"cost": 0.25, "caps_cost": 0.05, "label_cost": 0.08, "items_per_box": 12, "box_cost": 0.60},
    "Dorica 500ml": {"cost": 0.35, "caps_cost": 0.05, "label_cost": 0.10, "items_per_box": 12, "box_cost": 0.75},
    "Marasca 750ml": {"cost": 0.45, "caps_cost": 0.06, "label_cost": 0.12, "items_per_box": 6, "box_cost": 0.70},
    "Tin 5L": {"cost": 1.20, "caps_cost": 0.10, "label_cost": 0.15, "items_per_box": 4, "box_cost": 0.90}
}

DB_LOGISTICS = {
    "Greece (Domestic)": {"base_rate": 50, "zone_multiplier": 1.0},
    "Germany (EU Central)": {"base_rate": 150, "zone_multiplier": 1.5},
    "USA (East Coast)": {"base_rate": 350, "zone_multiplier": 2.5},
    "China (Main Ports)": {"base_rate": 400, "zone_multiplier": 3.0}
}

# --- LOGIC FUNCTIONS ---

def calculate_costs(oil_type, package_type, quantity_bottles, margin_percent, logistics_zone, incoterm, labor_cost_per_hour):
    
    # 1. Δεδομένα Επιλογών
    oil_data = DB_OILS[oil_type]
    pack_data = DB_PACKAGING[package_type]
    
    # Εξαγωγή όγκου από το όνομα (π.χ. "Dorica 500ml" -> 500)
    import re
    vol_match = re.search(r'\d+', package_type)
    volume_ml = int(vol_match.group()) if vol_match else 500
    if "L" in package_type and "mL" not in package_type: volume_ml *= 1000 # Για τον τενεκέ 5L
    
    # 2. Υπολογισμός Λαδιού (Mass Balance)
    weight_per_bottle_kg = (volume_ml * OIL_DENSITY) / 1000
    oil_cost_raw = weight_per_bottle_kg * oil_data["price_kg"]
    oil_cost_final = oil_cost_raw * (1 + oil_data["loss_factor"]) # Προσθήκη φύρας
    
    # 3. Υπολογισμός Συσκευασίας (Dry Materials)
    # Κόστος ανά φιάλη (Μπουκάλι + Καπάκι + Ετικέτα + Αναλογία Κιβωτίου)
    box_portion = pack_data["box_cost"] / pack_data["items_per_box"]
    packaging_total = pack_data["cost"] + pack_data["caps_cost"] + pack_data["label_cost"] + box_portion
    packaging_final = packaging_total * 1.03 # 3% Scrap rate (σπασμένα)
    
    # 4. Εργατικά & Βιομηχανικά Έξοδα
    # Υπόθεση: Παραγωγή 500 μπουκαλιών/ώρα (αυτό θα το έπαιρνε από ρυθμίσεις)
    bottles_per_hour = 500 
    labor_per_unit = labor_cost_per_hour / bottles_per_hour
    
    # 5. Σύνολο EXW (Ex Works Cost)
    exw_cost = oil_cost_final + packaging_final + labor_per_unit
    
    # 6. Τιμή Πώλησης (Pricing)
    # Τύπος Margin: Price = Cost / (1 - margin)
    selling_price_exw = exw_cost / (1 - (margin_percent/100))
    
    # 7. Logistics & Incoterms Logic
    total_weight_kg = quantity_bottles * (weight_per_bottle_kg + 0.4) # +0.4kg για γυαλί
    pallets = (quantity_bottles / pack_data["items_per_box"]) / 80 # Υπόθεση 80 κιβώτια/παλέτα
    if pallets < 1: pallets = 1
    
    logistics_data = DB_LOGISTICS[logistics_zone]
    freight_cost = logistics_data["base_rate"] * pallets
    
    incoterm_add_on = 0
    incoterm_desc = "Παραλαβή από Εργοστάσιο"
    
    if incoterm == "EXW":
        incoterm_add_on = 0
    elif incoterm == "FOB (Free on Board)":
        incoterm_add_on = 150 # Σταθερά έξοδα λιμανιού/εκτελωνιστή
        incoterm_desc = "Εργοστάσιο -> Λιμάνι Εξαγωγής"
    elif incoterm == "CIF (Cost Insurance Freight)":
        insurance = selling_price_exw * quantity_bottles * 0.01 # 1% ασφάλεια
        incoterm_add_on = 150 + freight_cost + insurance
        incoterm_desc = f"Έως λιμάνι {logistics_zone} + Ασφάλεια"
    elif incoterm == "DDP (Delivered Duty Paid)":
        duties = selling_price_exw * quantity_bottles * 0.05 # 5% Δασμοί
        delivery = 200 # Last mile delivery
        insurance = selling_price_exw * quantity_bottles * 0.01
        incoterm_add_on = 150 + freight_cost + insurance + duties + delivery
        incoterm_desc = "Παράδοση στην πόρτα πελάτη (Όλα πληρωμένα)"

    final_total_price = (selling_price_exw * quantity_bottles) + incoterm_add_on
    price_per_unit_final = final_total_price / quantity_bottles

    return {
        "Volume": volume_ml,
        "Oil Cost": oil_cost_final,
        "Packaging": packaging_final,
        "Labor": labor_per_unit,
        "EXW Cost": exw_cost,
        "Margin €": selling_price_exw - exw_cost,
        "EXW Price": selling_price_exw,
        "Incoterm Cost Total": incoterm_add_on,
        "Final Price Unit": price_per_unit_final,
        "Total Order Value": final_total_price,
        "Description": incoterm_desc
    }

# --- PDF GENERATOR ---
def create_pdf(data, client_name):
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, f"OFFER QUOTATION: {client_name}", ln=True, align='C')
    pdf.ln(10)
    
    # Details
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, f"Date: {datetime.now().strftime('%d/%m/%Y')}", ln=True)
    pdf.cell(0, 10, f"Product: {data['oil_type']} in {data['pack_type']}", ln=True)
    pdf.cell(0, 10, f"Quantity: {data['qty']} bottles", ln=True)
    pdf.cell(0, 10, f"Incoterm: {data['incoterm']} - {data['zone']}", ln=True)
    
    pdf.ln(10)
    
    # Table Header
    pdf.set_fill_color(200, 220, 255)
    pdf.cell(100, 10, "Description", 1, 0, 'L', 1)
    pdf.cell(40, 10, "Value", 1, 1, 'R', 1)
    
    # Table Rows
    pdf.cell(100, 10, "Price per Bottle (EXW)", 1, 0)
    pdf.cell(40, 10, f"{data['exw_price']:.2f} EUR", 1, 1, 'R')
    
    pdf.cell(100, 10, "Logistics & Incoterm Charges (Total)", 1, 0)
    pdf.cell(40, 10, f"{data['logistics_total']:.2f} EUR", 1, 1, 'R')
    
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(100, 10, "FINAL PRICE PER UNIT", 1, 0)
    pdf.cell(40, 10, f"{data['final_unit']:.2f} EUR", 1, 1, 'R')
    
    pdf.cell(100, 10, "TOTAL ORDER VALUE", 1, 0)
    pdf.cell(40, 10, f"{data['total_val']:.2f} EUR", 1, 1, 'R')
    
    # Footer
    pdf.ln(20)
    pdf.set_font("Arial", 'I', 10)
    pdf.multi_cell(0, 10, "Notes: Offer valid for 30 days. Payment terms: 50% advance, 50% before loading.")
    
    return pdf.output(dest='S').encode('latin-1')

# --- USER INTERFACE (STREAMLIT) ---

st.set_page_config(page_title="Olive Oil Costing Pro", layout="wide")

st.title("🫒 Olive Oil Bottling Costing System")
st.markdown("### Υπολογισμός Κόστους & Προσφοράς Εξαγωγών")

# Sidebar - Settings
with st.sidebar:
    st.header("⚙️ Ρυθμίσεις Παραγωγής")
    st.info("Ρύθμισε τις παραμέτρους του εργοστασίου")
    labor_cost = st.number_input("Εργατικό Κόστος Γραμμής (€/ώρα)", value=60.0)
    overhead_pct = st.slider("Γενικά Βιομηχανικά Έξοδα (%)", 0, 50, 15)

# Main Inputs
col1, col2, col3 = st.columns(3)

with col1:
    st.subheader("1. Προϊόν")
    selected_oil = st.selectbox("Επιλογή Ελαιολάδου", list(DB_OILS.keys()))
    selected_pack = st.selectbox("Συσκευασία", list(DB_PACKAGING.keys()))
    quantity = st.number_input("Ποσότητα (Φιάλες)", min_value=100, value=1000, step=100)

with col2:
    st.subheader("2. Εμπορική Πολιτική")
    margin = st.slider("Επιθυμητό Κέρδος (Margin %)", 5, 60, 25)
    payment_terms = st.selectbox("Τρόπος Πληρωμής", ["Προκαταβολή 100%", "50-50", "Πίστωση 60 ημερών (+2% κόστος)"])

with col3:
    st.subheader("3. Logistics & Incoterms")
    destination = st.selectbox("Χώρα Προορισμού", list(DB_LOGISTICS.keys()))
    selected_incoterm = st.selectbox("Incoterm", ["EXW", "FOB (Free on Board)", "CIF (Cost Insurance Freight)", "DDP (Delivered Duty Paid)"])
    client_name = st.text_input("Όνομα Πελάτη (για PDF)", "Client SA")

# --- CALCULATION TRIGGER ---
if st.button("🚀 Υπολογισμός Τιμής", type="primary"):
    
    # Run Logic
    res = calculate_costs(selected_oil, selected_pack, quantity, margin, destination, selected_incoterm, labor_cost)
    
    # Adjust for Payment Terms Cost (Financial Cost)
    if "Πίστωση" in payment_terms:
        fin_cost = res["Final Price Unit"] * 0.02
        res["Final Price Unit"] += fin_cost
        res["Total Order Value"] += (fin_cost * quantity)
    
    st.divider()
    
    # --- RESULTS DISPLAY ---
    st.header("📊 Ανάλυση Προσφοράς")
    
    # Top Metrics
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Κόστος EXW (Βάση)", f"€{res['EXW Cost']:.2f}")
    m2.metric("Τιμή EXW (με Κέρδος)", f"€{res['EXW Price']:.2f}")
    m3.metric("Logistics/Incoterm", f"€{res['Incoterm Cost Total']/quantity:.2f}/φιάλη")
    m4.metric("ΤΕΛΙΚΗ ΤΙΜΗ (Unit)", f"€{res['Final Price Unit']:.2f}", delta="Target Price")

    # Detailed Table
    st.subheader("Λεπτομερής Ανάλυση Κόστους")
    
    cost_breakdown = {
        "Στοιχείο Κόστους": ["Λάδι (με φύρα)", "Συσκευασία (με scrap)", "Εργατικά", "Περιθώριο Κέρδους", "Μεταφορικά/Δασμοί"],
        "Αξία (€)": [res["Oil Cost"], res["Packaging"], res["Labor"], res["Margin €"], res["Incoterm Cost Total"]/quantity]
    }
    df = pd.DataFrame(cost_breakdown)
    st.dataframe(df, use_container_width=True)
    
    st.info(f"ℹ️ Λεπτομέρειες Incoterm: {res['Description']}")

    # --- PDF EXPORT ---
    pdf_data = {
        'oil_type': selected_oil,
        'pack_type': selected_pack,
        'qty': quantity,
        'incoterm': selected_incoterm,
        'zone': destination,
        'exw_price': res['EXW Price'],
        'logistics_total': res['Incoterm Cost Total'],
        'final_unit': res['Final Price Unit'],
        'total_val': res['Total Order Value']
    }
    
    pdf_bytes = create_pdf(pdf_data, client_name)
    b64 = base64.b64encode(pdf_bytes).decode()
    href = f'<a href="data:application/octet-stream;base64,{b64}" download="Offer_{client_name}.pdf" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📥 Λήψη Προσφοράς (PDF)</a>'
    st.markdown(href, unsafe_allow_html=True)

# --- TAB ΓΙΑ ΑΠΟΛΟΓΙΣΤΙΚΗ ---
st.divider()
with st.expander("📝 Απολογιστική Κοστολόγηση (Μετά την παραγωγή)"):
    st.write("Σύγκρινε τι υπολόγιζες (Πρότυπο) με το τι έγινε πραγματικά (Απολογιστικό).")
    
    col_a, col_b = st.columns(2)
    with col_a:
        real_hours = st.number_input("Πραγματικές Ώρες Λειτουργίας", value=2.5)
        real_scrap = st.number_input("Πραγματικά Σπασμένα Μπουκάλια (Scrap)", value=15)
    
    with col_b:
        st.write("Ανάλυση Απόκλισης:")
        if 'res' in locals():
            standard_labor_total = (quantity / 500) * labor_cost # Υπολογισμένο
            actual_labor_total = real_hours * labor_cost # Πραγματικό
            diff = actual_labor_total - standard_labor_total
            
            if diff > 0:
                st.error(f"⚠️ Ζημία στα Εργατικά: €{diff:.2f}")
            else:
                st.success(f"✅ Κέρδος (Απόδοση): €{abs(diff):.2f}")