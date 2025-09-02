import React, { useEffect, useState } from "react";
import DashboardLayout from "./dashboardLayout";
import CourseCard from "./courseCard";
import { db, auth } from "../firebase";
import {
    collection,
    getDocs,
    setDoc,
    doc,
    query,
    where,
    getDoc,
} from "firebase/firestore";

export default function TeacherDashboard() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [showRules, setShowRules] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [agreeRules, setAgreeRules] = useState(false);

    const [classForm, setClassForm] = useState({
        name: "",
        subject: "",
        section: "",
        room: "",
        semester: "",
    });

    const styles = {
        overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
        },
        modal: {
            backgroundColor: "#1a1a1a",
            color: "#fff",
            padding: "25px",
            borderRadius: "10px",
            minWidth: "300px",
            maxWidth: "500px",
            width: "90%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        },
        actions: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "15px",
        },
    };

    const fetchClasses = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        const q = query(
            collection(db, "classrooms"),
            where("teacherId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setClasses(data);
        setLoading(false);
    };

    const fetchProfile = async () => {
        if (!auth.currentUser) return;
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            setUsername(data.username || "User");
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchProfile();
    }, []);

    const handleCreateClass = async () => {
        if (!classForm.name) return alert("Class name is required");

        const classRef = doc(collection(db, "classrooms"));
        const classID = classRef.id;

        const newClass = {
            ...classForm,
            teacherId: auth.currentUser.uid,
            teacherName: username || "Teacher",
            classID,
            createdAt: new Date(),
        };

        await setDoc(classRef, newClass);

        setClasses((prev) => [...prev, newClass]);
        setClassForm({ name: "", subject: "", section: "", room: "", semester: "" });
        setShowForm(false);
        setAgreeRules(false);
    };

    return (
        <DashboardLayout
            sidebarItems={["Home", "Calendar", "To-do", "Enrolled"]}
            username={username}
        >
            <div className="main-content">
                <div style={{ marginBottom: "10px" }}>
                    <button onClick={() => setShowRules(true)}>Create New Classroom</button>
                </div>

                {loading ? (
                    <p>Loading classrooms...</p>
                ) : classes.length === 0 ? (
                    <p>No classrooms found.</p>
                ) : (
                    <div className="courses-container">
                        {classes.map((c) => (
                            <CourseCard
                                key={c.id}
                                title={c.name}
                                teacher={c.teacherName}
                                section={c.section}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showRules && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>📘 Classroom Creation Rules</h3>
                        <ul>
                            <li>Classrooms should be used for academic purposes only.</li>
                            <li>Do not share sensitive information.</li>
                            <li>Respect students and maintain professionalism.</li>
                        </ul>
                        <label>
                            <input
                                type="checkbox"
                                checked={agreeRules}
                                onChange={() => setAgreeRules(!agreeRules)}
                            />{" "}
                            I agree to the rules
                        </label>
                        <div style={styles.actions}>
                            <button onClick={() => setShowRules(false)}>Cancel</button>
                            <button
                                disabled={!agreeRules}
                                onClick={() => {
                                    setShowRules(false);
                                    setShowForm(true);
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>📝 Create Classroom</h3>
                        <input
                            type="text"
                            placeholder="Class Name"
                            value={classForm.name}
                            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Subject"
                            value={classForm.subject}
                            onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Section"
                            value={classForm.section}
                            onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Room"
                            value={classForm.room}
                            onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Semester/Session"
                            value={classForm.semester}
                            onChange={(e) => setClassForm({ ...classForm, semester: e.target.value })}
                        />
                        <div style={styles.actions}>
                            <button onClick={() => setShowForm(false)}>Cancel</button>
                            <button onClick={handleCreateClass}>Create Class</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}