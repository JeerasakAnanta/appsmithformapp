export default {
    // ตัวแปรสำหรับคุมสถานะ Loading ของปุ่ม (เอาไป Bind ที่ปุ่ม Login: IsLoading)
    isLoading: false,

    signIn: async () => {
        // 1. เริ่มต้น: ล้างค่าเก่า และเปิดสถานะ Loading
        this.isLoading = true;
        storeValue('authToken', undefined);
        storeValue('currentUser', undefined);
        storeValue('isLoggedIn', false);

        const email = Input_email.text.trim(); // trim() ตัดช่องว่างหน้าหลัง
        const password = Input_password.text;

        // 2. Validate Input ขั้นสูง
        if (!email || !password) {
            showAlert("กรุณากรอก Email และ Password ให้ครบถ้วน", "warning");
            this.isLoading = false; // ปิด Loading
            return;
        }

        // เช็ครูปแบบ Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert("รูปแบบ Email ไม่ถูกต้อง", "warning");
            this.isLoading = false;
            return;
        }

        try {
            // 3. เรียก API (n8n)
            const response = await LoginAPI.run({
                "email": email,
                "password": password
            });

            // 4. เช็ค Response (รองรับกรณี n8n ส่งมาเป็น Array หรือ Object)
            // ถ้า n8n ส่งมาเป็น [ { body: ... } ] หรือ Object ตรงๆ
            const data = Array.isArray(response) ? response[0] : response;

            if (!data) {
                throw new Error("ไม่ได้รับข้อมูลตอบกลับจาก Server");
            }

            // 5. เช็ค Logic ความถูกต้อง
            if (data.success === true) {
                
                // เก็บ Token (Persist = true)
                await storeValue('authToken', data.token, true); 
                await storeValue('currentUser', data.data, true);
                await storeValue('isLoggedIn', true, true); 

                showAlert('เข้าสู่ระบบสำเร็จ!', 'success');
                navigateTo('Dashboard'); 
            } else {
                // กรณี Login ไม่ผ่าน (password ผิด หรือ user ไม่มีจริง)
                showAlert(data.message || 'Email หรือ Password ไม่ถูกต้อง', 'error');
            }

        } catch (error) {
            // 6. Error Handling
            console.error("Login Error:", error);
            
            // เช็คว่าเป็น HTTP Error หรือไม่ (เช่น n8n ตอบกลับมาเป็น 401, 500)
            if(LoginAPI.responseMeta && LoginAPI.responseMeta.statusCode === 401){
                 showAlert("รหัสผ่านไม่ถูกต้อง (401)", 'error');
            } else {
                 showAlert("เกิดข้อผิดพลาด: " + error.message, 'error');
            }
            
        } finally {
            // 7. จบการทำงาน: ปิดสถานะ Loading เสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว
            this.isLoading = false;
        }
    }
}