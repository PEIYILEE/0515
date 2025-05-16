<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8" />
    <title>語音轉文字 + ChatGPT 回應</title>
    <style>
        body {
            font-family: "Segoe UI", sans-serif;
            background: linear-gradient(to bottom right, #ffeef0, #e8f3fc);
            padding: 40px;
            text-align: center;
        }

        button {
            font-size: 1.2em;
            padding: 10px 20px;
            border: none;
            background-color: #007bff;
            color: white;
            border-radius: 8px;
            cursor: pointer;
        }

            button.recording {
                background-color: #dc3545;
            }

        .status {
            margin-top: 20px;
            font-weight: bold;
            color: #333;
        }

        .box {
            margin-top: 30px;
            padding: 20px;
            border-radius: 10px;
            background: #fff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 600px;
            margin: auto;
            text-align: left;
            white-space: pre-wrap;
        }

        .label {
            font-weight: bold;
            margin-bottom: 5px;
            color: #555;
        }
    </style>
</head>
<body>
    <h1>🎤 語音辨識 + ChatGPT 回應</h1>
    <button id="startBtn">開始語音辨識</button>
    <div id="statusDisplay" class="status">等待中...</div>

    <div class="box">
        <div class="label">📝 語音轉文字：</div>
        <div id="inputDisplay"></div>
    </div>

    <div class="box">
        <div class="label">🤖 ChatGPT 回應：</div>
        <div id="outputDisplay"></div>
    </div>

    <script>
        <-- 替換這行
        const API_URL = "https://api.openai.com/v1/chat/completions";

        class VoiceChatApp {
            constructor() {
                this.initElements();
                this.initRecognition();
            }

            initElements() {
                this.startBtn = document.getElementById("startBtn");
                this.statusDisplay = document.getElementById("statusDisplay");
                this.inputDisplay = document.getElementById("inputDisplay");
                this.outputDisplay = document.getElementById("outputDisplay");

                this.startBtn.addEventListener("click", () => this.toggleRecognition());
            }

            initRecognition() {
                const SpeechRecognition =
                    window.SpeechRecognition || window.webkitSpeechRecognition;

                if (!SpeechRecognition) {
                    this.showError("瀏覽器不支援語音辨識，請使用 Chrome。");
                    return;
                }

                this.recognition = new SpeechRecognition();
                this.recognition.lang = "zh-TW";
                this.recognition.interimResults = true;
                this.recognition.continuous = false;

                this.recognition.onstart = () => {
                    this.updateStatus("🎙️ 語音辨識中...");
                    this.startBtn.classList.add("recording");
                };

                this.recognition.onend = () => {
                    this.updateStatus("🛑 辨識結束");
                    this.startBtn.classList.remove("recording");
                };

                this.recognition.onerror = (e) => {
                    this.showError(`語音辨識錯誤：${e.error}`);
                };

                this.recognition.onresult = (e) => {
                    const transcript = Array.from(e.results)
                        .map((r) => r[0].transcript)
                        .join("");
                    this.inputDisplay.textContent = transcript;

                    if (e.results[0].isFinal) {
                        this.queryOpenAI(transcript);
                    }
                };
            }

            toggleRecognition() {
                if (!this.recognition) return;

                if (this.startBtn.classList.contains("recording")) {
                    this.recognition.stop();
                } else {
                    this.inputDisplay.textContent = "";
                    this.outputDisplay.textContent = "";
                    this.recognition.start();
                }
            }

            async queryOpenAI(prompt) {
                try {
                    this.updateStatus("🤖 ChatGPT 回應中...");
                    console.log("傳送內容：", prompt);

                    const response = await fetch(API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + OPENAI_API_KEY,
                        },
                        body: JSON.stringify({
                            model: "gpt-3.5-turbo",
                            messages: [
                                { role: "system", content: "你是一個友善的中文助理。" },
                                { role: "user", content: prompt },
                            ],
                            temperature: 0.7,
                        }),
                    });

                    const result = await response.json();
                    console.log("OpenAI 回傳內容：", result);

                    const reply =
                        result.choices?.[0]?.message?.content || "❌ 沒有取得回覆";
                    this.outputDisplay.textContent = reply;
                    this.updateStatus("✅ 完成");
                } catch (err) {
                    this.showError("OpenAI API 錯誤：" + err.message);
                    console.error("❌ OpenAI 錯誤：", err);
                }
            }

            updateStatus(msg) {
                this.statusDisplay.textContent = msg;
            }

            showError(errMsg) {
                this.statusDisplay.textContent = `❗ ${errMsg}`;
                console.error(errMsg);
            }
        }

        document.addEventListener("DOMContentLoaded", () => {
            new VoiceChatApp();
        });
    </script>
</body>
</html>