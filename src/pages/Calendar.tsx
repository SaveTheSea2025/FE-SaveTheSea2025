import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="calendar-container">
      {/* 상단 영역 (좌측 텍스트 / 우측 버튼 그룹) */}
      <div className="calendar-header">
        {/* 왼쪽: 제목 + 설명 */}
        <div className="calendar-left">
          <h1 className="calendar-title">봉사 활동 캘린더</h1>
          <p className="calendar-description">
            예정된 봉사활동 일정을 확인하고 관리하세요
          </p>
        </div>

        {/* 오른쪽: 셀렉트 + 버튼 */}
        <div className="calendar-right">
          <select defaultValue="월간" className="calendar-select">
            <option>월간</option>
            <option>주간</option>
          </select>
          <button className="calendar-add-btn">+ 일정 추가</button>
        </div>
      </div>

      {/* 메인 달력 */}
      <div className="calendar-main">
        <Calendar
          onChange={setDate}
          value={date}
          locale="ko-KR"
          className="custom-calendar"
        />
      </div>
    </div>
  );
};

export default CalendarPage;
