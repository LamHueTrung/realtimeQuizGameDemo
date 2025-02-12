import React, { useEffect, useState } from "react";
import socket from "./socket";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [players, setPlayers] = useState({});
  const [question, setQuestion] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("updatePlayers", (playersData) => {
      setPlayers(playersData);
    });

    socket.on("newQuestion", (questionData) => {
      setQuestion(questionData);
      setTimeLeft(10);
    });

    socket.on("playerFinished", (playerId) => {
      if (playerId === socket.id) {
        setGameOver(true);
      }
    });

    socket.on("updateScores", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("chatMessage", (msg) => {
      setChatHistory((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("updatePlayers");
      socket.off("newQuestion");
      socket.off("playerFinished");
      socket.off("updateScores");
      socket.off("chatMessage");
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      requestQuestion();
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, question]);

  const joinGame = () => {
    if (playerName.trim() && !hasJoined) {
      socket.emit("joinGame", playerName);
      setHasJoined(true);
    }
  };

  const requestQuestion = () => {
    if (hasJoined && !gameOver) {
      socket.emit("requestQuestion");
    }
  };

  const submitAnswer = (answer) => {
    if (question && hasJoined && !gameOver) {
      socket.emit("answerQuestion", {
        playerId: socket.id,
        questionId: question.id,
        answer,
      });
  
      setSelectedAnswer(answer);
      setIsCorrect(answer === question.answer);
  
      const sound = new Audio(answer === question.answer ? "/sound/correct.mp3" : "/sound/wrong.mp3");
      sound.play();
  
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        socket.emit("checkCompletion", { playerId: socket.id });
      }, 2000);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chatMessage", { player: playerName, message });
      setMessage("");
    }
  };

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-primary">Real-time Quiz Game</h1>
      {!hasJoined ? (
        <div className="mt-4">
          <input
            type="text"
            className="form-control w-75 mx-auto"
            placeholder="Nhập tên..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="btn btn-success mt-3 w-50" onClick={joinGame}>Tham gia</button>
        </div>
      ) : gameOver ? (
        <div className="mt-4">
          <h2 className="text-danger">Bạn đã hoàn thành game</h2>
          <h2 className="mt-5">Bảng điểm</h2>
          <ul className="list-group w-75 mx-auto">
            {Object.values(players)
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between">
                  <span className="fw-bold">#{index + 1} {player.name}</span>
                  <span className="badge bg-primary rounded-pill">{player.score} điểm</span>
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4">
          {question ? (
            <div className="card p-3 shadow-lg mx-auto" style={{ maxWidth: '90%', width: '500px' }}>
              <h2 className="mb-3">{question.question}</h2>
              <p className="text-danger">⏳ {timeLeft} giây</p>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`btn w-100 my-2 ${selectedAnswer === option ? (isCorrect ? "btn-success" : "btn-danger") : "btn-outline-primary"}`}
                  onClick={() => submitAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <button className="btn btn-info w-75" onClick={requestQuestion}>Lấy câu hỏi</button>
          )}
          <h2 className="mt-5">Chat</h2>
          <div className="chat-box border rounded p-3 mx-auto" style={{ maxWidth: '90%', width: '500px' }}>
            <ul className="list-unstyled">
              {chatHistory.map((msg, index) => (
                <li key={index}><strong>{msg.player}:</strong> {msg.message}</li>
              ))}
            </ul>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="btn btn-primary" onClick={sendMessage}>Gửi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;