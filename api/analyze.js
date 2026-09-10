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
제공된 근로계약서 이미지를 분석해 근로자에게 발생할 수 있는 독소 조항과 불이익을 마크다운 형식으로 작성해라.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    
    // API가 에러 상태코드를 반환한 경우 처리
    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data.error) || 'Gemini API 호출 실패';
      return res.status(response.status).json({ error: errorMessage });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || '서버 내부 오류' });
  }
}
