import { useState, useEffect } from 'react'
import '../../../styles/ScheduleManagement.css'

const ScheduleManagement = () => {
  const [employees, setEmployees] = useState([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [schedules, setSchedules] = useState({})

  // Days of the week (Monday to Saturday)
  const weekDays = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' }
  ]

  // Mock employees data
  useEffect(() => {
    const mockEmployees = [
      { id: 1, fullName: 'John Doe', role: 'technician' },
      { id: 2, fullName: 'Jane Smith', role: 'staff' },
    ]
    setEmployees(mockEmployees)

    // Mock schedule data
    const mockSchedules = {
      1: {
        monday: { startTime: '08:00', endTime: '17:00', isWorking: true },
        tuesday: { startTime: '08:00', endTime: '17:00', isWorking: true },
        wednesday: { startTime: '08:00', endTime: '17:00', isWorking: true },
        thursday: { startTime: '08:00', endTime: '17:00', isWorking: true },
        friday: { startTime: '08:00', endTime: '17:00', isWorking: true },
        saturday: { startTime: '08:00', endTime: '12:00', isWorking: true }
      },
      2: {
        monday: { startTime: '09:00', endTime: '18:00', isWorking: true },
        tuesday: { startTime: '09:00', endTime: '18:00', isWorking: true },
        wednesday: { startTime: '', endTime: '', isWorking: false },
        thursday: { startTime: '09:00', endTime: '18:00', isWorking: true },
        friday: { startTime: '09:00', endTime: '18:00', isWorking: true },
        saturday: { startTime: '', endTime: '', isWorking: false }
      }
    }
    setSchedules(mockSchedules)
  }, [])

  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    for (let i = 0; i < 6; i++) {
      const weekDate = new Date(startOfWeek)
      weekDate.setDate(startOfWeek.getDate() + i)
      week.push(weekDate)
    }
    return week
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction * 7))
    setCurrentWeek(newDate)
  }

  const handleScheduleChange = (employeeId, day, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [day]: {
          ...prev[employeeId]?.[day],
          [field]: value
        }
      }
    }))
  }

  const handleWorkingToggle = (employeeId, day) => {
    const currentSchedule = schedules[employeeId]?.[day]
    const isCurrentlyWorking = currentSchedule?.isWorking || false
    
    setSchedules(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [day]: {
          ...prev[employeeId]?.[day],
          isWorking: !isCurrentlyWorking,
          startTime: !isCurrentlyWorking ? '08:00' : '',
          endTime: !isCurrentlyWorking ? '17:00' : ''
        }
      }
    }))
  }

  const saveSchedules = () => {
    // Here you would save to backend
    console.log('Saving schedules:', schedules)
    alert('Schedules saved successfully!')
  }

  const weekDates = getWeekDates(currentWeek)

  return (
    <div className="schedule-management">
      {/* Header */}
      <div className="schedule-header">
        <div className="week-navigation">
          <button onClick={() => navigateWeek(-1)} className="week-nav-btn">
            ← Previous Week
          </button>
          <h3 className="week-display">
            Week of {formatDate(weekDates[0])} - {formatDate(weekDates[5])}
          </h3>
          <button onClick={() => navigateWeek(1)} className="week-nav-btn">
            Next Week →
          </button>
        </div>

        <div className="schedule-actions">
          <button onClick={saveSchedules} className="save-btn">
            💾 Save All Schedules
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="schedule-grid">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="employee-header">Employee</th>
              {weekDays.map((day, index) => (
                <th key={day.key} className="day-header">
                  <div className="day-info">
                    <span className="day-name">{day.short}</span>
                    <span className="day-date">{formatDate(weekDates[index])}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.id}>
                <td className="employee-cell">
                  <div className="employee-info">
                    <div className="employee-avatar">
                      {employee.fullName.charAt(0)}
                    </div>
                    <div className="employee-details">
                      <span className="employee-name">{employee.fullName}</span>
                      <span className={`employee-role ${employee.role}`}>
                        {employee.role}
                      </span>
                    </div>
                  </div>
                </td>
                
                {weekDays.map(day => {
                  const daySchedule = schedules[employee.id]?.[day.key] || {}
                  const isWorking = daySchedule.isWorking || false
                  
                  return (
                    <td key={day.key} className="schedule-cell">
                      <div className="schedule-day">
                        <label className="working-toggle">
                          <input
                            type="checkbox"
                            checked={isWorking}
                            onChange={() => handleWorkingToggle(employee.id, day.key)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                        
                        {isWorking ? (
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={daySchedule.startTime || '08:00'}
                              onChange={(e) => handleScheduleChange(
                                employee.id, day.key, 'startTime', e.target.value
                              )}
                              className="time-input"
                            />
                            <span className="time-separator">-</span>
                            <input
                              type="time"
                              value={daySchedule.endTime || '17:00'}
                              onChange={(e) => handleScheduleChange(
                                employee.id, day.key, 'endTime', e.target.value
                              )}
                              className="time-input"
                            />
                          </div>
                        ) : (
                          <div className="off-day">
                            <span>Day Off</span>
                          </div>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ScheduleManagement