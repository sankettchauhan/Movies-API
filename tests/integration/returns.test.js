const { Rental } = require("../../models/rental");
const mongoose = require("mongoose");
const request = require("supertest");
const { User } = require("../../models/user");
const moment = require("moment");
const { Movie } = require("../../models/movie");

describe("POST /returns", () => {
  let server;
  let rental;
  let movie;
  let customerId;
  let movieId;
  let token;

  beforeEach(async () => {
    server = require("../../index");
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    rental = new Rental({
      customer: { _id: customerId, name: "12345", phone: "12345" },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });
    await rental.save();

    movie = new Movie({
      title: "12345",
      genre: { name: "12345" },
      numberInStock: 10,
      dailyRentalRate: 2,
      _id: movieId,
    });
    await movie.save();
  });
  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  it("should start testing returns", () => {});

  it("should return 401 if user is not authenticated", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if movieId is not provided", async () => {
    customerId = "";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    movieId = "";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if customerId is invalid", async () => {
    customerId = 1;
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is invalid", async () => {
    movieId = 1;
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 404 if movieId/customerId not found", async () => {
    await Rental.deleteMany({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it("should return 400 if rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if customerId/movieId is found", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it("should set the return date if rental is valid", async () => {
    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should return total rental rate", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    rental.save();

    const res = await exec();
    const rentalDays = rental.dateOut - rental.dateReturned;

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should increase the stock of the movie", async () => {
    await exec();
    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental if input is valid", async () => {
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie",
      ])
    );
  });
});
