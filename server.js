const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const port = 8080;
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(cors());

async function createJapaneseHaiku(promptWords) {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `日本語で"${promptWords}"という言葉を含む短い俳句を3行で作成してください:`,
      temperature: 0.7,
      max_tokens: 50,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return completion.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error in createJapaneseHaiku:", error);
    throw error;
  }
}

app.use(express.json());
app.use(cors());

app.get("/haikus", (req, res) => {
  models.Haiku.findAll({
    order: [["id", "DESC"]],
  })
    .then((result) => {
      console.log("HAIKUS: ", result);
      res.send({
        haikus: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("error");
    });
});

app.post("/haikus", async (req, res) => {
  const body = req.body;
  const { author, words, color1, color2 } = body;

  if (!author || !words) {
    res.status(400).send("Please fill out all fields.");
  }

  try {
    const content = await createJapaneseHaiku(words);

    models.Haiku.create({
      author,
      words,
      content,
      color1,
      color2,
    })
      .then((result) => {
        console.log("result : ", result);
        res.send({
          result,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(400).send("An error occurred.");
      });
  } catch (err) {
    console.error(err);
    res.status(400).send("An error occurred while generating the haiku.");
  }
});

app.listen(port, () => {
  console.log("サーバーが稼働しています。");
  models.sequelize
    .sync()
    .then(() => {
      console.log("DB接続成功！");
    })
    .catch((err) => {
      console.error(err);
      console.log("DB接続エラー");
      //DB연결 실패 시 종료
      //DB接続失敗時に終了
      process.exit();
    });
});
