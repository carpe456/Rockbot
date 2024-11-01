import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Unlock, Moon, Sun, Send } from 'lucide-react';
import axios from 'axios';
import './AdminPage.css';

interface User {
    userId: string;
    name: string;
    departmentId: number;
}

interface TravelRequest {
    request_id: number;
    name: string;
    department_id: number;
    destination: string;
    travel_date: string;
    return_date: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submission_date: string;
}

const AdminPage: React.FC = () => {
    const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([
        {
            request_id: 1,
            name: 'user123',
            department_id: 1,
            destination: '서울',
            travel_date: '2024-11-01',
            return_date: '2024-11-05',
            reason: '고객사 미팅',
            status: 'Pending',
            submission_date: '2024-10-20',
        },
        {
            request_id: 2,
            name: 'user456',
            department_id: 2,
            destination: '부산',
            travel_date: '2024-11-10',
            return_date: '2024-11-12',
            reason: '지사 방문',
            status: 'Pending',
            submission_date: '2024-10-22',
        },
    ]);

    const [users, setUsers] = useState<User[]>([]);
    const [cookies, , removeCookie] = useCookies(['name', 'accessToken']);
    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState<'travelRequests' | 'users' | 'travelList'>('travelRequests');
    const [darkMode, setDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4040/api/v1/user/all', {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                    },
                });
                console.log('회원 정보:', response.data);
                setUsers(response.data);
            } catch (error) {
                console.error('회원 정보를 가져오는 중 오류 발생:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleApprove = (id: number) => {
        setTravelRequests((prevRequests) =>
            prevRequests.map((request) =>
                request.request_id === id ? { ...request, status: 'Approved' } : request
            )
        );
    };

    const handleReject = (id: number) => {
        setTravelRequests((prevRequests) =>
            prevRequests.map((request) =>
                request.request_id === id ? { ...request, status: 'Rejected' } : request
            )
        );
    };

    const handleLogout = () => {
        removeCookie('name', { path: '/' });
        removeCookie('accessToken', { path: '/' });
        localStorage.removeItem('userInfo');
        navigate('/auth/sign-in');
    };

    const handleDepartmentChange = async (userId: string, newDepartmentId: number) => {
        try {
            await axios.put(`http://localhost:4040/api/v1/user/${userId}/department`, {
                departmentId: newDepartmentId,
            });
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.userId === userId ? { ...user, departmentId: newDepartmentId } : user
                )
            );
            alert('부서 ID가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('부서 ID 수정 중 오류 발생:', error);
            alert('부서 ID 수정에 실패했습니다.');
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className={`flex h-screen ${darkMode ? 'bg-dark-mode text-light' : 'bg-light-mode text-dark'}`}>
          {/* 사이드바 */}
<div className="sidebar-container">
  <div className="sidebar-menu">
    <button
      className={`menu-item ${selectedMenu === 'travelList' ? 'active' : ''}`}
      onClick={() => setSelectedMenu('travelList')}
    >
      출장 목록
    </button>
    <button
      className={`menu-item ${selectedMenu === 'travelRequests' ? 'active' : ''}`}
      onClick={() => setSelectedMenu('travelRequests')}
    >
      출장 결재 목록
    </button>
    <button
      className={`menu-item ${selectedMenu === 'users' ? 'active' : ''}`}
      onClick={() => setSelectedMenu('users')}
    >
      회원 목록
    </button>
  </div>

    
            <div className="sidebar-bottom-buttons">
              <button className="button dark-mode-toggle-button" onClick={toggleDarkMode}>
                {darkMode ? <Sun size={16} className="icon-spacing" /> : <Moon size={15} className="icon-spacing" />}
                {darkMode ? '라이트 모드' : '다크 모드'}
              </button>
              <button onClick={handleLogout} className="button navigate-button">
                <Unlock size={15} className="icon-spacing" /> 로그아웃
              </button>
            </div>
          </div>
    
          {/* 메인 콘텐츠 */}
          {selectedMenu === 'travelRequests' && (
            <div className="request-list-container">
              <h2>출장 결재 목록</h2>
              {travelRequests.map((request) => (
                <div key={request.request_id} className={`trip-request ${request.status.toLowerCase()}`}>
                  <div className="trip-info">
                    <p className="trip-name">이름: {request.name}</p>
                    <p className="trip-department">부서 ID: {request.department_id}</p>
                    <p className="trip-destination">목적지: {request.destination}</p>
                    <p className="trip-dates">
                      출장 날짜: {request.travel_date} - {request.return_date}
                    </p>
                    <p className="trip-reason">사유: {request.reason}</p>
                    <p className="trip-submission-date">신청 날짜: {request.submission_date}</p>
                  </div>
                  {request.status === 'Pending' && (
                    <div className="trip-actions">
                      <button className="approve-button" onClick={() => handleApprove(request.request_id)}>
                        ✔ 승인
                      </button>
                      <button className="reject-button" onClick={() => handleReject(request.request_id)}>
                        ✖ 거절
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    
          {selectedMenu === 'users' && (
            <div className="user-list-container">
              <h2>회원 목록</h2>
              {users.map((user) => (
                <div key={user.userId} className="user-info">
                  <p>이름: {user.name}</p>
                  <p>부서 ID: {user.departmentId}</p>
                  <label>
                    부서 ID 수정:
                    <input
                      type="number"
                      value={user.departmentId}
                      onChange={(e) => handleDepartmentChange(user.userId, parseInt(e.target.value))}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };
    
    export default AdminPage;