import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import './AdminPage.css';

interface TravelRequest {
    request_id: number;
    user_id: string;
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
            user_id: 'user123',
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
            user_id: 'user456',
            department_id: 2,
            destination: '부산',
            travel_date: '2024-11-10',
            return_date: '2024-11-12',
            reason: '지사 방문',
            status: 'Pending',
            submission_date: '2024-10-22',
        },
        {
            request_id: 3,
            user_id: 'user789',
            department_id: 3,
            destination: '대전',
            travel_date: '2024-11-15',
            return_date: '2024-11-18',
            reason: '프로젝트 착수 미팅',
            status: 'Pending',
            submission_date: '2024-10-25',
        },
    ]);

    const [cookies, , removeCookie] = useCookies(['name', 'accessToken']);
    const navigate = useNavigate();

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

    return (
        <div className="admin-page-container">
            <div className="fixed-header-container">
                <div className="fixed-header">
                    <button className="logout-button" onClick={handleLogout}>
                        로그아웃
                    </button>
                </div>
            </div>

            <div className="request-list-container">
                <h2>출장 결재 목록</h2>
                {travelRequests.map((request) => (
                    <div
                        key={request.request_id}
                        className={`trip-request ${request.status.toLowerCase()}`}
                    >
                        <div className="trip-info">
                            <p className="trip-name">사용자 ID: {request.user_id}</p>
                            <p className="trip-department">부서 ID: {request.department_id}</p>
                            <p className="trip-destination">목적지: {request.destination}</p>
                            <p className="trip-dates">출장 날짜: {request.travel_date} - {request.return_date}</p>
                            <p className="trip-reason">사유: {request.reason}</p>
                            <p className="trip-submission-date">신청 날짜: {request.submission_date}</p>
                        </div>
                        {request.status === 'Pending' && (
                            <div className="trip-actions">
                                <button
                                    className="approve-button"
                                    onClick={() => handleApprove(request.request_id)}
                                >
                                    ✔ 승인
                                </button>
                                <button
                                    className="reject-button"
                                    onClick={() => handleReject(request.request_id)}
                                >
                                    ✖ 거절
                                </button>
                            </div>
                        )}
                    </div>


                ))}
            </div>

        </div>
    );
};

export default AdminPage;