import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` AL-BARI PRESS & DIGITAL SIGN (আল-বারী প্রেস)`);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` API endpoints available at http://localhost:${PORT}/api`);
  console.log(` Timezone: Asia/Dhaka | Currency: BDT (৳)`);
  console.log(`=======================================================`);
});
