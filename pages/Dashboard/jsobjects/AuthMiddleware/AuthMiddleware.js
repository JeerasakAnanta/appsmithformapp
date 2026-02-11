export default {
	// ฟังก์ชันนี้จะทำงานทันทีที่หน้าเว็บโหลดเสร็จ
	checkAuth: async () => {
		// 1. ดึง Token จาก Store ที่เราบันทึกไว้ตอน Login
		const token = appsmith.store.authToken;

		// 2. ถ้าไม่มี Token (เป็น null, undefined หรือว่างเปล่า)
		if (!token) {
			// แจ้งเตือนผู้ใช้	
			showAlert('Session หมดอายุ หรือยังไม่ได้เข้าสู่ระบบ', 'error');

			// ดีดกลับไปหน้า Login
			navigateTo('Login'); 
		} else {
			// (Optional) ถ้ามี Token อาจจะเช็คเพิ่มเติมว่า User ยัง Active อยู่ไหม
			// แต่เบื้องต้นแค่นี้ก็เพียงพอสำหรับ Client-side check ครับ
		}
	}
}