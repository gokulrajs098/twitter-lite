import SignUpPage from "./pages/auth/signup/SignUpPage";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import { Routes, Route } from "react-router-dom";
import SideBar from "./components/common/SideBar"
import RightPanel from "./components/common/RightPanel";
import Notification from "../../backend/models/notification.model";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";

function App() {
	return (
		<div className='flex max-w-6xl mx-auto'>
			<SideBar/>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/notifications' element={<Notification />} />
				<Route path='/profile/:username' element={<ProfilePage />} />
			</Routes>
			<RightPanel/>
			<Toaster/>
		</div>
	);
}

export default App;