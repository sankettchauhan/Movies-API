const request = require("supertest");
const { Customer } = require("../../models/customer");
const { User } = require("../../models/user");

describe("/api/customers", () => {
  let server;
  let name;
  let isGold;
  let phone;
  let customerId;

  beforeEach(async () => {
    server = require("../../index");
  });

  afterEach(async () => {
    await server.close();
    await Customer.deleteMany({});
  });

  it("should start testing customers route", () => {});

  describe("POST /", () => {
    const exec = () =>
      request(server)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name, isGold, phone });

    beforeEach(async () => {
      name = "12345";
      isGold = true;
      phone = "1234567890";
      token = new User().generateAuthToken();
    });

    it("should return 400 if name is not valid", async () => {
      name = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if phone no is not valid", async () => {
      phone = "1";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if phone no is not valid", async () => {
      phone = "1";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 200 if request is valid", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });

  describe("PUT /", () => {
    // const exec = () =>
    //   request(server)
    //     .put(`/api/customers/${customerId}`)
    //     .send({ customerId, name, isGold, phone });
    // beforeEach(async () => {
    //   customerId = mongoose.Types.ObjectId();
    //   name = "12345";
    //   isGold = true;
    //   phone = "1234567890";
    //   const customer = new Customer({
    //     _id: customerId,
    //     name,
    //     isGold,
    //     phone,
    //   });
    //   await customer.save();
    // });
    // it("should return")
  });
});
