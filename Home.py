import streamlit as st

st.set_page_config(
    page_title="Vietnamese Sign Language",
    page_icon="🤟",
    layout="wide"
)

# Custom CSS for navbar
st.markdown("""
<style>
#MainMenu, footer, header {visibility: hidden;}
.custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 3rem;
    background-color: #f9f7f3;
    border-bottom: 1px solid #e0dcd4;
}
.logo {
    font-size: 1.6rem;
    font-weight: 700;
    color: #2c2416;
}
.nav-links a {
    margin-left: 2rem;
    text-decoration: none;
    color: #5c5347;
    font-weight: 500;
    transition: 0.3s;
}
.nav-links a:hover {
    color: #2c2416;
}
</style>

<div class="custom-header">
    <div class="logo">Vietnamese Sign Language</div>
    <div class="nav-links">
        <a href="/Home" target="_self">🏠 Home</a>
        <a href="/Course" target="_self">📘 Courses</a>
        <a href="/Practice" target="_self">✋ Practice</a>
        <a href="/Achievement" target="_self">🏆 Achievement</a>
        <a href="/Profile" target="_self">👤 Profile</a>
    </div>
</div>
""", unsafe_allow_html=True)

# Home content
st.title("Welcome to Vietnamese Sign Language Learning Platform")
st.write("Empowering communication through hand signs. Choose a section above to begin your journey!")
st.image("https://upload.wikimedia.org/wikipedia/commons/4/4f/Sign_language_alphabet.png", use_column_width=True)
