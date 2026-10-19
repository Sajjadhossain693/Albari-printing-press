import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(` AL-BARI PRESS & DIGITAL SIGN (আল-বারী প্রেস)`);
  console.log(` Server running on http://${HOST}:${PORT}`);
  console.log(` API endpoints available at http://${HOST}:${PORT}/api`);
  console.log(` Timezone: Asia/Dhaka | Currency: BDT (৳)`);
  console.log(`=======================================================`);
});
