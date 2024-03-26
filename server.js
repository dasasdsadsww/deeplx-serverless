const express = require('express');
const bodyParser = require('body-parser');
const { translate } = require('./translate');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 7860;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

let delay = 0; 
const delayIncrement = 100; 
const maxDelay = 5000; 

if (fs.existsSync('delay.txt')) {
  delay = parseInt(fs.readFileSync('delay.txt', 'utf8'));
}

app.post('/translate', async (req, res) => {
  const { text, source_lang, target_lang } = req.body;

  try {
    await new Promise(resolve => setTimeout(resolve, delay));

    const result = await translate(text, source_lang, target_lang);
    const responseData = {
      alternatives: result.alternatives,
      code: 200,
      data: result.text,
      id: Math.floor(Math.random() * 10000000000),
      method: 'Free',
      source_lang,
      target_lang,
    };
    res.json(responseData);
  } catch (error) {
    if (error.response && error.response.status === 429) {

      delay += delayIncrement;
      if (delay > maxDelay) {
        delay = maxDelay;
      }
      fs.writeFileSync('delay.txt', delay.toString());
      console.log(`429 에러 발생. 딜레이 증가: ${delay}ms`);
    }
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});