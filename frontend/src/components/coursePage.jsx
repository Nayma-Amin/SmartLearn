import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./coursePage.css";

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const courseRef = doc(db, "classrooms", id);
      const snapshot = await getDoc(courseRef);
      if (snapshot.exists()) {
        setCourse(snapshot.data());
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) return <p>Loading course...</p>;

  return (
    <div className="course-page">
      <div className="course-banner">
        <h1>{course.name}</h1>
        <p>{course.subject} - {course.section}</p>
        <p><strong>Class code:</strong> {course.classID}</p>
      </div>

      <div className="course-stream">
        <h2>Stream</h2>
        <input
          type="text"
          placeholder="Announce something to your class"
          className="announce-input"
        />
      </div>

      <div className="course-upcoming">
        <h2>Upcoming</h2>
        <p>No work due soon</p>
      </div>
    </div>
  );
}