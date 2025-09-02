import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import DashboardLayout from "./components/dashboardLayout";
import CourseCard from "./components/courseCard";
import { db, auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import TeacherDashboardComponent from "./components/teacherDashboard";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("landing");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
        setPage("landing");
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) return <div className="loading-screen">Loading...</div>;

  const toBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (roleType) => {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Invalid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const existingMethods = await fetchSignInMethodsForEmail(auth, email);
      if (existingMethods.length > 0) {
        setError("Email already exists");
        return;
      }

      let username = prompt("Enter your username") || email.split("@")[0];
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const avatarURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=232424&color=e564ff`;
      const avatarBase64 = await toBase64(avatarURL);

      await setDoc(doc(db, "users", user.uid), {
        userid: user.uid,
        username,
        email,
        role: roleType,
        profilePic: avatarBase64,
        createdAt: new Date(),
      });

      setPage("login");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.code === "auth/email-already-in-use" ? "Email already exists" : err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const username = user.displayName || user.email.split("@")[0];
      const avatarURL = user.photoURL || `https://ui-avatars.com/api/?name=${username}&background=232424&color=e564ff`;
      const avatarBase64 = await toBase64(avatarURL);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        const roleType = prompt("Which role do you want? (Teacher/Student)") || "Student";
        await setDoc(doc(db, "users", user.uid), {
          userid: user.uid,
          username,
          email: user.email,
          role: roleType,
          profilePic: avatarBase64,
          createdAt: new Date(),
        });
      }

      setPage("login");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleLogin = async (useGoogle = false) => {
    setError("");
    try {
      let user;

      if (useGoogle) {
        const result = await signInWithPopup(auth, googleProvider);
        user = result.user;
      } else {
        if (!email || !password) {
          setError("Email and Password are required");
          return;
        }
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          user = userCredential.user;
        } catch (err) {
          setError("Username or password is incorrect");
          return;
        }
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("User not found. Please sign up first.");
        return;
      }

      setRole(userDoc.data().role);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };

  if (role === "Teacher") return <TeacherDashboard />;
  if (role === "Student") return <StudentDashboard />;
  if (role === "Admin") return <AdminDashboard />;

  if (page === "landing") {
    return (
      <div className="landing-box">
        <img src={logo} alt="SmartLearn Logo" className="logo" />
        <h1>Welcome to SmartLearn!!</h1>
        <h2>Please Sign Up / Log In to continue 👇</h2>
        <div className="button-group">
          <button className="action-button" onClick={() => setPage("signup")}>Sign Up</button>
          <button className="action-button" onClick={() => setPage("login")}>Log In</button>
          <button className="action-button" onClick={() => setPage("login")}>Guest</button>
        </div>
      </div>
    );
  }

  if (page === "signup") {
    return (
      <div className="signup-box">
        <img src={logo} alt="SmartLearn Logo" className="logo" />
        <h1>Sign Up</h1>
        <form style={{ display: "none" }}>
          <input type="email" autoComplete="email" value={email} readOnly />
          <input type="password" autoComplete="new-password" value={password} readOnly />
        </form>
        <div className="password-wrapper">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="password-wrapper">
          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "👁️" : "👁️"}
          </span>
        </div>
        <div className="password-wrapper">
          <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? "👁️" : "👁️"}
          </span>
        </div>
        <button className="action-button" onClick={() => handleSignup("Teacher")}>Sign Up as a Teacher</button>
        <br />
        <button className="action-button" onClick={() => handleSignup("Student")}>Sign Up as a Student</button>
        <br />
        <button className="google-button" onClick={handleGoogleSignup}>Sign Up with Google</button>
        <br />
        <button className="action-button" onClick={() => setPage("landing")}>⬅ Back</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  if (page === "login") {
    return (
      <div className="login-box">
        <img src={logo} alt="SmartLearn Logo" className="logo" />
        <h1>Login</h1>
        <form style={{ display: "none" }}>
          <input type="email" autoComplete="email" value={email} readOnly />
          <input type="password" autoComplete="current-password" value={password} readOnly />
        </form>
        <div className="password-wrapper">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="password-wrapper">
          <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "👁️" : "👁️"}
          </span>
        </div>
        <button className="action-button" onClick={() => handleLogin(false)}>Login with Email</button>
        <br />
        <button className="google-button" onClick={() => handleLogin(true)}>Login with Google</button>
        <br />
        <button className="action-button" onClick={() => setPage("landing")}>⬅ Back</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }
}

function TeacherDashboard() {
  return <TeacherDashboardComponent />;
}

function StudentDashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinClassId, setJoinClassId] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      const q = query(collection(db, "classes"), where("students", "array-contains", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setClasses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchClasses();
  }, []);

  const joinClass = async () => {
    if (!joinClassId) return;
    const classRef = doc(db, "classes", joinClassId);
    const classSnap = await getDoc(classRef);
    if (!classSnap.exists()) {
      alert("Class not found");
      return;
    }
    await setDoc(classRef, {
      ...classSnap.data(),
      students: [...(classSnap.data().students || []), auth.currentUser.uid],
    });
    setClasses((prev) => [...prev, { id: joinClassId, ...classSnap.data() }]);
    setJoinClassId("");
  };

  return (
    <DashboardLayout sidebarItems={["Home", "Calendar", "To-do", "Enrolled"]}>
      <div style={{ marginBottom: "20px" }}>
        <input type="text" placeholder="Class ID to join" value={joinClassId} onChange={(e) => setJoinClassId(e.target.value)} />
        <br />
        <button onClick={joinClass}>Join Classroom</button>
      </div>

      {loading ? (
        <p>Loading your classes...</p>
      ) : classes.length === 0 ? (
        <p>No classrooms found</p>
      ) : (
        classes.map((c) => <CourseCard key={c.id} title={c.name} teacher={c.teacherName || "Teacher"} />)
      )}
    </DashboardLayout>
  );
}

function AdminDashboard() {
  return (
    <div>
      <h2>⚙️ Admin Dashboard</h2>
      <p>Manage users, monitor platform health...</p>
    </div>
  );
}

export { TeacherDashboard, StudentDashboard };
export default App;