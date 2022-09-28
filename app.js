const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT_NUM = 3000;
// Middlewares to have access to the body
app.use(express.json());
app.use(morgan('dev'));

// My own middleware
app.use((req, res, next) => {
  console.log('Hello from my own middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

const getTour = (req, res) => {
  const tour = tours.find(tour => tour.id === +req.params.id);
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const addNewTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (+req.params.id > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'updated tour here',
    },
  });
};

const deleteTour = (req, res) => {
  if (+req.params.id > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

app.route('/api/v1/tours').get(getAllTours).post(addNewTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(PORT_NUM, () => {
  console.log(`App is running on port ${PORT_NUM}`);
});
