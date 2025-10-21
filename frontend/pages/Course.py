import streamlit as st

# Page configuration
st.set_page_config(
    page_title="Courses - Vietnamese Sign Language",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for elegant styling (matching homepage)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
    
    .stApp {
        background-color: #FAF7F2;
    }
    
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    .custom-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem 4rem;
        background-color: #FAF7F2;
    }
    
    .logo {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.5rem;
        font-weight: 600;
        color: #2C2416;
        letter-spacing: 0.5px;
    }
    
    .page-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 4rem;
        font-weight: 300;
        color: #2C2416;
        text-align: center;
        margin: 3rem 0 1rem 0;
        letter-spacing: -1px;
    }
    
    .page-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 1.2rem;
        color: #5C5347;
        text-align: center;
        margin-bottom: 4rem;
        font-weight: 300;
    }
    
    .section-header {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2.5rem;
        font-weight: 400;
        color: #2C2416;
        margin: 3rem 0 2rem 0;
        padding-bottom: 1rem;
        border-bottom: 2px solid #D4A574;
        letter-spacing: -0.5px;
    }
    
    .word-card {
        background-color: #FFFFFF;
        padding: 2rem;
        border-radius: 4px;
        border: 1px solid #E8E3D8;
        transition: all 0.3s ease;
        height: 100%;
        cursor: pointer;
    }
    
    .word-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(44, 36, 22, 0.1);
        border-color: #D4A574;
    }
    
    .word-vietnamese {
        font-family: 'Inter', sans-serif;
        font-size: 1.5rem;
        font-weight: 600;
        color: #2C2416;
        margin-bottom: 0.5rem;
    }
    
    .word-english {
        font-family: 'Inter', sans-serif;
        font-size: 1.1rem;
        color: #5C5347;
        font-weight: 300;
        margin-bottom: 1rem;
    }
    
    .word-description {
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        color: #7A7165;
        line-height: 1.6;
        font-style: italic;
    }
    
    .category-badge {
        display: inline-block;
        background-color: #D4A574;
        color: #FAF7F2;
        padding: 0.5rem 1rem;
        border-radius: 2px;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 1rem;
    }
    
    .alphabet-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }
    
    .alphabet-card {
        background-color: #FFFFFF;
        padding: 2rem 1rem;
        border-radius: 4px;
        border: 1px solid #E8E3D8;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .alphabet-card:hover {
        transform: scale(1.05);
        border-color: #D4A574;
        box-shadow: 0 4px 12px rgba(44, 36, 22, 0.1);
    }
    
    .alphabet-letter {
        font-family: 'Cormorant Garamond', serif;
        font-size: 3rem;
        font-weight: 500;
        color: #2C2416;
        margin-bottom: 0.5rem;
    }
    
    .alphabet-label {
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        color: #5C5347;
        font-weight: 400;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="custom-header">
    <div class="logo">Vietnamese Sign Language</div>
</div>
""", unsafe_allow_html=True)

# Page Title
st.markdown("""
<h1 class="page-title">Learning Courses</h1>
<p class="page-subtitle">Master Vietnamese Sign Language through structured lessons and practice</p>
""", unsafe_allow_html=True)

# Alphabet Section
st.markdown('<h2 class="section-header">Vietnamese Alphabet</h2>', unsafe_allow_html=True)
st.markdown('<p class="page-subtitle">Learn the fingerspelling alphabet - the foundation of sign language</p>', unsafe_allow_html=True)

alphabet_letters = [
    ('A', 'a'), ('Ă', 'ă'), ('Â', 'â'), ('B', 'b'), ('C', 'c'), ('D', 'd'),
    ('Đ', 'đ'), ('E', 'e'), ('Ê', 'ê'), ('G', 'g'), ('H', 'h'), ('I', 'i'),
    ('K', 'k'), ('L', 'l'), ('M', 'm'), ('N', 'n'), ('O', 'o'), ('Ô', 'ô'),
    ('Ơ', 'ơ'), ('P', 'p'), ('Q', 'q'), ('R', 'r'), ('S', 's'), ('T', 't'),
    ('U', 'u'), ('Ư', 'ư'), ('V', 'v'), ('X', 'x'), ('Y', 'y')
]

st.markdown('<div class="alphabet-grid">', unsafe_allow_html=True)
cols = st.columns(6)
for idx, (upper, lower) in enumerate(alphabet_letters):
    with cols[idx % 6]:
        st.markdown(f"""
        <div class="alphabet-card">
            <div class="alphabet-letter">{upper}</div>
            <div class="alphabet-label">{lower}</div>
        </div>
        """, unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# Pronouns Section
st.markdown('<h2 class="section-header">Pronouns</h2>', unsafe_allow_html=True)

pronouns = [
    {"vn": "Tôi", "en": "I / Me", "desc": "First person singular - formal and neutral"},
    {"vn": "Bạn", "en": "You", "desc": "Second person singular - friendly and respectful"},
    {"vn": "Anh ấy", "en": "He / Him", "desc": "Third person masculine - older male"},
    {"vn": "Cô ấy", "en": "She / Her", "desc": "Third person feminine - young female"},
    {"vn": "Chúng tôi", "en": "We / Us", "desc": "First person plural - exclusive (not including listener)"},
    {"vn": "Chúng ta", "en": "We / Us", "desc": "First person plural - inclusive (including listener)"},
    {"vn": "Họ", "en": "They / Them", "desc": "Third person plural - group of people"},
    {"vn": "Mình", "en": "I / Me / You", "desc": "Informal pronoun used between close friends or couples"}
]

cols = st.columns(2)
for idx, pronoun in enumerate(pronouns):
    with cols[idx % 2]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{pronoun['vn']}</div>
            <div class="word-english">{pronoun['en']}</div>
            <div class="word-description">{pronoun['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Introduction Phrases Section
st.markdown('<h2 class="section-header">Introduction Phrases</h2>', unsafe_allow_html=True)

introductions = [
    {"vn": "Xin chào", "en": "Hello", "desc": "Standard greeting for any time of day"},
    {"vn": "Tên tôi là...", "en": "My name is...", "desc": "Introducing yourself"},
    {"vn": "Rất vui được gặp bạn", "en": "Nice to meet you", "desc": "Polite greeting when meeting someone new"},
    {"vn": "Bạn khỏe không?", "en": "How are you?", "desc": "Asking about someone's wellbeing"},
    {"vn": "Tôi khỏe, cảm ơn", "en": "I'm fine, thank you", "desc": "Responding to 'how are you'"},
    {"vn": "Bạn tên là gì?", "en": "What is your name?", "desc": "Asking someone's name"},
    {"vn": "Tôi đến từ...", "en": "I am from...", "desc": "Stating your origin or hometown"},
    {"vn": "Hẹn gặp lại", "en": "See you later", "desc": "Casual goodbye phrase"}
]

cols = st.columns(2)
for idx, phrase in enumerate(introductions):
    with cols[idx % 2]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{phrase['vn']}</div>
            <div class="word-english">{phrase['en']}</div>
            <div class="word-description">{phrase['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Adjectives Section
st.markdown('<h2 class="section-header">Common Adjectives</h2>', unsafe_allow_html=True)

adjectives = [
    {"vn": "Đẹp", "en": "Beautiful", "desc": "Describing something aesthetically pleasing"},
    {"vn": "Xấu", "en": "Ugly", "desc": "Describing something unattractive"},
    {"vn": "Lớn", "en": "Big / Large", "desc": "Describing size - large or significant"},
    {"vn": "Nhỏ", "en": "Small", "desc": "Describing size - tiny or little"},
    {"vn": "Tốt", "en": "Good", "desc": "Positive quality or condition"},
    {"vn": "Xấu", "en": "Bad", "desc": "Negative quality or condition"},
    {"vn": "Nóng", "en": "Hot", "desc": "High temperature or spicy"},
    {"vn": "Lạnh", "en": "Cold", "desc": "Low temperature or cool"},
    {"vn": "Nhanh", "en": "Fast / Quick", "desc": "High speed or rapid"},
    {"vn": "Chậm", "en": "Slow", "desc": "Low speed or gradual"},
    {"vn": "Cao", "en": "Tall / High", "desc": "Great height or elevation"},
    {"vn": "Thấp", "en": "Short / Low", "desc": "Little height or low position"}
]

cols = st.columns(3)
for idx, adj in enumerate(adjectives):
    with cols[idx % 3]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{adj['vn']}</div>
            <div class="word-english">{adj['en']}</div>
            <div class="word-description">{adj['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Topic-based Word Lists
st.markdown('<h2 class="section-header">Word Lists by Topic</h2>', unsafe_allow_html=True)

# Family Topic
st.markdown('<div class="category-badge">Family</div>', unsafe_allow_html=True)
family_words = [
    {"vn": "Gia đình", "en": "Family", "desc": "The entire family unit"},
    {"vn": "Bố / Ba", "en": "Father / Dad", "desc": "Male parent"},
    {"vn": "Mẹ / Ma", "en": "Mother / Mom", "desc": "Female parent"},
    {"vn": "Anh trai", "en": "Older brother", "desc": "Male sibling who is older"},
    {"vn": "Em trai", "en": "Younger brother", "desc": "Male sibling who is younger"},
    {"vn": "Chị gái", "en": "Older sister", "desc": "Female sibling who is older"},
    {"vn": "Em gái", "en": "Younger sister", "desc": "Female sibling who is younger"},
    {"vn": "Ông", "en": "Grandfather", "desc": "Male grandparent"},
    {"vn": "Bà", "en": "Grandmother", "desc": "Female grandparent"}
]

cols = st.columns(3)
for idx, word in enumerate(family_words):
    with cols[idx % 3]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{word['vn']}</div>
            <div class="word-english">{word['en']}</div>
            <div class="word-description">{word['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Food Topic
st.markdown('<div class="category-badge" style="margin-top: 3rem;">Food & Drink</div>', unsafe_allow_html=True)
food_words = [
    {"vn": "Cơm", "en": "Rice / Meal", "desc": "Cooked rice or a general meal"},
    {"vn": "Phở", "en": "Pho", "desc": "Traditional Vietnamese noodle soup"},
    {"vn": "Bánh mì", "en": "Bread / Sandwich", "desc": "Vietnamese baguette sandwich"},
    {"vn": "Nước", "en": "Water", "desc": "Drinking water or liquid"},
    {"vn": "Cà phê", "en": "Coffee", "desc": "Vietnamese coffee"},
    {"vn": "Trà", "en": "Tea", "desc": "Tea beverage"},
    {"vn": "Thịt", "en": "Meat", "desc": "Animal protein"},
    {"vn": "Rau", "en": "Vegetables", "desc": "Plant-based food"},
    {"vn": "Trái cây", "en": "Fruit", "desc": "Fresh fruits"}
]

cols = st.columns(3)
for idx, word in enumerate(food_words):
    with cols[idx % 3]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{word['vn']}</div>
            <div class="word-english">{word['en']}</div>
            <div class="word-description">{word['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Colors Topic
st.markdown('<div class="category-badge" style="margin-top: 3rem;">Colors</div>', unsafe_allow_html=True)
color_words = [
    {"vn": "Màu đỏ", "en": "Red", "desc": "The color red"},
    {"vn": "Màu xanh dương", "en": "Blue", "desc": "The color blue"},
    {"vn": "Màu xanh lá", "en": "Green", "desc": "The color green"},
    {"vn": "Màu vàng", "en": "Yellow", "desc": "The color yellow"},
    {"vn": "Màu cam", "en": "Orange", "desc": "The color orange"},
    {"vn": "Màu tím", "en": "Purple", "desc": "The color purple"},
    {"vn": "Màu trắng", "en": "White", "desc": "The color white"},
    {"vn": "Màu đen", "en": "Black", "desc": "The color black"},
    {"vn": "Màu hồng", "en": "Pink", "desc": "The color pink"}
]

cols = st.columns(3)
for idx, word in enumerate(color_words):
    with cols[idx % 3]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{word['vn']}</div>
            <div class="word-english">{word['en']}</div>
            <div class="word-description">{word['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Numbers Topic
st.markdown('<div class="category-badge" style="margin-top: 3rem;">Numbers</div>', unsafe_allow_html=True)
number_words = [
    {"vn": "Không / Số không", "en": "Zero", "desc": "The number 0"},
    {"vn": "Một", "en": "One", "desc": "The number 1"},
    {"vn": "Hai", "en": "Two", "desc": "The number 2"},
    {"vn": "Ba", "en": "Three", "desc": "The number 3"},
    {"vn": "Bốn", "en": "Four", "desc": "The number 4"},
    {"vn": "Năm", "en": "Five", "desc": "The number 5"},
    {"vn": "Sáu", "en": "Six", "desc": "The number 6"},
    {"vn": "Bảy", "en": "Seven", "desc": "The number 7"},
    {"vn": "Tám", "en": "Eight", "desc": "The number 8"},
    {"vn": "Chín", "en": "Nine", "desc": "The number 9"},
    {"vn": "Mười", "en": "Ten", "desc": "The number 10"},
    {"vn": "Trăm", "en": "Hundred", "desc": "The number 100"}
]

cols = st.columns(3)
for idx, word in enumerate(number_words):
    with cols[idx % 3]:
        st.markdown(f"""
        <div class="word-card">
            <div class="word-vietnamese">{word['vn']}</div>
            <div class="word-english">{word['en']}</div>
            <div class="word-description">{word['desc']}</div>
        </div>
        """, unsafe_allow_html=True)

# Footer spacing
st.markdown('<div style="height: 4rem;"></div>', unsafe_allow_html=True)
