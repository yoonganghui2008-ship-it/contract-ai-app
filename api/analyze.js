export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel에 GEMINI_API_KEY가 설정되지 않았습니다.' });
  }

  const systemPrompt = `너는 대한민국 근로자의 권익을 극도로 보호하는 20년 경력의 베테랑 전문 노무사다.
제공된 근로계약서 이미지를 신중히 읽고, 근로자에게 발생할 수 있는 모든 독소 조항과 구체적인 불이익을 찾아내어 보고서 형태로 작성하라.

반드시 다음 형식(Markdown)으로 답변해라:

### 📊 종합 위험도 평가
- **위험 등급**: [안전 / 주의 / 위험 / 극도로 위험] 중 선택
- **한 줄 요약**: 핵심 위험 요소 한 줄 정리

---

### 🚨 1. 치명적 법 위반 및 고위험 독소 조항 (최우선 확인)
- **발견된 조항**: "계약서 내용 인용"
- **근로자 불리점**: 근로자가 실제로 입게 될 금전적/법적 피해 및 불이익 설명

---

### ⚠️ 2. 숨겨진 독소 조항 및 불리한 조건
- **발견된 조항**: "계약서 내용 인용"
- **근로자 불리점**: 나중에 퇴사하거나 일할 때 당할 수 있는 억울한 상황 설명

---

### 💡 3. 계약 체결 전 사업주에게 요구해야 할 수정 사항
1. (수정을 요구해야 할 정확한 문구 제시)

---

### 🛡️ 4. AI 노무사의 최종 대처 조언`;

  try {
    // 확실하게 gemini-2.0-flash 명시
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data.error) || 'Gemini API 호출 실패';
      return res.status(response.status).json({ error: errorMessage });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || '서버 내부 오류' });
  }
}
