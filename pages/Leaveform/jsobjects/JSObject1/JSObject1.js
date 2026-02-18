export default {
  submitLeave: async () => {

    // --- 1. Get Values from Widgets ---
    const name = Input_username.text?.trim();
    const leaveType = Select_LeaveType.selectedOptionValue;
    const startDate = DatePicker_Start.selectedDate;
    const endDate = DatePicker_End.selectedDate;
    const reason = Input_Reason.text?.trim();

    // --- 2. General Validation ---
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      showAlert('⚠️ วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น', 'error');
      return;
    }

    // --- 3. Calculate Total Days ---
    const diffTime = end - start;
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // --- 4. File Validation (Sick Leave) ---
    const isSick = leaveType === 'sick';

    const hasFile =
      file_certificate.files &&
      Array.isArray(file_certificate.files) &&
      file_certificate.files.length > 0;

    if (isSick && !hasFile) {
      showAlert('⚠️ กรณีลาป่วย จำเป็นต้องแนบใบรับรองแพทย์', 'error');
      return;
    }

    // --- 5. Submission ---
    try {

      let filePath = '';

      if (hasFile) {

        // Generate safe timestamp filename
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:T]/g, '')
          .slice(0, 13);

        const originalName = file_certificate.files[0].name;
        const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

        const uniqueFileName = `${timestamp}_${cleanName}`;

        showAlert('⏳ กำลังอัปโหลดไฟล์...', 'info');

        await UploadToMinIO.run({
          fileName: uniqueFileName,
          fileData: file_certificate.files[0].data // use .data for base64
        });

        filePath = 'leaves/' + uniqueFileName;
      }

      // --- 6. Insert Database ---
      await SubmitLeaveRequest.run({
        name: name,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        file_path: filePath,
        total_days: totalDays
      });

      showAlert('✅ ส่งใบลาเรียบร้อย', 'success');
      resetWidget("Form1", true);
      navigateTo("LeaveHistory");

    } catch (error) {
      console.error("Submit Error:", error);
      showAlert('❌ เกิดข้อผิดพลาด: ' + (error?.message || 'Unknown error'), 'error');
    }
  }
}
