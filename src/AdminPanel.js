import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [questionsList, setQuestionsList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/admin/questions")
      .then((response) => setQuestionsList(response.data))
      .catch((error) => console.error("Lỗi khi lấy danh sách câu hỏi:", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer || options.some(opt => opt === "")) {
      alert("Vui lòng nhập đầy đủ thông tin câu hỏi.");
      return;
    }

    const newQuestion = { question, options, answer };

    try {
      await axios.post("http://localhost:5000/admin/add-question", newQuestion);
      alert("Câu hỏi đã được thêm!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setAnswer("");
      setQuestionsList([...questionsList, newQuestion]);
    } catch (error) {
      console.error("Lỗi khi thêm câu hỏi:", error);
      alert("Không thể thêm câu hỏi.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Admin Panel - Quản lý Câu Hỏi</h2>

      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Câu hỏi:</label>
          <input type="text" className="form-control" value={question} onChange={(e) => setQuestion(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Các phương án trả lời:</label>
          {options.map((opt, index) => (
            <input
              key={index}
              type="text"
              className="form-control mb-2"
              placeholder={`Đáp án ${index + 1}`}
              value={opt}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              required
            />
          ))}
        </div>

        <div className="mb-3">
          <label className="form-label">Đáp án đúng:</label>
          <input type="text" className="form-control" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
        </div>

        <button type="submit" className="btn btn-primary w-100">Thêm câu hỏi</button>
      </form>

      <h3 className="mt-5">Danh sách câu hỏi</h3>
      <ul className="list-group">
        {questionsList.map((q, index) => (
          <li key={index} className="list-group-item">
            {q.question} - <strong>{q.answer}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
