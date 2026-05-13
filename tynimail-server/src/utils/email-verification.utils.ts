import axios from "axios";

export async function verifyEmail(email: string) {
  const response = await axios.get(
    `https://api.millionverifier.com/api/v3/?api=${process.env.MILLION_VERIFIER_API_KEY}&email=${email}`
  );
  const status =  response.data;
  console.log(status);
  switch(status.resultcode){
    case 1:
        return { valid: true, reason: 'Valid email address' };
    case 2:
        return { valid: true, reason: 'Registration allowed but with caution' };
    case 3:
        return { valid: true, reason: 'Email provider unknown, but mailbox exists' };
    case 4:
        return { valid: false, reason: 'Email is invalid' };
    case 5:
        return { valid: false, reason: 'Email is disposable' };
    case 6:
        return {valid: false, reason: 'Email does not exist' };
    default:
        return { valid: false, reason: 'Unable to verify email at this time' };
  }
}