import React, { useEffect, useState } from "react";
import DashboardLayout from "./dashboardLayout";
import CourseCard from "./courseCard";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, arrayUnion, query, where, getDoc } from "firebase/firestore";

export default function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState("");

  const fetchJoinedClasses = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const q = query(
      collection(db, "classrooms"),
      where("students", "array-contains", auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClasses(data);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      setProfilePic(data.profilePic || null);
      setUsername(data.username || "User");
    }
  };

  useEffect(() => {
    fetchJoinedClasses();
    fetchProfile();
  }, []);

  const joinClassroom = async () => {
    const classCode = prompt("Enter classroom ID to join:");
    if (!classCode) return;

    const classRef = doc(db, "classrooms", classCode);
    await updateDoc(classRef, {
      students: arrayUnion(auth.currentUser.uid),
    });
    fetchJoinedClasses();
  };

  return (
    <DashboardLayout
      sidebarItems={["Home", "Calendar", "To-do", "Joined"]}
      username={username}
    >
      <button onClick={joinClassroom} className="action-button">
        + Join Classroom
      </button>

      {loading ? (
        <p>Loading your classes...</p>
      ) : classes.length === 0 ? (
        <p>No classes found.</p>
      ) : (
        classes.map((c) => (
          <CourseCard key={c.id} title={c.title} teacher={c.teacherName || "Teacher"} />
        ))
      )}
    </DashboardLayout>
  );
}