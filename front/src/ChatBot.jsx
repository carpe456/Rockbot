import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatBot.css';
import { MessageSquare, Settings, Moon, Sun, Send, UserRoundCog, Briefcase, Coffee } from 'lucide-react';

const ChatBot = () => {
  const [question, setQuestion] = useState(''); // 입력된 질문 상태 관리
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', message: '무엇을 도와드릴까요?' }
  ]); // 채팅 기록 상태 관리
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [darkMode, setDarkMode] = useState(false); // 다크 모드 상태 관리
  const [currentMode, setCurrentMode] = useState('업무'); // 현재 모드 상태 관리
  const [showProfileSettings, setShowProfileSettings] = useState(false); // 프로필 설정 표시 여부 상태 관리
  const [profileInfo, setProfileInfo] = useState({
    name: '',
    department: '',
    position: ''
  }); // 사용자 정보 상태 관리

  useEffect(() => {
    // localStorage에서 사용자 정보 불러오기
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setProfileInfo(JSON.parse(storedUserInfo)); // 사용자 정보 설정
    }
  }, []);

  const handleInputChange = (e) => {
    setQuestion(e.target.value); // 입력된 질문 값 업데이트
  };

  // 질문 전송 및 서버와의 통신
  const handleSend = async () => {
    if (!question.trim()) return; // 빈 질문일 경우 전송하지 않음
  
    setIsLoading(true); // 로딩 상태로 전환
    const newChatHistory = [...chatHistory, { sender: 'user', message: question }]; // 새로운 질문 추가
    setChatHistory(newChatHistory); // 채팅 기록 업데이트
    
    try {
      // 서버에 질문 전송
      const response = await axios.post('http://localhost:5000/ask', {
        question: question,
        // 수정된 부분: Authorization 헤더 추가
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } // JWT 토큰 추가
      });
  
      // 서버의 응답을 받아 chatHistory에 추가
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'bot', message: response.data.answer }, // 서버에서 받아온 응답 추가
      ]);
    } catch (error) {
      // 서버와의 연결 실패 시 오류 메시지 추가
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'bot', message: '응답을 가져오는 데 실패했습니다.' },
      ]);
    } finally {
      setIsLoading(false); // 로딩 상태 해제
    }
    setQuestion(''); // 질문 입력창 초기화
  };

  const toggleDarkMode = () => setDarkMode(!darkMode); // 다크 모드 전환

  const handleModeChange = () => {
    const newMode = currentMode === '휴가' ? '업무' : '휴가'; // 모드 전환
    setCurrentMode(newMode); // 새로운 모드로 업데이트
    setChatHistory([{ sender: 'bot', message: `${newMode} 모드로 전환되었습니다. 무엇을 도와드릴까요?` }]); // 모드 전환 메시지 추가
  };

  const toggleProfileSettings = () => {
    setShowProfileSettings(!showProfileSettings); // 프로필 설정 표시 여부 토글
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-dark-mode text-light' : 'bg-light-mode text-dark'}`}>
      {/* 사이드바 */}
      <div className="sidebar-container">
        <div className="profile-container mb-4">
          <h2 className="profile-name">{profileInfo.name}</h2>
          <p className="profile-department">{profileInfo.department} - {profileInfo.position}</p>
        </div>
        <button
          onClick={toggleProfileSettings}
          className="button profile-settings-button"
        >
          <UserRoundCog size={16} className="icon-spacing" />
          비밀번호 변경
        </button>
        <button
          onClick={handleModeChange}
          className="button mode-toggle-button"
        >
          {currentMode === '업무' ? <Coffee size={16} className="icon-spacing" /> : <Briefcase size={16} className="icon-spacing" />}
          {currentMode === '업무' ? '휴가 모드로 전환' : '업무 모드로 전환'}
        </button>
        <button
          onClick={toggleDarkMode}
          className="button dark-mode-toggle-button"
        >
          {darkMode ? <Sun size={16} className="icon-spacing" /> : <Moon size={16} className="icon-spacing" />}
          {darkMode ? '라이트 모드' : '다크 모드'}
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
            <div key={index} className={`message-container ${chat.sender === 'user' ? 'user-message' : 'bot-message'}`}>
              <div className={`message-bubble ${chat.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                {chat.message}
              </div>
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
            <button
              onClick={handleSend}
              className="button send-button"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
