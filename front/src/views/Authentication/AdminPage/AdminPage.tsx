import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Unlock, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import './AdminPage.css';

interface User {
    userId: string;
    name: string;
    departmentId: number;
}

interface TravelRequest {
    requestId: number;
    name: string;
    departmentId: number;
    destination: string;
    travelDate: string;
    returnDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    submissionDate: string;
}

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

// 날짜 변환
const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 정보 없음";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) throw new Error("유효하지 않은 날짜 형식");

        const formatter = new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });
        return formatter.format(date);
    } catch (error) {
        console.error("날짜 변환 오류:", error);
        return "유효하지 않은 날짜";
    }
};

const AdminPage: React.FC = () => {
    const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [cookies, , removeCookie] = useCookies(['name', 'accessToken']);
    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState<'travelList' | 'travelRequests' | 'users'>('travelList');
    const [darkMode, setDarkMode] = useState<boolean>(false);

    // 출장 목록과 출장 결재 목록에 맞게 요청 필터링
    const approvedRequests = travelRequests.filter(request => request.status === 'Approved');
    const pendingRequests = travelRequests.filter(request => request.status === 'Pending');

    useEffect(() => {

        const fetchTravelRequests = async () => {
            try {
                const response = await axios.get('http://localhost:4040/api/v1/auth/travel-requests', {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                    },
                });
                console.log('Fetched travel requests:', response.data);
                setTravelRequests(response.data);
            } catch (error) {
                console.error('출장 요청 목록을 가져오는 중 오류 발생:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4040/api/v1/auth/all', {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('회원 정보를 가져오는 중 오류 발생:', error);
            }
        };

        fetchTravelRequests();
        fetchUsers();
    }, [cookies.accessToken]);

    const handleApprove = async (id: number) => {
        try {
            await axios.put(
                `http://localhost:4040/api/v1/auth/travel-requests/${id}/status`,
                { status: 'Approved' },
                {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                    },
                }
            );
            setTravelRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.requestId === id ? { ...request, status: 'Approved' } : request
                )
            );
        } catch (error) {
            console.error('출장 요청 승인 중 오류 발생:', error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.put(
                `http://localhost:4040/api/v1/auth/travel-requests/${id}/status`,
                { status: 'Rejected' },
                {
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                    },
                }
            );
            setTravelRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.requestId === id ? { ...request, status: 'Rejected' } : request
                )
            );
        } catch (error) {
            console.error('출장 요청 거절 중 오류 발생:', error);
        }
    };

    const handleLogout = () => {
        removeCookie('name', { path: '/' });
        removeCookie('accessToken', { path: '/' });
        localStorage.removeItem('userInfo');
        navigate('/auth/sign-in');
    };

    const handleDepartmentChange = async (userId: string, newDepartmentId: number) => {
        try {
            const token = cookies.accessToken;
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            await axios.put(
                `http://localhost:4040/api/v1/user/${userId}/department`,
                { departmentId: newDepartmentId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.userId === userId ? { ...user, departmentId: newDepartmentId } : user
                )
            );
            alert("부서가 성공적으로 변경되었습니다.");
        } catch (error) {
            console.error("부서 변경 중 오류 발생:", error);
            alert("부서 변경에 실패했습니다.");
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

            {/* 출장 목록 */}
            {selectedMenu === 'travelList' && (
                <div className="travel-list-container">
                    {approvedRequests.map((request) => (
                        <div key={request.requestId} className="trip-item">
                            <div className="trip-info">
                                <p className="trip-name">이름 : {request.name}</p>
                                <p className="trip-department">부서 ID : {getDepartmentName(request.departmentId)}</p>
                                <p className="trip-destination">목적지 : {request.destination}</p>
                                <p className="trip-dates">
                                    출장 날짜 : {formatDate(request.travelDate)} - {formatDate(request.returnDate)}
                                </p>
                                <p className="trip-reason">사유 : {request.reason}</p>
                                <p className="trip-submission-date">신청 날짜 : {formatDate(request.submissionDate)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedMenu === 'travelRequests' && (
                <div className="request-list-container">
                    {pendingRequests.map((request) => (
                        <div key={request.requestId} className={`trip-request ${request.status.toLowerCase()}`}>
                            <div className="trip-info">
                                <p className="trip-name">이름 : {request.name}</p>
                                <p className="trip-department">부서 : {getDepartmentName(request.departmentId)}</p>
                                <p className="trip-destination">목적지 : {request.destination}</p>
                                <p className="trip-dates">
                                    출장 날짜 : {request.travelDate} - {request.returnDate}
                                </p>
                                <p className="trip-reason">사유 : {request.reason}</p>
                                <p className="trip-submission-date">신청 날짜 : {formatDate(request.submissionDate)}</p>
                            </div>
                            <div className="trip-actions">
                                <button className="approve-button" onClick={() => handleApprove(request.requestId)}>
                                    ✔ 승인
                                </button>
                                <button className="reject-button" onClick={() => handleReject(request.requestId)}>
                                    ✖ 거절
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {selectedMenu === 'users' && (
                <div className="user-list-container">
                    {users.map((user) => (
                        <div key={user.userId} className="user-info">
                            <p>이름 : {user.name}</p>
                            <p>부서 : {getDepartmentName(user.departmentId)}</p>
                            <label>
                                부서 변경
                                <select
                                    className="custom-select"
                                    value={user.departmentId}
                                    onChange={(e) => handleDepartmentChange(user.userId, parseInt(e.target.value))}
                                >
                                    <option value={1}>임시부서</option>
                                    <option value={2}>인사부서</option>
                                    <option value={3}>편성부서</option>
                                    <option value={4}>제작부서</option>
                                </select>
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPage;