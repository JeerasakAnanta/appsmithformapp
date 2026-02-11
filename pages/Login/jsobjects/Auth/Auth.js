export default {
	signIn: async () => {
		// 1. ดึงค่าจาก Input
		const email = Input_email.text;
		const password = Input_password.text;

		// เช็คว่ากรอกข้อมูลครบไหม
		if(!email || !password  ) {
			showAlert("กรุณากรอก Email  และ Password ให้ครบถ้วน", "warning");
			return;
		} 

		try {
			// 2. เรียก API
			const response = await LoginAPI.run({
				"email": email,
				"password": password
			});

			// 3. Debug: ดูโครงสร้างข้อมูลที่ n8n ส่งกลับมา
			console.log("Response from n8n:", response);

			// 4. ป้องกัน error "undefined"
			if (!response) {
				showAlert("ไม่ได้รับข้อมูลตอบกลับจาก Server", "error");
				return;
			}

			// 5. เช็ค Logic (ปรับปรุงใหม่)
			if (response.success === true) {

				// --- [ส่วนที่ต้องเพิ่มและแก้ไข] ---

				// เก็บ Token (สำคัญ: ใส่ parameter ตัวที่ 3 เป็น true เพื่อให้จำค่าแม้ refresh หน้า)
				storeValue('authToken', response.token, true); 

				// เก็บข้อมูล User
				storeValue('currentUser', response.data, true);

				// (Optional) ตัวแปรเช็คสถานะ
				storeValue('isLoggedIn', true, true); 

				// --------------------------------

				showAlert('เข้าสู่ระบบสำเร็จ!', 'success');
				navigateTo('Dashboard'); 
			} else {
				// กรณี Login ไม่ผ่าน
				showAlert(response.message || 'Email หรือ Password ไม่ถูกต้อง', 'error');
			}

		} catch (error) {
			// 6. ดักจับ Error
			console.log("System Error:", error);
			showAlert("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + error.message, 'error');
		}
	}
}