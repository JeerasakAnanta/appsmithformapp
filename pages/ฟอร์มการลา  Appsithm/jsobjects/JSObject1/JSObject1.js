export default {
	checkAndSubmit: async () => {
		// 1. เช็คข้อมูลพื้นฐาน
		if (!Input_username.text || !Select_LeaveType.selectedOptionValue) {
			showAlert("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
			return; // จบการทำงาน ไม่ส่งข้อมูล
		}
		
		
	}
}