import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChatBot.css';
import { Unlock, Moon, Sun, Send } from 'lucide-react';
import { useCookies } from 'react-cookie';

interface ProfileInfo {
  password?: string;
  userId?: string;
  name?: string;
}

interface ChatLog {
  sender: string;
  message: string;
  date: string;
}

const ChatBot: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showProfileSettings, setShowProfileSettings] = useState<boolean>(false);
  const [isToday, setIsToday] = useState<boolean>(true); // 오늘 날짜인지 여부

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({ name: 'Guest' });
  const [cookies, , removeCookie] = useCookies(['name', 'accessToken']);
  const loc = useLocation();
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState<ChatLog[]>([]); // 전체 대화 기록
  const [sessionMessages, setSessionMessages] = useState<ChatLog[]>([]); // 세션 동안 작성한 메시지
  const [todayLogs, setTodayLogs] = useState<ChatLog[]>([]);
  const [dateGroupedLogs, setDateGroupedLogs] = useState<{ [date: string]: ChatLog[] }>({});

  // 로그인 정보 출력
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    let userName = 'Guest';

    if (cookies.name) {
      userName = cookies.name;
    } else if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      userName = parsedInfo.name || 'Guest';
    }

    setProfileInfo({ name: userName });
  }, [cookies, loc]);

  useEffect(() => {
    setChatHistory([{ sender: 'bot', message: `${profileInfo.name}님 무엇을 도와드릴까요?`, date: '' }]);
  }, [profileInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isToday) { // 오늘일 때만 전송 가능
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    const newMessage: ChatLog = { sender: 'user', message: question, date: new Date().toISOString() };

    // 세션 메시지에 추가
    setSessionMessages((prevMessages) => [...prevMessages, newMessage]);

    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      let userId = 'unknown_user';

      if (cookies.name) {
        userId = cookies.name;
      } else if (storedUserInfo) {
        const parsedInfo = JSON.parse(storedUserInfo);
        userId = parsedInfo.userId || 'unknown_user';
      }

      const response = await axios.post(
        'http://localhost:5000/ask',
        { user_id: userId, question },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botResponse: ChatLog = { sender: 'bot', message: response.data.response.replace(/<[^>]*>/g, ''), date: new Date().toISOString() };
      
      // 세션 메시지에 추가
      setSessionMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('응답을 가져오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setQuestion('');
      if (inputRef.current) inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    removeCookie('name', { path: '/' });
    removeCookie('accessToken', { path: '/' });
    localStorage.removeItem('userInfo');
    navigate('/auth/sign-in');
  };

  // 날짜별 채팅 로그 가져오기
  const fetchChatLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/chat-logs');
      const data = response.data || {};

      const today = data.today || [];
      const last7Days = data.last_7_days || [];

      const formatLogs = (logs: { question: string; response: string; timestamp: string }[]): ChatLog[] =>
        logs.flatMap((log) => [
          { sender: 'user', message: log.question, date: log.timestamp },
          { sender: 'bot', message: log.response, date: log.timestamp },
        ]);

      setTodayLogs(formatLogs(today));

      // 날짜별로 그룹화하여 dateGroupedLogs에 저장
      const groupedLogs: { [date: string]: ChatLog[] } = last7Days.reduce(
        (acc: { [date: string]: ChatLog[] }, log: { question: string; response: string; timestamp: string }) => {
          const date = new Date(log.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
          if (!acc[date]) acc[date] = [];
          acc[date].push({ sender: 'user', message: log.question, date: log.timestamp });
          acc[date].push({ sender: 'bot', message: log.response, date: log.timestamp });
          return acc;
        },
        {} as { [date: string]: ChatLog[] }
      );

      setDateGroupedLogs(groupedLogs);
    } catch (error) {
      console.error('채팅 로그를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    fetchChatLogs();
  }, []);

  const displayLogs = (logs: ChatLog[], isTodayLog: boolean = false) => {
    if (isTodayLog) {
        // 오늘 로그일 경우 sessionMessages와 todayLogs 병합 시 중복 제거
        const uniqueMessages = [...sessionMessages, ...logs].filter((message, index, self) =>
            index === self.findIndex((m) => m.message === message.message && m.date === message.date)
        );
        setChatHistory(uniqueMessages);
    } else {
        // 오늘이 아닌 경우 그대로 설정
        setChatHistory(logs);
    }
    setIsToday(isTodayLog); // 오늘 로그일 경우에만 입력과 전송 활성화
};

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-dark-mode text-light' : 'bg-light-mode text-dark'}`}>
      {/* 사이드바 */}
      <div className="sidebar-container">
        <div className="profile-container mb-4">
          {profileInfo.name && (
            <p className="profile-user-id">
              {profileInfo.name}
              <span className="small-text">님</span>
            </p>
          )}

          {/* 날짜별 로그 표시 */}
          <div className="date-log-container">
            <ul>
              <li onClick={() => displayLogs(todayLogs, true)} className="log-item">
                오늘
              </li>
              {Object.keys(dateGroupedLogs).map((date) => (
                <li key={date} onClick={() => displayLogs(dateGroupedLogs[date], false)} className="log-item">
                  {date}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sidebar-bottom-buttons">
          <button onClick={toggleDarkMode} className="button dark-mode-toggle-button">
            {darkMode ? <Sun size={16} className="icon-spacing" /> : <Moon size={15} className="icon-spacing" />}
            {darkMode ? '라이트 모드' : '다크 모드'}
          </button>
          <button onClick={handleLogout} className="button navigate-button">
            <Unlock size={15} className="icon-spacing" />로그아웃
          </button>
        </div>
      </div>

      {/* 대화창 */}
      <div className="chat-window-container">
        {showProfileSettings && <div className="profile-settings-container"></div>}

        <div className="chat-messages-container" ref={chatContainerRef}>
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`message-container ${chat.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className={`message-bubble ${chat.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                {chat.message.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
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
              onKeyDown={handleKeyDown}
              ref={inputRef}
              className="input-field chat-input"
              placeholder="질문을 입력하세요..."
              disabled={!isToday || isLoading} // 오늘 로그가 아닐 때 비활성화
            />
            <button onClick={handleSend} className="button send-button" disabled={!isToday || isLoading}>
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
