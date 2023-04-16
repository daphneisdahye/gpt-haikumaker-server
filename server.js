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
  const page = Number(req.query.page) || 1; // default 1
  const pageSize = Number(req.query.limit) || 9; // default 9

  models.Haiku.count().then((count) => {
    const totalPages = Math.ceil(count / pageSize);
    return models.Haiku.findAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [["id", "DESC"]],
    })
      .then((result) => {
        console.log("HAIKUS: ", result);
        res.send({
          haikus: result,
          totalPages,
        });
      })
      .catch((error) => {
        console.error(error);
        res.send("error");
      });
  });
});

app.delete("/haikus/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  const delPageSize = 9;

  models.Haiku.findOne({
    where: {
      id,
    },
  })
    .then((result) => {
      models.Haiku.destroy({
        where: {
          id,
        },
      })
        .then(() => {
          models.Haiku.count().then((count) => {
            const delTotalPages = Math.ceil(count / delPageSize);
            res.send({
              result: true,
              totalPages: delTotalPages,
            });
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("エラーが発生しました。");
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("エラーが発生しました。");
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

app.post("/admin", (req, res) => {
  const body = req.body;
  const { password } = body;


  if (!password) {
    res.status(400).send("Please fill out all fields.");
  }

  if (password === process.env.PASSWORD) {
    res.status(200).json({ password_check: true });
  } else {
    res.status(401).json({ password_check: false, message: password });
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
