import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

# --- 1. ΒΑΣΙΚΕΣ ΡΥΘΜΙΣΕΙΣ (ΚΑΘΑΡΟ DESIGN) ---
st.set_page_config(page_title="Olive Oil Costing", layout="wide", page_icon="🫒")

# --- 2. ΔΕΔΟΜΕΝΑ (ΠΡΟΣΟΜΟΙΩΣΗ ΑΠΟ ΤΟ EXCEL ΣΟΥ) ---
@st.cache_data
def load_data():
    # Τιμές Λαδιού
    oils = pd.DataFrame({
        "Είδος": ["Extra Virgin (EVOO)", "Organic (BIO)", "PDO (ΠΟΠ Sitia)", "Lampante"],
        "Τιμή/Kg (€)": [7.50, 9.20, 8.10, 5.50],
        "Φύρα (%)": [2.0, 3.0, 2.5, 4.0]
    })
    
    # Υλικά Συσκευασίας
    packaging = pd.DataFrame({
        "Περιγραφή": ["Dorica 250ml", "Dorica 500ml", "Marasca 750ml", "Tin 5L", "Pet 1L"],
        "Κόστος Υλικών (€)": [0.45, 0.58, 0.72, 1.45, 0.35], 
        "Τεμάχια/Κιβώτιο": [12, 12, 6, 4, 12],
        "Κιβώτια/Παλέτα": [120, 80, 70, 40, 60]
    })
    return oils, packaging

df_oils, df_pack = load_data()

# --- 3. SIDEBAR (ΜΕΝΟΥ ΑΡΙΣΤΕΡΑ) ---
with st.sidebar:
    st.header("🎛️ Ρυθμίσεις Παραγωγής")
    
    st.subheader("Γενικά Κόστη")
    labor_rate = st.number_input("Εργατικά (€/ώρα)", value=65.0, step=5.0)
    overhead_rate = st.number_input("Γενικά Έξοδα (%)", value=15.0, step=1.0)
    
    st.divider()
    st.subheader("Διαχείριση")
    st.info("Επεξεργασία Τιμών στα Tabs δεξιά")

# --- 4. ΚΥΡΙΩΣ ΟΘΟΝΗ ---
st.title("🫒 Olive Oil Costing System")

# Tabs για οργάνωση
tab1, tab2, tab3 = st.tabs(["💰 ΥΠΟΛΟΓΙΣΜΟΣ ΚΟΣΤΟΥΣ", "📊 DASHBOARD", "📝 ΔΕΔΟΜΕΝΑ (EXCEL)"])

# --- TAB 1: CALCULATOR (ΤΟ ΚΥΡΙΟ ΕΡΓΑΛΕΙΟ) ---
with tab1:
    st.markdown("### 🛠️ Δημιουργία Προσφοράς")
    
    # Inputs σε 3 στήλες
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("**1. Επιλογή Προϊόντος**")
        sel_oil = st.selectbox("Είδος Λαδιού", df_oils["Είδος"])
        sel_pack = st.selectbox("Συσκευασία", df_pack["Περιγραφή"])
        qty = st.number_input("Ποσότητα (Φιάλες)", value=1000, step=100)

    with col2:
        st.markdown("**2. Εμπορική Πολιτική**")
        margin = st.slider("Περιθώριο Κέρδους (%)", 5, 50, 20)
        incoterm = st.selectbox("Όρος Παράδοσης (Incoterm)", ["EXW (Εργοστάσιο)", "FOB (Λιμάνι)", "CIF (Παράδοση σε Πελάτη)"])
    
    with col3:
        st.markdown("**3. Προορισμός**")
        dest = st.selectbox("Χώρα / Ζώνη", ["Ελλάδα", "Γερμανία (EU)", "ΗΠΑ (USA)", "Κίνα"])
        if incoterm != "EXW":
            st.info("⚠️ Οι τιμές FOB/CIF θα προσθέσουν μεταφορικά.")

    st.divider()

    # ΥΠΟΛΟΓΙΣΜΟΙ
    if st.button("🧮 ΥΠΟΛΟΓΙΣΜΟΣ ΤΙΜΗΣ", type="primary", use_container_width=True):
        
        # Λήψη τιμών από τους πίνακες
        oil_row = df_oils[df_oils["Είδος"] == sel_oil].iloc[0]
        pack_row = df_pack[df_pack["Περιγραφή"] == sel_pack].iloc[0]
        
        # Μαθηματικά
        # 1. Λάδι (500ml -> ~0.458kg) + Φύρα
        vol_ml = 500 # Default αν δεν βρούμε άλλο
        if "250" in sel_pack: vol_ml = 250
        elif "750" in sel_pack: vol_ml = 750
        elif "5L" in sel_pack: vol_ml = 5000
        elif "1L" in sel_pack: vol_ml = 1000
            
        weight_kg = (vol_ml * 0.916) / 1000
        cost_oil = (weight_kg * oil_row["Τιμή/Kg (€)"]) * (1 + oil_row["Φύρα (%)"]/100)
        
        # 2. Συσκευασία
        cost_pack = pack_row["Κόστος Υλικών (€)"]
        
        # 3. Εργατικά (Υπόθεση 500 φιάλες/ώρα)
        cost_labor = labor_rate / 500
        
        # 4. Σύνολο Κόστους
        total_cost = (cost_oil + cost_pack + cost_labor) * (1 + overhead_rate/100)
        
        # 5. Τιμή Πώλησης
        price = total_cost / (1 - margin/100)
        
        # ΕΜΦΑΝΙΣΗ ΑΠΟΤΕΛΕΣΜΑΤΩΝ (Μεγάλα & Καθαρά)
        st.subheader("Αποτέλεσμα")
        
        res_col1, res_col2, res_col3 = st.columns(3)
        res_col1.metric("Κόστος Παραγωγής", f"€{total_cost:.2f}")
        res_col2.metric("Προτεινόμενη Τιμή", f"€{price:.2f}")
        res_col3.metric("Κέρδος ανά Φιάλη", f"€{price - total_cost:.2f}")
        
        # Πίνακας Ανάλυσης
        st.write("---")
        st.write("**Αναλυτική Κοστολόγηση:**")
        breakdown_df = pd.DataFrame({
            "Κατηγορία": ["Λάδι", "Συσκευασία", "Εργατικά/Γενικά", "Κέρδος"],
            "Αξία (€)": [cost_oil, cost_pack, (full_cost := total_cost - cost_oil - cost_pack), price - total_cost]
        })
        st.dataframe(breakdown_df, use_container_width=True)

# --- TAB 2: DASHBOARD (ΓΡΑΦΗΜΑΤΑ) ---
with tab2:
    st.subheader("Στατιστικά Αγοράς")
    
    # Απλό γράφημα γραμμής
    chart_data = pd.DataFrame({
        'Μήνας': ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαι', 'Ιουν'],
        'EVOO': [7.2, 7.3, 7.5, 7.4, 7.6, 7.8],
        'BIO': [8.8, 8.9, 9.2, 9.1, 9.3, 9.5]
    })
    
    fig = px.line(chart_data, x='Μήνας', y=['EVOO', 'BIO'], title="Τάση Τιμών Ελαιολάδου (6 μήνες)")
    st.plotly_chart(fig, use_container_width=True)

# --- TAB 3: DATA EDITOR (ΑΛΛΑΓΕΣ ΤΙΜΩΝ) ---
with tab3:
    st.warning("⚠️ Εδώ μπορείς να αλλάξεις τις τιμές που χρησιμοποιεί ο υπολογιστής.")
    
    col_d1, col_d2 = st.columns(2)
    with col_d1:
        st.markdown("**Τιμές Λαδιού**")
        # Ο Editor επιτρέπει να αλλάζεις κελιά σαν Excel
        edited_oils = st.data_editor(df_oils, key="oil_editor", num_rows="dynamic")
        
    with col_d2:
        st.markdown("**Κόστη Συσκευασίας**")
        edited_pack = st.data_editor(df_pack, key="pack_editor", num_rows="dynamic")
