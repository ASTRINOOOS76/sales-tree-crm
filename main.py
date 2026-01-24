import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from fpdf import FPDF
import base64
from datetime import datetime

# --- ΡΥΘΜΙΣΗ ΣΕΛΙΔΑΣ (Full Screen) ---
st.set_page_config(page_title="Olive ERP System", layout="wide", page_icon="🫒")

# --- CSS ΓΙΑ ΝΑ ΜΟΙΑΖΕΙ ΜΕ DASHBOARD ---
st.markdown("""
<style>
    .metric-card {background-color: #f0f2f6; border-radius: 10px; padding: 15px; border-left: 5px solid #4CAF50;}
    .stTabs [data-baseweb="tab-list"] {gap: 10px;}
    .stTabs [data-baseweb="tab"] {height: 50px; white-space: pre-wrap; background-color: #f0f2f6; border-radius: 5px;}
    .stTabs [data-baseweb="tab"][aria-selected="true"] {background-color: #4CAF50; color: white;}
</style>
""", unsafe_allow_html=True)

# --- 1. LOAD DATA (ΠΡΟΣΟΜΟΙΩΣΗ EXCEL) ---
# Εδώ κανονικά θα βάλουμε: df = pd.read_excel("KostosParagogis.xlsm", sheet_name="Data")
# Για τώρα φτιάχνω τα dataframes όπως θα ήταν στο Excel σου.

@st.cache_data
def load_data():
    # Sheet: Τιμές Λαδιού
    oils = pd.DataFrame({
        "Είδος": ["Extra Virgin (EVOO)", "Organic (BIO)", "PDO (ΠΟΠ Sitia)", "Pure Olive Oil"],
        "Τιμή/Kg (€)": [7.50, 9.20, 8.10, 6.80],
        "Φύρα (%)": [2.0, 3.0, 2.5, 1.5]
    })
    
    # Sheet: Υλικά Συσκευασίας
    packaging = pd.DataFrame({
        "Περιγραφή": ["Dorica 250ml", "Dorica 500ml", "Marasca 750ml", "Tin 5L", "Pet 1L"],
        "Κόστος Υλικών (€)": [0.45, 0.58, 0.72, 1.45, 0.35], # Μπουκάλι+Καπάκι+Ετικέτα
        "Τεμάχια/Κιβώτιο": [12, 12, 6, 4, 12],
        "Κιβώτια/Παλέτα": [120, 80, 70, 40, 60]
    })
    
    return oils, packaging

df_oils, df_pack = load_data()

# --- SIDEBAR MENU (ΠΛΟΗΓΗΣΗ) ---
with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2829/2829824.png", width=80)
    st.title("Olive ERP v2.0")
    st.write("Logged in as: **Admin**")
    st.divider()
    
    # Global Settings
    st.header("⚙️ Παράμετροι")
    labor_rate = st.number_input("Εργατικά (€/ώρα)", value=65.0)
    overhead_rate = st.number_input("Γενικά Έξοδα (%)", value=15.0)
    currency = st.selectbox("Νόμισμα", ["EUR (€)", "USD ($)"])

# --- ΚΥΡΙΩΣ ΕΦΑΡΜΟΓΗ ME TABS ---
tab1, tab2, tab3 = st.tabs(["📊 Dashboard & Analytics", "💰 Κοστολόγηση (Calculator)", "🗃️ Βάση Δεδομένων (Excel Data)"])

# --- TAB 1: DASHBOARD (Η "ΜΕΓΑΛΗ ΕΙΚΟΝΑ") ---
with tab1:
    st.subheader("📈 Επισκόπηση Παραγωγής & Αγοράς")
    
    # KPI Cards (Custom HTML)
    c1, c2, c3, c4 = st.columns(4)
    c1.markdown('<div class="metric-card"><h3>Τιμή EVOO</h3><h1>7.50€</h1><p>Change: +5% 📈</p></div>', unsafe_allow_html=True)
    c2.markdown('<div class="metric-card"><h3>Ενεργές Προσφορές</h3><h1>12</h1><p>Pending Approval</p></div>', unsafe_allow_html=True)
    c3.markdown('<div class="metric-card"><h3>Μέσο Περιθώριο</h3><h1>22%</h1><p>Target: 25%</p></div>', unsafe_allow_html=True)
    c4.markdown('<div class="metric-card"><h3>Stock Παραγωγής</h3><h1>4,500L</h1><p>Tank 3 & 4</p></div>', unsafe_allow_html=True)
    
    st.divider()
    
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        st.caption("Διακύμανση Τιμών Λαδιού (Τελευταίο 6μηνο)")
        # Mock Data για το γράφημα
        chart_data = pd.DataFrame({
            'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'EVOO': [7.1, 7.2, 7.5, 7.4, 7.6, 7.5],
            'BIO': [8.5, 8.8, 9.0, 9.2, 9.1, 9.2]
        })
        fig = px.line(chart_data, x='Month', y=['EVOO', 'BIO'], markers=True)
        st.plotly_chart(fig, use_container_width=True)
        
    with col_chart2:
        st.caption("Ανάλυση Κόστους ανά Φιάλη (Breakdown)")
        # Pie Chart
        labels = ['Λάδι', 'Γυαλί/Συσκευασία', 'Εργατικά', 'Μεταφορικά', 'Λειτουργικά']
        values = [65, 20, 5, 5, 5]
        fig2 = go.Figure(data=[go.Pie(labels=labels, values=values, hole=.4)])
        st.plotly_chart(fig2, use_container_width=True)

# --- TAB 2: CALCULATOR (ΤΟ "ΖΟΥΜΙ") ---
with tab2:
    st.subheader("🛠️ Εργαλείο Κοστολόγησης & Προσφοράς")
    
    # Layout 3 Στηλών για Inputs
    c1, c2, c3 = st.columns(3)
    
    with c1:
        st.markdown("##### 1. Σύνθεση Προϊόντος")
        sel_oil = st.selectbox("Επιλογή Λαδιού", df_oils["Είδος"])
        sel_pack = st.selectbox("Επιλογή Συσκευασίας", df_pack["Περιγραφή"])
        qty = st.number_input("Ποσότητα (Φιάλες)", value=1000, step=100)
    
    with c2:
        st.markdown("##### 2. Εμπορικά")
        margin = st.slider("Περιθώριο Κέρδους (%)", 0, 100, 25)
        incoterm = st.selectbox("Incoterm", ["EXW (Εργοστάσιο)", "FOB (Λιμάνι)", "CIF (Παράδοση)"])
        dest = st.selectbox("Προορισμός", ["Ελλάδα", "Γερμανία", "USA", "Κίνα"])
        
    with c3:
        st.markdown("##### 3. Αποτελέσματα")
        if st.button("Υπολογισμός Τώρα 🚀", type="primary", use_container_width=True):
            # --- CALCULATIONS LOGIC ---
            # Βρίσκουμε τις τιμές από τα Dataframes
            oil_price = df_oils.loc[df_oils["Είδος"] == sel_oil, "Τιμή/Kg (€)"].values[0]
            oil_loss = df_oils.loc[df_oils["Είδος"] == sel_oil, "Φύρα (%)"].values[0]
            pack_cost = df_pack.loc[df_pack["Περιγραφή"] == sel_pack, "Κόστος Υλικών (€)"].values[0]
            
            # Απλοποιημένος υπολογισμός για το Demo
            volume = 500 # ml (υπόθεση)
            oil_cost_unit = ((volume * 0.916 / 1000) * oil_price) * (1 + oil_loss/100)
            full_cost = (oil_cost_unit + pack_cost) * (1 + overhead_rate/100)
            final_price = full_cost / (1 - margin/100)
            
            # --- DISPLAY RESULTS ---
            st.success(f"Προτεινόμενη Τιμή: €{final_price:.2f}")
            
            # Details Table
            res_df = pd.DataFrame({
                "Στοιχείο": ["Κόστος Λαδιού", "Υλικά Συσκευασίας", "Γενικά Έξοδα", "Περιθώριο Κέρδους"],
                "Ποσό (€)": [oil_cost_unit, pack_cost, full_cost*overhead_rate/100, final_price - full_cost]
            })
            st.dataframe(res_df, use_container_width=True)
            
            # Bar Chart Breakdown
            fig_bar = px.bar(res_df, x="Στοιχείο", y="Ποσό (€)", title="Ανάλυση Τιμής", color="Στοιχείο")
            st.plotly_chart(fig_bar, use_container_width=True)

# --- TAB 3: DATABASE (Η ΔΙΑΧΕΙΡΙΣΗ) ---
with tab3:
    st.subheader("🗃️ Διαχείριση Δεδομένων (Live Edit)")
    st.info("Εδώ βλέπεις τα δεδομένα που τραβάμε από το Excel/Database. Μπορείς να τα φιλτράρεις ή να τα κατεβάσεις.")
    
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Βάση Δεδομένων Ελαιολάδων**")
        edited_oils = st.data_editor(df_oils, num_rows="dynamic") # Επιτρέπει επεξεργασία!
    
    with c2:
        st.markdown("**Βάση Δεδομένων Συσκευασιών**")
        st.dataframe(df_pack)
