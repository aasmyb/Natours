const app = require('./app');

const PORT_NUM = 3000;
app.listen(PORT_NUM, () => {
  console.log(`App is running on port ${PORT_NUM}`);
});
