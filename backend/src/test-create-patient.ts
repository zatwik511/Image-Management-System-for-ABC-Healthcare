import { patientService } from './services/PatientService';  // ✅ FIXED PATH

async function testCreate() {
  console.log('🆕 CREATE TEST\n');
  
  const patientData = {
    name: 'Jane Smith',
    address: '456 Wellness Ave, London',
    conditions: ['Asthma', 'Allergies']
  };

  try {
    const newPatient = await patientService.createPatient(patientData);
    console.log('✅ SUCCESS:', {
      id: newPatient.id,
      name: newPatient.name,
      createdAt: newPatient.createdAt
    });
    console.log('📊 Total patients:', await patientService.getTotalPatientCount());
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ CREATE FAILED:', error.message);
    } else {
      console.error('❌ CREATE FAILED:', error);
    }
  }
}

testCreate();
