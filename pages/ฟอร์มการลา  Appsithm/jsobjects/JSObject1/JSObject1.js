export default {
	submitLeave: async () => {

		// --- 1. Get Values from Widgets ---
		// Make sure to use .text for inputs and .selectedOptionValue for selects
		const name = Input_username.text; 													// 
		const leaveType = Select_LeaveType.selectedOptionValue;  		// 
		const startDate = DatePicker_Start.selectedDate; 						// Check your widget name for Start Date
		const endDate = DatePicker_End.selectedDate;     						// Check your widget name for End Date
		const reason = Input_Reason.text;                						// Check your widget name for Reason

		// --- 2. General Validation (Check if empty) ---
		if (!name) {
			showAlert('⚠️ กรุณาระบุชื่อ-นามสกุล (Please enter your name)', 'error');
			return; 
		}
		if (!leaveType) {
			showAlert('⚠️ กรุณาเลือกประเภทการลา (Please select leave type)', 'error');
			return;
		}
		if (!startDate || !endDate) {
			showAlert('⚠️ กรุณาระบุวันที่ลา (Please select dates)', 'error');
			return;
		}

		// --- 3. Specific Logic: Sick Leave requires File ---
		const isSick = leaveType === 'sick';
		// Safe check for files
		const hasFile = file_certificate.files && file_certificate.files.length > 0;

		if (isSick && !hasFile) {
			showAlert('⚠️ กรณีลาป่วย จำเป็นต้องแนบใบรับรองแพทย์ครับ (Medical certificate required)', 'error');
			return;
		}

		// --- 4. Submission Process ---
		try {
			let filePath = ''; // Default empty if no file

			if (hasFile) {
				// Create unique filename: YYYYMMDD_HHmm_OriginalName
				const timestamp = moment().format('YYYYMMDD_HHmm'); 
				const originalName = file_certificate.files[0].name;
				// Remove spaces/special chars from filename to avoid URL issues
				const cleanName = originalName.replace(/\s+/g, '_'); 
				const uniqueFileName = `${timestamp}_${cleanName}`;

				showAlert('⏳ กำลังอัปโหลดไฟล์... (Uploading...)', 'info');

				// Upload to MinIO (Make sure your query expects 'fileName' and 'fileData')
				await UploadToMinIO.run({ 
					fileName: uniqueFileName,
					fileData: file_certificate.files[0] 
				});

				// Set the path to save in DB
				filePath = 'leaves/' + uniqueFileName;
			}

			// Insert into Database
			await SubmitLeaveRequest.run({
				name: name,
				leave_type: leaveType,
				start_date: startDate,
				end_date: endDate,
				reason: reason,
				file_path: filePath,
				total_days: 0 // You might want to calculate this using moment.js diff
			});

			showAlert('✅ ส่งใบลาเรียบร้อย (Submitted Successfully)', 'success');

			// Close Modal or Reset Form
			resetWidget("Form1", true); 
			// closeModal("ModalName"); // Optional: if this is inside a modal

		} catch (error) {
			console.error(error);
			showAlert('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
		}
	}
} 