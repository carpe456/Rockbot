import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChatBot.css';
import { MessageSquare, Moon, Sun, Send, User, Briefcase, Coffee } from 'lucide-react';

interface ProfileInfo {
  name: string;
  department: string;
  position: string;
  password?: string;
}

const ChatBot: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: string; message: string }>>([
    { sender: 'bot', message: '무엇을 도와드릴까요?' },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<string>('업무');
  const [showProfileSettings, setShowProfileSettings] = useState<boolean>(false);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    name: '',
    department: '',
    position: '',
  });

  const navigate = useNavigate(); // useNavigate 훅 추가

  useEffect(() => {
    // localStorage에서 사용자 정보 불러오기
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setProfileInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    const newChatHistory = [...chatHistory, { sender: 'user', message: question }];
    setChatHistory(newChatHistory);

    try {
      // Flask 서버에 질문을 보냅니다.
      const response = await axios.post('http://localhost:5000/ask', {
        question: question,
      });

      // 서버의 응답을 받아 chatHistory에 추가합니다.
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'bot', message: response.data.answer }, // 서버에서 받아온 응답 사용
      ]);
    } catch (error) {
      // 서버와의 연결이 실패했을 경우
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'bot', message: '응답을 가져오는 데 실패했습니다.' },
      ]);
    } finally {
      setIsLoading(false);
    }
    setQuestion('');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleModeChange = () => {
    const newMode = currentMode === '휴가' ? '업무' : '휴가';
    setCurrentMode(newMode);
    setChatHistory([{ sender: 'bot', message: `${newMode} 모드로 전환되었습니다. 무엇을 도와드릴까요?` }]);
  };

  const toggleProfileSettings = () => {
    setShowProfileSettings(!showProfileSettings);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-dark-mode text-light' : 'bg-light-mode text-dark'}`}>
      {/* 사이드바 */}
      <div className="sidebar-container">
        <div className="profile-container mb-4">
          <h2 className="profile-name">{profileInfo.name}</h2>
          <p className="profile-department">
            {profileInfo.department} - {profileInfo.position}
          </p>
        </div>
        <button onClick={toggleProfileSettings} className="button profile-settings-button">
          <User size={16} className="icon-spacing" /> 비밀번호 변경
        </button>
        <button onClick={handleModeChange} className="button mode-toggle-button">
          {currentMode === '업무' ? (
            <Coffee size={16} className="icon-spacing" />
          ) : (
            <Briefcase size={16} className="icon-spacing" />
          )}
          {currentMode === '업무' ? '휴가 모드로 전환' : '업무 모드로 전환'}
        </button>
        <button onClick={toggleDarkMode} className="button dark-mode-toggle-button">
          {darkMode ? <Sun size={16} className="icon-spacing" /> : <Moon size={16} className="icon-spacing" />}
          {darkMode ? '라이트 모드' : '다크 모드'}
        </button>
        <button onClick={() => navigate('/signin')} className="button navigate-button">
          <MessageSquare size={16} className="icon-spacing" /> 로그인 페이지로 이동
        </button>
      </div>

      {/* 대화창 */}
      <div className="chat-window-container">
        <div className="chat-header-container">
          <h2 className="chat-header-title">{currentMode} 모드</h2>
        </div>
        {showProfileSettings && (
          <div className="profile-settings-container">
            <h3 className="profile-settings-header">비밀번호 변경</h3>
            <input
              type="password"
              value={profileInfo.password || ''}
              onChange={(e) => setProfileInfo({ ...profileInfo, password: e.target.value })}
              className="input-field-password"
              placeholder="변경하실 비밀번호를 입력하세요"
            />
            <button onClick={toggleProfileSettings} className="button profile-settings-save-button">
              저장
            </button>
          </div>
        )}

        <div className="chat-messages-container">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`message-container ${chat.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className={`message-bubble ${chat.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>{
                chat.message
              }</div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <div className="input-group">
            <input
              type="text"
              value={question}
              onChange={handleInputChange}
              className="input-field chat-input"
              placeholder="질문을 입력하세요..."
              disabled={isLoading}
            />
            <button onClick={handleSend} className="button send-button" disabled={isLoading}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
