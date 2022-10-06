exports.getBase = (req, res, next) => {
  res.status(200).render('base', {
    title: 'Exciting tours for adventurous people',
    tour: 'Forest Hiker',
    user: 'Ashrouf',
  });
};

exports.getOverview = (req, res, next) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
};

exports.getTour = (req, res, next) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
};
