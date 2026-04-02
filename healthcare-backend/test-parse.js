const rawPayload = {"phoneNumber":"123","dateOfBirth":"","gender":"","address":"","aadhar":""};
const str = JSON.stringify(rawPayload);
let patientDetails = str;
if (typeof patientDetails === 'string') {
    patientDetails = JSON.parse(patientDetails);
}
const finalObj = {
    ...patientDetails,
    insuranceDetails: { ok: true },
    registeredByHospital: '123'
};
console.log(finalObj);
