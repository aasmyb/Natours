const fs = require('fs');
const express = require('express');
const app = express();
const PORT_NUM = 3000;
// Middleware to have access to the body
app.use(express.json());

// Testing express and postman
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'hello from the server side!', appName: 'Natours' });
// });
//
// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);
// Get all tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

// Get one tour
app.get('/api/v1/tours/:id', (req, res) => {
  const tour = tours.find(tour => tour.id === +req.params.id);
  if (!tour)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Add new tour
app.post('/api/v1/tours', (req, res) => {
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
});

// Update a tour
app.patch('/api/v1/tours/:id', (req, res) => {
  if (+req.params.id > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'updated tour here',
    },
  });
});

// Delete a tour
app.delete('/api/v1/tours/:id', (req, res) => {
  if (+req.params.id > tours.length)
    return res.status(404).json({ status: 'fail', message: 'Invalid id' });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

app.listen(PORT_NUM, () => {
  console.log(`App is running on port ${PORT_NUM}`);
});
