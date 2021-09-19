const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const mongoose = require("mongoose");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await Genre.deleteMany({});
    await server.close();
  });

  it("should start testing genres", () => {});

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get("/api/genres")
        .set("x-auth-token", token);
      // console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return genre if valid id is passed", async () => {
      let genre = new Genre({ name: "genre1" });
      genre = await genre.save();
      const token = new User().generateAuthToken();

      const res = await request(server)
        .get(`/api/genres/${genre._id}`)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("genre1");
    });

    it("should return 404 if valid id is not passed", async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre with given id does not exist", async () => {
      const id = mongoose.Types.ObjectId();
      const token = new User().generateAuthToken();
      const res = await request(server)
        .get(`/api/genres/${id}`)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return 401 if user is not authenticated", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 3 characters", async () => {
      name = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 30 characters", async () => {
      name = new Array(32).join("a");
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();
      const genre = await Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let id;
    let genre;

    const exec = async () => {
      return await request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "genre1";
      id = mongoose.Types.ObjectId();
      genre = new Genre({ _id: id, name });
      genre = await genre.save();
    });

    afterEach(async () => {
      await Genre.deleteMany({});
    });

    it("should return 400 if genre is less than 3 characters", async () => {
      name = "a";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 30 characters", async () => {
      name = new Array(32).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if a valid id is not passed", async () => {
      id = 1;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre with given id does not exist", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should save the genre if it is valid", async () => {
      await exec();
      const genre = await Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });
});
