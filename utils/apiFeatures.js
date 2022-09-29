class APIFeatures {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFilterFields = ['page', 'sort', 'limit', 'fields'];
    excludedFilterFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
    );
    this.query = this.model.find(queryStr);
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields() {
    const fields = this.queryString.fields
      ? this.queryString.fields.split(',').join(' ')
      : '-__v';
    this.query = this.query.select(fields);
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
