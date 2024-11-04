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
  departmentId?: number;
  departmentName?: string;
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
  const [activeLogDate, setActiveLogDate] = useState<string>('today'); // 현재 선택된 날짜 상태 추가

  // 부서 ID에 따른 부서 이름 설정 함수
  const getDepartmentName = (departmentId: number) => {
    switch (departmentId) {
      case 1:
        return '임시부서';
      case 2:
        return '인사부서';
      case 3:
        return '편성부서';
      case 4:
        return '제작부서';
      default:
        return '알 수 없음';
    }
  };

  // 로그인 정보 출력
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    let userName = 'Guest';
    let userId = 'unknown_user';
    let departmentId = 1;

    if (cookies.name) {
      userName = cookies.name;
      userId = cookies.name; // userId 설정
    } else if (storedUserInfo) {
      const parsedInfo = JSON.parse(storedUserInfo);
      console.log('Parsed userInfo:', parsedInfo);
      userName = parsedInfo.name || 'Guest';
      userId = parsedInfo.userId || 'unknown_user'; // userId 설정
      departmentId = parsedInfo.departmentId || 'department';
    }
  
    setProfileInfo({ name: userName, userId, departmentId, departmentName: getDepartmentName(departmentId) }); // userId 추가 설정
  }, [cookies, loc]);

  useEffect(() => {
    setChatHistory([{ sender: 'bot', message: `${profileInfo.name}님 무엇을 도와드릴까요?`, date: new Date().toISOString() }]);
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

    // 세션 메시지와 화면에 즉시 반영
    setSessionMessages((prevMessages) => [...prevMessages, newMessage]);
    setChatHistory((prevHistory) => [...prevHistory, newMessage]);

    try {
        const storedUserInfo = localStorage.getItem('userInfo');
        let userId = 'unknown_user';

        if (cookies.name) {
            userId = cookies.name;
        } else if (storedUserInfo) {
            const parsedInfo = JSON.parse(storedUserInfo);
            userId = parsedInfo.userId || 'unknown_user';
        }

        console.log('Sending request to server:', { user_id: userId, question });

        const response = await axios.post(
            'http://localhost:5000/ask',
            { user_id: userId, question },
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('Server response:', response.data);

        const botResponse: ChatLog = {
            sender: 'bot',
            message: response.data.response.replace(/<[^>]*>/g, ''),
            date: new Date().toISOString(),
        };

        // 봇 응답을 세션 메시지와 화면에 즉시 반영
        setSessionMessages((prevMessages) => [...prevMessages, botResponse]);
        setChatHistory((prevHistory) => [...prevHistory, botResponse]);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data);
        } else {
            console.error('응답을 가져오는 데 실패했습니다.', error);
        }
    } finally {
        setIsLoading(false);
        setQuestion('');
        if (inputRef.current) inputRef.current.focus();
    }
};

const displayLogs = (logs: ChatLog[], isTodayLog: boolean = false, date?: string) => {
  if (isTodayLog) {
    setActiveLogDate('today');
  } else if (date) {
    setActiveLogDate(date);
  }

  if (isTodayLog) {
    const today = new Date().toISOString().split('T')[0];
    const uniqueMessages = [
      { sender: 'bot', message: `${profileInfo.name}님 무엇을 도와드릴까요?`, date: '' }, // 날짜가 없는 경우 예외 처리 필요
      ...logs,
      ...sessionMessages,
    ]
      .filter((message, index, self) => {
        if (!message.date) return true; // 날짜가 없는 경우 필터링하지 않음
        const messageDate = new Date(message.date).toISOString().split('T')[0];
        return (
          messageDate === today &&
          index === self.findIndex(
            (m) =>
              m.sender === message.sender &&
              m.message === message.message &&
              new Date(m.date).getTime() === new Date(message.date).getTime()
          )
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChatHistory(uniqueMessages);
  } else {
    const sortedLogs = logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setChatHistory([
      { sender: 'bot', message: `${profileInfo.name}님 무엇을 도와드릴까요?`, date: '' }, // 날짜가 없는 경우 예외 처리 필요
      ...sortedLogs,
    ]);
  }
  setIsToday(isTodayLog);
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
      const userId = profileInfo.userId || 'unknown_user';
      console.log("Fetching chat logs for userId:", userId); // 로그 추가
  
      const response = await axios.get(`http://localhost:5000/chat-logs?user_id=${userId}`);
      const data = response.data || {};
  
      const today = data.today || [];
      const previousDays = data.previous_days || {};
  
      // 로그 포맷팅 함수 정의
      const formatLogs = (logs: { sender: string; message: string; date: string }[]): ChatLog[] =>
        logs.map(log => ({
          sender: log.sender,
          message: log.message,
          date: log.date
        }));
  
      // 오늘의 로그 설정 (오래된 순서로 정렬)
      const sortedTodayLogs = formatLogs(today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTodayLogs(sortedTodayLogs);
  
      // 이전 날짜별 로그 설정 (오래된 순서로 정렬)
      const groupedLogs: { [date: string]: ChatLog[] } = {};
      for (const [date, logs] of Object.entries(previousDays)) {
        if (Array.isArray(logs)) {
          groupedLogs[date] = formatLogs(logs).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else {
          console.error(`Unexpected format for logs on date ${date}:`, logs);
        }
      }
  
      setDateGroupedLogs(groupedLogs);
    } catch (error) {
      console.error('채팅 로그를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (profileInfo.userId) {
      fetchChatLogs();
    }
  }, [profileInfo.userId]);

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-dark-mode text-light' : 'bg-light-mode text-dark'}`}>
      {/* 사이드바 */}
      <div className="sidebar-container">
      <div className="profile-container mb-4">
          {profileInfo.name && (
            <>
              <p className="profile-user-id">
                {profileInfo.name}
                <span className="small-text">님</span>
              </p>
              {profileInfo.departmentId && (
                <p className="profile-department">{profileInfo.departmentName}</p>
              )}
            </>
          )}

          {/* 날짜별 로그 표시 */}
          <div className="date-log-container">
  <ul>
    <li
      onClick={() => displayLogs(todayLogs, true)}
      className={`log-item ${activeLogDate === 'today' ? 'active' : ''}`}
    >
      오늘
    </li>
    {Object.keys(dateGroupedLogs)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => (
        <li
          key={date}
          onClick={() => displayLogs(dateGroupedLogs[date], false, date)}
          className={`log-item ${activeLogDate === date ? 'active' : ''}`}
        >
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
