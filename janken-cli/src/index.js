// ① 必要な機能を読み込む（ファイルの先頭に書く）
import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
// ② .env を読み込む（dotenv 不要）
process.loadEnvFile()
// ③ じゃんけんのルール
const losingHandMap = {
    rock: "scissors"
    ,
    scissors: "paper"
    ,
    paper: "rock"
    ,
}
function getAiHand(userHand) {
    return losingHandMap[userHand]
}
const handLabels = {
    rock: "グー"
    ,
    scissors: "チョキ"
    ,
    paper: "パー"
    ,
}
    // handLabels のキーの並び順を使う → 
    ["rock","scissors", "paper"]
const hands = Object.keys(handLabels)
async function getExcuse(userHand, aiHand, round, history) {
    const systemPrompt = `
あなたはじゃんけんで負け続けるAIです。
負けを素直に認めず、無理矢理な言い訳をしてください。
ただし5回目は負けを認めてください。
返答は日本語で2文以内にしてください。
`
    const userPrompt = `
今回のユーザーの手: ${handLabels[userHand]}
今回のAIの手: ${handLabels[aiHand]}
現在の負け回数: ${round}
過去の言い訳:
${history.join("\n")}
まだ使っていない言い訳を考えてください。
`
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions"
        , {
            method: "POST"
            ,
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
                ,
                "X-OpenRouter-Title": "Janken Excuse CLI"
                ,
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL,
                messages: [
                    {
                        role: "system"
                        , content: systemPrompt
                    },
                    {
                        role: "user"
                        , content: userPrompt
                    },
                ],
            }),
        })
    const data = await response.json()
    const message = data.choices?.[0]?.message?.content
    return message ?? "サーバーの調子が悪かったのでノーカンでお願いします。"
}

const rl = readline.createInterface({ input, output })
let round = 0 // 何回目のじゃんけんか
const history = [] // 言い訳の履歴
while (round < 5) {
    const answer = await rl.question("手を選んでください (1:グー 2:チョキ 3:パー): ")
    const userHand = hands[Number(answer) - 1]
    if (!userHand) { console.log("1〜3 で入力してください。"); continue }
    round++
    const aiHand = getAiHand(userHand)
    console.log(`あなた: ${handLabels[userHand]} / AI: ${handLabels[aiHand]} → あなたの勝ち！`)
    // ここで言い訳を取得して表示する（次のスライド）
    try {
        console.log("AIが言い訳を考えています...")
        const excuse = await getExcuse(userHand, aiHand, round, history)
        console.log(`AI: ${excuse}`)
        history.push(excuse)
    } catch (error) {
        console.log("通信に失敗しました。もう一度試してください。")
    }

}
console.log("AI: 完敗です…あなたの勝ちを認めます。")
rl.close()