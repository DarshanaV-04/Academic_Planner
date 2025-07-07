import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // <-- Add this import

const departments = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence & Data Science ',
  'Cybersecurity',
  'Computer science and business systems',
];

const StudentDetailsForm = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    name: '',
    rollNo: '',
    department: '',
    year: '',
    phone: '',
    personalEmail: '',
  });

  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the logged-in user's _id from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser._id) {
        alert("User not logged in!");
        return;
      }
      // POST all fields to backend
      await axios.post('http://localhost:5000/api/student-details/create', {
        userId: storedUser._id,
        ...studentData,
      });
      navigate('/student-dashboard');
    } catch (err) {
      alert("Failed to save details. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Student Details Form
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={studentData.name}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Roll No</label>
              <input
                type="text"
                name="rollNo"
                value={studentData.rollNo}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700">Department</label>
              <select
                name="department"
                value={studentData.department}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Year</label>
              <input
                type="text"
                name="year"
                value={studentData.year}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Phone No</label>
              <input
                type="text"
                name="phone"
                value={studentData.phone}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700">Personal Email ID</label>
              <input
                type="email"
                name="personalEmail"
                value={studentData.personalEmail}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentDetailsForm;