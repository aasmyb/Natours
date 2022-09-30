const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAdd: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Virtual property to calculate duration in weeks
tourSchema.virtual('durationWeeks').get(function () {
  return Math.ceil(this.duration / 7);
});
// Document middleware.
// Before .save and .create
tourSchema.pre('save', function (next) {
  // "this" refers to document
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
// Query middleware
tourSchema.pre(/^find/, function (next) {
  // "this" refers to query
  this.find({ secretTour: { $ne: true } });
  next();
});
// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  // "this" refers to query
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
