import streamlit as st
import pandas as pd
from datetime import datetime

# 1. 페이지 설정 (화면을 넓게 쓰고 제목을 정합니다)
st.set_page_config(page_title="백춘황의 9대운 주역일진", layout="wide")
st.title("🔮 백춘황 원장의 '9대 항목' 주역 일진")

# 2. 데이터 불러오기 (주역.csv 파일을 읽어옵니다)
@st.cache_data
def load_data():
    try:
        # 바탕화면에 만드신 '주역.csv'를 깃허브에서 찾아 읽습니다.
        df = pd.read_csv('-', encoding='utf-8')
        return df
    except Exception as e:
        st.error("⚠️ '주역.csv' 파일을 찾을 수 없습니다. 깃허브에 파일이 있는지 확인해주세요.")
        return None

# 3. 주역 괘 산출 로직 (대표님 공식: 형의 숫자를 상괘로 정함)
def get_today_gua():
    now = datetime.now()
    # 천(1) 택(2) 화(3) 뢰(4) 풍(5) 수(6) 산(7) 지(0)
    trigrams = {1: "천", 2: "택", 3: "화", 4: "뢰", 5: "풍", 6: "수", 7: "산", 0: "지"}
    
    # [대표님 공식 적용] 오늘 날짜 숫자를 활용한 예시 계산
    # 실제 성함이나 특정 숫자가 입력되면 이 부분이 더 정교해집니다.
    upper_idx = (now.year + now.month) % 8  # 형(亨)의 개념을 적용한 상괘
    lower_idx = now.day % 8                 # 하괘
    
    upper = trigrams[upper_idx]
    lower = trigrams[lower_idx]
    return upper + lower

# --- 메인 실행 엔진 ---
db = load_data()
gua_name = get_today_gua()
today_date = datetime.now().strftime('%Y년 %m월 %d일')

st.write(f"### 📅 오늘은 {today_date} | 오늘의 기운은 **[{gua_name}]** 괘입니다.")
st.write("---")

if db is not None:
    # 1열(괘이름)에서 오늘 산출된 괘와 일치하는 행을 찾습니다.
    result = db[db.iloc[:, 0].str.contains(gua_name, na=False)]
    
    if not result.empty:
        # 2열(해설)에 있는 9대 항목 내용을 가져옵니다.
        description = str(result.iloc[0, 1])
        st.subheader(f"🚩 오늘의 괘: {result.iloc[0, 0]}")
        
        st.markdown("#### [백춘황 원장의 9대 항목별 상세운세]")
        
        # 화면을 3개 구역으로 나누어 9개 항목을 보기 좋게 배치합니다.
        col1, col2, col3 = st.columns(3)
        
        # 해설 내용이 슬래시(/)나 콤마(,)로 구분되어 있다고 가정하고 나눕니다.
        items = description.split('/') if '/' in description else description.split(',')
        
        for i, item in enumerate(items[:9]): # 딱 9번 항목까지만 표시
            if i % 3 == 0:
                col1.info(f"**{item.strip()}**")
            elif i % 3 == 1:
                col2.success(f"**{item.strip()}**")
            else:
                col3.warning(f"**{item.strip()}**")
    else:
        st.warning(f"오늘의 괘 [{gua_name}]에 대한 상세 해설 데이터를 찾을 수 없습니다. 주역.csv를 확인해주세요.")

st.write("---")
st.caption("© 2026 백춘황 성명학 연구소 | 주역 9대 항목 운세 시스템")
