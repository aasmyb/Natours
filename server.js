const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const PORT_NUM = process.env.PORT || 3000;
app.listen(PORT_NUM, () => {
  console.log(`App is running on port ${PORT_NUM}`);
});
