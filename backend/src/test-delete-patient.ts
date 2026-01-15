import { patientService } from './services/PatientService';

async function testDelete() {
  console.log('🗑️ DELETE TEST\n');
  
  // 🔥 PASTE YOUR PATIENT ID FROM CREATE TEST HERE:
  const patientId = 'b4c4be9e-efaf-4c1f-8065-902cbbcb1448';  // ← REPLACE THIS!
  
  try {
    // 1. Check before count
    const beforeCount = await patientService.getTotalPatientCount();
    console.log('📊 Before delete - Total patients:', beforeCount);

    // 2. DELETE the patient
    await patientService.deletePatient(patientId);
    console.log(`✅ DELETED patient: ${patientId}`);

    // 3. Verify it's gone
    const afterCount = await patientService.getTotalPatientCount();
    const stillExists = await patientService.getPatient(patientId);
    
    console.log('📊 After delete - Total patients:', afterCount);
    console.log('🔍 Patient still exists?', !!stillExists);
    console.log('✅ DELETE SUCCESS!');
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ DELETE FAILED:', error.message);
    } else {
      console.error('❌ DELETE FAILED:', error);
    }
  }
}

testDelete();
